// ==UserScript==
// @name         Taiko EGTS to Mirage
// @namespace    http://tampermonkey.net/
// @version      2025-01-12
// @author       You
// @match        https://legacy.egts.ca/Users/*
// @match        http://localhost
// @icon         https://www.google.com/s2/favicons?sz=64&domain=egts.ca
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const DIFFICULTY_MAP = {
        "difficulty_Easy.webp": "EASY",
        "difficulty_Normal.webp": "NORMAL",
        "difficulty_Hard.webp": "HARD",
        "difficulty_Oni.webp": "ONI",
        "difficulty_UraOni.webp": "URA_ONI"
    };

    const CROWN_MAP = {
        "crown_None.webp": "NOT CLEAR",
        "crown_Gold.webp": "FULL COMBO",
        "crown_Clear.webp": "CLEAR",
        "crown_Dondaful.webp": "DONDERFUL COMBO",
    };

    const LAMP_MAP = {
        "rank_White.webp": "IKI 1",
        "rank_Bronze.webp": "IKI 2",
        "rank_Silver.webp": "IKI 3",
        "rank_Gold.webp": "MIYABI 1",
        "rank_Sakura.webp": "MIYABI 2",
        "rank_Purple.webp": "MIYABI 3",
        "rank_Dondaful.webp": "KIWAMI",
    };

    function waitForAppAndInject() {
        // Wait until Blazor app actually loads DOM elements
        const appRoot = document.querySelector(".mud-table, #app, .scoreCard");
        if (appRoot) {
            if (!document.getElementById("egts-export-btn")) createButton();
        } else {
            setTimeout(waitForAppAndInject, 1000);
        }
    }

    function createButton() {
        const btn = document.createElement("button");
        btn.id = "egts-export-btn";
        btn.textContent = "Export Taiko EGTS → Mirage";
        Object.assign(btn.style, {
            position: "fixed",
            bottom: "10px",
            right: "10px",
            zIndex: 99999,
            padding: "10px 14px",
            background: "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
        });
        btn.onclick = exportData;
        document.body.appendChild(btn);
        console.log("[EGTS Exporter] Button added to page.");
    }

    function parseTimestamp(dateString) {
        const date = new Date(dateString + ' GMT');
        return date.getTime();
    }

    function exportData() {
        const langConfirm = confirm("Before exporting, please confirm:\n\nIs your song language setting configured correctly in EGTS?\n\nClick OK to proceed with export, or Cancel to check your language settings first.");

        if (!langConfirm) {
            return;
        }

        const results = [];
        const tables = document.querySelectorAll(".mud-table.mud-table-outlined.tagged-toolbar");
        console.log(`Found ${tables.length} tables`);

        tables.forEach((table, tableIndex) => {
            const toolbar = table.querySelector('.mud-toolbar .mud-typography-body1');
            let timestamp = 0;
            if (toolbar) {
                const timestampText = toolbar.textContent?.trim();
                if (timestampText) {
                    timestamp = parseTimestamp(timestampText);
                    console.log(`Table ${tableIndex}: Timestamp "${timestampText}" -> ${timestamp}`);
                }
            }

            const rows = table.querySelectorAll("tr.mud-table-row");
            console.log(`Table ${tableIndex}: Found ${rows.length} rows`);

            rows.forEach((row, rowIndex) => {
                if (row.closest('thead')) return;

                const cells = row.querySelectorAll('td.mud-table-cell');
                if (cells.length < 5) return; // Skip if not enough columns

                console.log(`Table ${tableIndex}, Row ${rowIndex}:`, cells.length, 'cells');

            const songCell = cells[0];
            const titleElement = songCell.querySelector('p.mud-typography-body2');
            const artistElement = songCell.querySelector('span.mud-typography-caption');

            const title = titleElement?.textContent?.trim() || "";
            const artist = artistElement?.textContent?.trim() || "";

            console.log(`Table ${tableIndex}, Row ${rowIndex}: Title="${title}", Artist="${artist}"`);
            let difficulty = null;
            const difficultyImage = songCell.querySelector('svg image[href*="difficulty_"]');
            if (difficultyImage) {
                const href = difficultyImage.getAttribute('href');
                const difficultyFile = href.split('/').pop();
                difficulty = DIFFICULTY_MAP[difficultyFile] || null;
            }

            let level = null;
            if (cells[3]) {
                const levelElement = cells[3].querySelector('span.mud-typography-caption');
                if (levelElement) {
                    const levelText = levelElement.textContent?.trim();
                    level = levelText ? parseInt(levelText) : null;
                }
            }

            let score = null;
            if (cells[4]) {
                const scoreText = cells[4].textContent?.replace(/[^\d]/g, "");
                score = scoreText ? parseInt(scoreText) : null;
            }

            let crown = null;
            if (cells[5]) {
                const crownImage = cells[5].querySelector('img[src*="crown_"]');
                if (crownImage) {
                    const src = crownImage.src;
                    const crownFile = src.split('/').pop();
                    crown = CROWN_MAP[crownFile] || null;
                }
            }

            let lamp = null;
            if (cells[6]) {
                const rankImage = cells[6].querySelector('img[src*="rank_"]');
                if (rankImage) {
                    const src = rankImage.src;
                    const rankFile = src.split('/').pop();
                    lamp = LAMP_MAP[rankFile] || null;
                }
            }

            let good = null, ok = null, bad = null;
            if (cells[7]) {
                const goodText = cells[7].textContent?.trim();
                good = goodText ? parseInt(goodText) : null;
            }
            if (cells[8]) {
                const okText = cells[8].textContent?.trim();
                ok = okText ? parseInt(okText) : null;
            }
            if (cells[9]) {
                const badText = cells[9].textContent?.trim();
                bad = badText ? parseInt(badText) : null;
            }

            let drumroll = null, maxCombo = null;
            if (cells[10]) {
                const drumrollText = cells[10].textContent?.trim();
                drumroll = drumrollText ? parseInt(drumrollText) : null;
            }
            if (cells[11]) {
                const maxComboText = cells[11].textContent?.trim();
                maxCombo = maxComboText ? parseInt(maxComboText) : null;
            }

            console.log(`Table ${tableIndex}, Row ${rowIndex}: Difficulty="${difficulty}", Level=${level}, Score=${score}, Crown="${crown}", Lamp="${lamp}"`);
            console.log(`Table ${tableIndex}, Row ${rowIndex}: Good=${good}, OK=${ok}, Bad=${bad}, Drumroll=${drumroll}, MaxCombo=${maxCombo}`);

            const result = {
                title,
                timestamp,
                artist,
                difficulty,
                level,
                crown_rank: crown,
                score_rank: lamp,
                score,
                judgements: {
                    good: good,
                    ok: ok,
                    bad: bad
                },
                optional: {
                    pound: drumroll,
                    combo: maxCombo
                }
            };

            if (title) {
                results.push(result);
                console.log(`Added score for: ${title}`);
            }
            });
        });

        console.log(`Extracted ${results.length} scores`);

        if (results.length === 0) {
            alert("No scores found. Please make sure you're on a page with score data.");
            return;
        }

        const exportObj = {
            meta: {
                game: "taiko",
                playtype: "Single",
                service: "EGTS Play History Export"
            },
            scores: results
        };

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mirage_egts_export.json";
        a.click();
        URL.revokeObjectURL(url);

        alert(`Successfully exported ${results.length} scores!`);
    }

    waitForAppAndInject();
})();
