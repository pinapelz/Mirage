// ==UserScript==
// @name         DANCERUSH STARDOM (Flower/Eagle) Play History Scraper + Artist
// @version      1.1
// @description  Export DANCERUSH scores including full judgements, timestamps, and fetched Artist names as JSON
// @match        https://eagle.ac/game/dancerush/profile/*
// @downloadUrl  https://github.com/pinapelz/Mirage/raw/refs/heads/main/scripts/dancerush/flower/dancerush_flower_scraper.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const artistCache = {};

    const btn = document.createElement('button');
    btn.textContent = 'Mirage Export Dancerush JSON';
    btn.style.position = 'fixed';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = 9999;
    btn.style.padding = '8px 12px';
    btn.style.background = '#00bcd4';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    document.body.appendChild(btn);

    btn.addEventListener('click', async () => {
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.style.background = '#9e9e9e';
        btn.textContent = 'Processing (Fetching Artists)...';

        try {
            const scores = await parseDancerushLog();
            const blob = new Blob([JSON.stringify(scores, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dancerush_scores_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Scraping failed:", error);
            alert("An error occurred while fetching song details. Check console.");
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.background = '#00bcd4';
        }
    });

    async function fetchArtistName(url) {
        if (!url) return "Unknown Artist";
        if (artistCache[url]) return artistCache[url];

        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Find the table row that contains "Song Artist"
            const rows = Array.from(doc.querySelectorAll('table.table tr'));
            const artistRow = rows.find(r => r.querySelector('th')?.innerText.includes('Song Artist'));
            const artistName = artistRow?.querySelector('td b')?.innerText.trim() || "Unknown Artist";

            artistCache[url] = artistName;
            return artistName;
        } catch (e) {
            console.warn(`Could not fetch artist for ${url}`, e);
            return "Unknown Artist";
        }
    }

    async function parseDancerushLog() {
        const rows = document.querySelectorAll('table.table tbody tr.accordion-toggle');
        const scores = [];
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            const titleElem = row.querySelector('td.text-right.text-middle strong');
            const diffElem = row.querySelector('td.success div strong');
            const scoreElem = row.querySelector('td:nth-child(4) strong');
            const lampElem = row.querySelector('td:nth-child(5) strong');
            const timestampElem = row.querySelector('td.text-right small');
            const songLink = row.querySelector('td.text-right.text-middle a')?.href || "";
            const artistName = await fetchArtistName(songLink);

            const targetId = row.getAttribute('data-target')?.replace('#', '');
            const detailContainer = document.getElementById(targetId);

            let judgements = { perfect: 0, great: 0, good: 0, bad: 0 };
            let maxCombo = 0;

            if (detailContainer) {
                const statDivs = detailContainer.querySelectorAll('div.col-sm-1');
                statDivs.forEach(div => {
                    const label = div.querySelector('strong')?.innerText.trim();
                    const value = parseInt(div.innerHTML.split('<br>')[1]) || 0;

                    if (label === 'Perfect') judgements.perfect = value;
                    if (label === 'Great') judgements.great = value;
                    if (label === 'Good') judgements.good = value;
                    if (label === 'Bad') judgements.bad = value;
                    if (label === 'Combo') maxCombo = value;
                });
            }

            const diffText = diffElem ? diffElem.innerText.trim().split(/\s+/) : ["UNKNOWN", "0"];
            const diffLamp = diffText[0];
            const difficultyLevel = parseInt(diffText[1]);
            const rawScorePercent = parseFloat(scoreElem?.innerText.trim()) || 0;
            const scoreInt = Math.round(rawScorePercent * 1000);

            let lampId = 4;
            if (lampElem?.innerText.includes("Full Combo")) lampId = 5;
            if (lampElem?.innerText.includes("Excellent")) lampId = 6;
            if (lampElem?.innerText.includes("Failed")) lampId = 1;

            let timestampMs = Date.now();
            if (timestampElem) {
                timestampMs = new Date(timestampElem.innerText.trim()).getTime();
            }

            scores.push({
                timestamp: timestampMs,
                lamp: lampId,
                score: scoreInt,
                title: titleElem?.innerText.trim() || "Unknown",
                artist: artistName,
                optional: {
                    maxCombo: maxCombo
                },
                diff_lamp: diffLamp,
                timestamp: timestampMs,
                difficulty: difficultyLevel,
                judgements: judgements,
                num_players: 1
            });
        }
        return {
          "meta": {
            "game": "dancerush",
            "playtype": "Single",
            "service": "FLOWER/EAGLE Dancerush Export",
          },
          "scores": scores
        };
    }
})();
