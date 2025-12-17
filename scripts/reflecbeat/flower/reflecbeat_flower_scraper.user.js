// ==UserScript==
// @name         REFLEC BEAT (Flower) Play History Scraper
// @version      1.2
// @description  Export REFLEC BEAT scores including full judgements and timestamps as JSON
// @match        https://projectflower.eu/game/rb/profile/*
// @match        https://eagle.ac/game/rb/profile/*
// @downloadUrl  https://github.com/pinapelz/Mirage/raw/refs/heads/main/scripts/reflecbeat/flower/reflecbeat_flower_scraper.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Add export button
    const btn = document.createElement('button');
    btn.textContent = 'Mirage Export Scores JSON';
    btn.style.position = 'fixed';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = 9999;
    btn.style.padding = '8px 12px';
    btn.style.background = '#4CAF50';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        const json = {
            meta: {
                game: "reflecbeat",
                playtype: "Single",
                service: "REFLEC BEAT Flower/Eagle Play History"
            },
            scores: parseScoreLog()
        };

        // Download JSON
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reflecbeat_scores.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    function parseScoreLog() {
        const rows = document.querySelectorAll('table.table tbody tr.accordion-toggle');
        const scores = [];

        rows.forEach(row => {
            const titleElem = row.querySelector('td.pnmTitle a');
            const artistElem = row.querySelector('td.pnmTitle small');
            const difficultyElem = row.querySelector('td.gradeHARD, td.gradeMEDIUM, td.gradeEASY');
            const levelElem = difficultyElem?.querySelector('strong');
            const lampElem = row.querySelector('td.rb-rank strong'); // Rank / Lamp
            const scoreText = row.querySelector('td.rb-rank span')?.innerText || '';
            const scoreMatch = scoreText.match(/(\d+(?:,\d+)*)\s*\((\d+(?:\.\d+)?)%\)/);
            const scoreNum = scoreMatch ? parseInt(scoreMatch[1].replace(/,/g, '')) : null;
            const scorePercent = scoreMatch ? parseFloat(scoreMatch[2]) : null;

            // Extract timestamp from <small> in last column
            const timestampElem = row.querySelector('td.hidden-from-mobile small');
            let timestamp = null;
            if (timestampElem) {
                const dateStr = timestampElem.innerText.trim(); // e.g., "2025-06-27 5:23 PM"
                timestamp = new Date(dateStr).getTime(); // Unix ms
            }

            // Get accordion ID
            const accordionId = row.getAttribute('data-target')?.replace('#', '');
            const accordion = document.getElementById(accordionId);

            // Initialize metadata
            let lifeLeft = '', justReflec = 0, just = 0, great = 0, good = 0, miss = 0;

            if (accordion) {
                const divs = accordion.querySelectorAll('div.col-sm-3, div.col-sm-2, div.col-sm-4');
                divs.forEach(div => {
                    const label = div.querySelector('strong')?.innerText.trim();
                    const value = div.childNodes[div.childNodes.length-1].nodeValue?.trim() || div.querySelector('a')?.innerText.trim() || '';
                    switch(label) {
                        case 'Life Left': lifeLeft = value; break;
                        case 'Just Reflec': justReflec = parseInt(value) || 0; break;
                        case 'Just': just = parseInt(value) || 0; break;
                        case 'Great': great = parseInt(value) || 0; break;
                        case 'Good': good = parseInt(value) || 0; break;
                        case 'Miss': miss = parseInt(value) || 0; break;
                    }
                });
            }

            scores.push({
                title: titleElem?.innerText.trim() || '',
                artist: artistElem?.innerText.trim() || '',
                difficulty: difficultyElem?.innerText.replace(levelElem?.innerText, '').trim() || '',
                level: levelElem ? parseInt(levelElem.innerText.trim()) : null,
                score: scoreNum,
                scorePercent,
                lamp: lampElem?.innerText.trim() || '',
                lifeLeft: parseInt(lifeLeft) || null,
                timestamp, // Unix ms
                judgements: { justReflec, just, great, good, miss }
            });
        });

        return scores;
    }

})();
