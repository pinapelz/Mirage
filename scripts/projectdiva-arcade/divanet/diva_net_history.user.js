// ==UserScript==
// @name         PDAFT (DIVA.NET) Mirage Scraper
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Scrape DIVA.NET play history (pages 1–20) into Mirage JSON
// @match        https://project-diva-ac.net/divanet/personal/playHistory/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    // --- Utility: wait for selector ---
    function waitFor(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const interval = 300;
            let waited = 0;
            const check = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                waited += interval;
                if (waited >= timeout) return reject(`Timeout: ${selector}`);
                setTimeout(check, interval);
            };
            check();
        });
    }

    // --- Fetch artist name from info page ---
    async function getArtistFromInfoPage(url) {
        try {
            const res = await fetch(url, { credentials: "include" });
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, "text/html");
            const rows = Array.from(doc.querySelectorAll("table tr"));
            for (const row of rows) {
                const label = row.querySelector("td:first-child font");
                const value = row.querySelector("td:last-child font");
                if (label && value && label.textContent.includes("作曲者")) {
                    return value.textContent.trim();
                }
            }
            return null;
        } catch {
            return null;
        }
    }

    // --- Parse a single page ---
    async function parsePlayHistoryPage(html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const center = doc.querySelector(".center_middle");
        if (!center) return null;

        const findFont = (keyword) =>
            Array.from(center.querySelectorAll("font")).find((f) =>
                f.textContent && f.textContent.includes(keyword)
            );

        const getTextAfterLabel = (keyword) => {
            const font = findFont(keyword);
            if (!font) return null;

            let node = font.nextSibling;
            const parts = [];
            let scanned = 0;

            while (node && scanned < 20) {
                scanned++;
                if (node.nodeType === Node.TEXT_NODE) {
                    const txt = node.textContent.replace(/\s+/g, " ").trim();
                    if (txt) parts.push(txt);
                    node = node.nextSibling;
                    continue;
                }
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (["BR", "HR"].includes(node.tagName)) {
                        node = node.nextSibling;
                        continue;
                    }
                    if (node.tagName === "FONT" && /\[.*\]/.test(node.textContent)) break;

                    const txt = node.textContent.replace(/\s+/g, " ").trim();
                    if (txt) parts.push(txt);
                    node = node.nextSibling;
                    continue;
                }
                node = node.nextSibling;
            }
            return parts.join(" ").trim() || null;
        };

        const entry = {};

        // --- Timestamp ---
        const datetimeRaw = getTextAfterLabel("日時") || "";
        const dtMatch = datetimeRaw.match(/(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
        if (dtMatch) {
            const [_, yy, mm, dd, hh, min] = dtMatch.map(Number);
            const fullYear = 2000 + yy;
            const timestamp = Date.UTC(fullYear, mm - 1, dd, hh - 9, min, 0);
            entry.timestamp = timestamp;
        } else entry.timestamp = null;

        // --- Title & Artist ---
        const a = center.querySelector("a[href*='/divanet/pv/info/']");
        if (a) {
            entry.title = a.textContent.trim();
            const songInfoUrl = new URL(a.getAttribute("href"), location.origin).href;
            entry.artist = await getArtistFromInfoPage(songInfoUrl);
        } else {
            entry.title = getTextAfterLabel("曲名");
            entry.artist = null;
        }

        // --- Difficulty ---
        const diffRaw = getTextAfterLabel("難易度") || "";
        const diffMatch = diffRaw.match(/([A-Zぁ-んァ-ン一-龯]+)\s*★?\s*([\d.]+)/i);
        if (diffMatch) {
            entry.diff_lamp = diffMatch[1].trim().toUpperCase();
            entry.difficulty = parseFloat(diffMatch[2]);
        } else {
            entry.diff_lamp = diffRaw.trim();
            entry.difficulty = null;
        }

        // --- Clear rank ---
        entry.lamp = (getTextAfterLabel("CLEAR RANK") || "").trim();

        // --- Achievement ---
        const achRaw = getTextAfterLabel("達成率") || "";
        const achNum = (achRaw.match(/[\d.]+/) || [null])[0];
        entry.achievement = achNum ? parseFloat(achNum) : null;

        // --- Score ---
        const scoreRaw = getTextAfterLabel("SCORE") || "";
        const scoreDigits = (scoreRaw.match(/(\d+)/) || [null])[0];
        entry.score = scoreDigits ? parseInt(scoreDigits, 10) : null;

        // --- Judgements ---
        entry.judgements = {};
        const table = center.querySelector("table");
        if (table) {
            const rows = Array.from(table.querySelectorAll("tr"));
            for (let i = 0; i < rows.length; i++) {
                const text = rows[i].textContent.replace(/\s+/g, " ").trim();
                const val = parseInt((text.match(/(\d+)/) || [0])[0], 10);
                if (/COOL/i.test(text)) entry.judgements.cool = val;
                else if (/FINE/i.test(text)) entry.judgements.fine = val;
                else if (/SAFE/i.test(text)) entry.judgements.safe = val;
                else if (/SAD/i.test(text)) entry.judgements.sad = val;
                else if (/WORST|WRONG/i.test(text)) entry.judgements.worst = val;
                else if (/COMBO/i.test(text))
                    entry.maxCombo = parseInt((text.match(/(\d+)/g) || []).pop() || "0", 10);
            }
        }

        entry.judgements = {
            cool: entry.judgements.cool ?? 0,
            fine: entry.judgements.fine ?? 0,
            safe: entry.judgements.safe ?? 0,
            sad: entry.judgements.sad ?? 0,
            worst: entry.judgements.worst ?? 0,
        };
        entry.maxCombo = entry.maxCombo ?? 0;

        return entry;
    }

    // --- Fetch all pages (1–20) ---
    async function fetchAllPages(progressBar) {
        const scores = [];
        for (let i = 1; i <= 20; i++) {
            const url = `https://project-diva-ac.net/divanet/personal/playHistoryDetail/${i}/0`;
            try {
                progressBar.style.width = `${(i / 20) * 100}%`;
                console.log(`Fetching page ${i}...`);
                const response = await fetch(url, { credentials: "include" });
                if (!response.ok) continue;
                const html = await response.text();
                const parsed = await parsePlayHistoryPage(html);
                if (parsed && parsed.title) scores.push(parsed);
            } catch (e) {
                console.warn(`Failed to fetch page ${i}:`, e);
            }
        }
        progressBar.style.width = "100%";
        return scores;
    }

    // --- Fetch & Download all as JSON ---
    async function fetchAndDownload() {
        try {
            const progressContainer = document.createElement("div");
            progressContainer.style.cssText = `
                width: 200px;
                height: 20px;
                background: #eee;
                border-radius: 10px;
                overflow: hidden;
                margin: 10px;
            `;

            const progressBar = document.createElement("div");
            progressBar.style.cssText = `
                width: 0%;
                height: 100%;
                background: #2563eb;
                transition: width 0.3s ease;
            `;

            progressContainer.appendChild(progressBar);
            document.querySelector(".center").prepend(progressContainer);

            const scores = await fetchAllPages(progressBar);
            console.log(`Fetched ${scores.length} entries.`);

            const mirage = {
                meta: {
                    game: "diva",
                    playtype: "Single",
                    service: "DIVA.NET PLAY HISTORY",
                },
                scores: scores,
            };

            const blob = new Blob([JSON.stringify(mirage, null, 2)], {
                type: "application/json",
            });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "divanet_scores_mirage_import.json";
            a.click();

            setTimeout(() => progressContainer.remove(), 1000);
        } catch (err) {
            console.error("Error during fetch/download:", err);
            alert("Error while scraping pages — see console for details.");
        }
    }

    // --- Inject button ---
    waitFor(".center")
        .then((container) => {
            const btn = document.createElement("button");
            btn.textContent = "📥 DOWNLOAD PLAY HISTORY SCORE JSON";
            btn.style.cssText = `
                margin: 10px;
                padding: 8px 12px;
                font-size: 14px;
                cursor: pointer;
                background: #2563eb;
                color: white;
                border: none;
                border-radius: 6px;
                z-index: 9999;
                position: relative;
            `;
            btn.onclick = fetchAndDownload;
            container.prepend(btn);
        })
        .catch((err) => console.warn("Could not inject button:", err));
})();
