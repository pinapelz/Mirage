// ==UserScript==
// @name         Nostalgia (Flower) Play History Scraper
// @version      1.0
// @description  Scrapes scores from Flower's Nostalgia page and converts to Mirage
// @author       Meta-link
// @match        https://projectflower.eu/game/nostalgia/*
// @match        https://eagle.ac/game/rb/profile/*
// @downloadUrl  https://github.com/pinapelz/Mirage/raw/refs/heads/main/scripts/nostalgia/flower/nostalgia_flower_scraper.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let mirage = {};
    const scores = [];

    // Create progress bar container
    const progressContainer = document.createElement("div");
    progressContainer.style.position = "fixed";
    progressContainer.style.top = "50px";
    progressContainer.style.left = "50%";
    progressContainer.style.transform = "translateX(-50%)";
    progressContainer.style.width = "50%";
    progressContainer.style.background = "#eee";
    progressContainer.style.border = "1px solid #ccc";
    progressContainer.style.borderRadius = "4px";
    progressContainer.style.zIndex = 9999;
    progressContainer.style.display = "none";

    const progressBar = document.createElement("div");
    progressBar.style.width = "0%";
    progressBar.style.height = "20px";
    progressBar.style.background = "#28a745";
    progressBar.style.borderRadius = "4px";
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);

    function updateProgress(current, total) {
        progressContainer.style.display = "block";
        const percent = Math.round((current / total) * 100);
        progressBar.style.width = percent + "%";
        progressBar.textContent = `${current} / ${total} songs`;
    }

    // Parse judgements from details row
    function parseJudgements(detailsRow) {
        const judgements = {};
        const optional = {};
        const cols = detailsRow.querySelectorAll("div.col-sm-2");
        cols.forEach(col => {
            const labelElem = col.querySelector("strong");
            if (!labelElem) return;

            const label = labelElem.textContent.replace(/\s/g, "");
            const valueText = labelElem.nextSibling?.textContent?.trim() || col.textContent.replace(labelElem.textContent, "").trim();

            if (label === "◆Just") judgements.marvelous = Number(valueText) || 0;
            else if (label === "Just") judgements.just = Number(valueText) || 0;
            else if (label === "Good") judgements.good = Number(valueText) || 0;
            else if (label === "Near") judgements.near = Number(valueText) || 0;
            else if (label === "Miss") judgements.miss = Number(valueText) || 0;
            else if (label === "Fast/Slow" || label === "Fast/Slow") {
                const parts = valueText.split("/").map(x => Number(x.trim()));
                optional.fast = parts[0] || 0;
                optional.slow = parts[1] || 0;
            }
        });
        return { judgements, optional };
    }

    // Fetch artist from song page
    async function getArtistFromLink(link) {
        try {
            const res = await fetch(link);
            const text = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const ths = doc.querySelectorAll("th");
            for (let th of ths) {
                if (th.textContent.trim() === "Song Artist") {
                    const td = th.nextElementSibling;
                    if (td) return td.textContent.trim();
                }
            }
        } catch (e) {
            console.error("Error fetching artist from", link, e);
        }
        return "";
    }

    // Parse the Nostalgia score table
    async function parseNostalgia() {
        const scoreLines = document.querySelectorAll(".table > tbody:nth-child(3) > tr");
        const songs = Array.from(scoreLines).filter(row => row.classList.contains("accordion-toggle"));
        const totalSongs = songs.length;

        for (let i = 0; i < songs.length; i++) {
            const row = songs[i];

            // Title and song link
            const songLinkElem = row.querySelector("td:nth-child(2) > a");
            const title = songLinkElem.querySelector("strong").textContent.trim();
            const songLink = songLinkElem.href;

            // Fetch artist from song page
            const artist = await getArtistFromLink(songLink);

            // Chart info: difficulty + level
            const chartCell = row.querySelector("td:nth-child(3)").textContent.trim();
            let difficulty = "Unknown";
            let level = 0;
            const match = chartCell.match(/([A-Za-z]+)\s*(\d+)/);
            if (match) {
                difficulty = match[1];
                level = Number(match[2]);
            }

            // Score
            const score = parseInt(row.querySelector("td:nth-child(4) small").textContent.replaceAll(',', ''));

            // Lamp
            const lamp = row.querySelector("td:nth-child(5) strong").textContent.trim();

            // Time achieved
            const timeTxt = row.querySelector("td:nth-child(6) small").textContent.trim();
            const timeAchieved = new Date(timeTxt).getTime();

            // Judgements
            const detailsRow = scoreLines[i * 2 + 1].querySelector("div[style*='padding: 5px']");
            const { judgements, optional } = parseJudgements(detailsRow);

            scores.push({
                title: title,
                artist: artist,
                difficulty: difficulty,
                level: level,
                score: score,
                lamp: lamp,
                timestamp: timeAchieved,
                judgements: judgements,
                optional: optional
            });

            updateProgress(i + 1, totalSongs);
        }

        progressContainer.style.display = "none";
        exportScores();
    }

    // Export scores as JSON
    function exportScores() {
        mirage = {
            meta: {
                game: "nostalgia",
                playtype: "Single",
                service: "NOSTALGIA Flower Play History",
            },
            scores: scores,
        };

        const blob = new Blob([JSON.stringify(mirage, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nostalgia_scores.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert(`Exported ${scores.length} scores!`);
    }

    // Add export button
    const button = document.createElement("button");
    button.textContent = "Export Nostalgia Scores MIRAGE";
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = 9999;
    button.style.padding = "8px 12px";
    button.style.background = "#007bff";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.onclick = parseNostalgia;
    document.body.appendChild(button);

})();
