// ==UserScript==
// @name         DANCEAROUND (e-amusement) Recently Played Mirage Scraper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  DANCEAROUND e-amusement site to Mirage import JSON
// @match        https://p.eagate.573.jp/game/around/1st/playdata/index.html*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
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

    function getDifficulty(fumen, songData) {
        let difficulty, lamp;

        switch (fumen) {
            case "ADVANCED":
                difficulty = songData?.ADVANCED?.level || 0;
                lamp = "ADVANCED";
                break;
            case "BASIC":
                difficulty = songData?.BASIC?.level || 0;
                lamp = "BASIC";
                break;
            case "MASTER":
                difficulty = songData?.MASTER?.level || 0;
                lamp = "MASTER";
                break;
            default:
                difficulty = 0;
                lamp = fumen;
                break;
        }

        return { difficulty, lamp };
    }
    function getLampText(status) {
        switch (status) {
            case 0:
                return "C";
            case 1:
                return "B";
            case 2:
                return "A";
            case 3:
                return "AA";
            case 4:
                return "AAA";
            case 5:
                return "AAA+";
        }
    }

    function getClearStatusText(status){
      switch(status){
        case 1:
          return "FAILURE";
        case 2:
          return "PASSED";
        case 3:
          return "FULL COMBO";
        case 4:
          return "EXC";
      }
    }

    async function fetchAndDownload() {
        const url = "https://p.eagate.573.jp/game/around/1st/json/pdata_getdata.html";
        const payload = new URLSearchParams({
            service_kind: "play_hist",
            pdata_kind: "play_hist",
        });

        try {
            const response = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: payload.toString(),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const play_hist = data.data.easite_get_playerdata.music_hist.music;
            const song_db = data.data.easite_get_playerdata.mdb;
            let mirage = {
                meta: {
                    game: "dancearound",
                    playtype: "Single",
                    service: "e-amusement PLAY HISTORY",
                },
            };
            const remappedList = play_hist.map((entry) => {
                const level = getDifficulty(entry.fumen_type, song_db[entry.music_id].fumens)
                return {
                    title: song_db[entry.music_id].title_name,
                    artist: song_db[entry.music_id].artist_name,
                    level: level.difficulty,
                    score: entry.score,
                    lamp: getLampText(entry.rank),
                    clear_status: getClearStatusText(entry.clear_status),
                    difficulty: level.lamp,
                    timestamp: entry.play_date,
                    judgements: {
                        "perfect": entry.perfect,
                        "great": entry.great,
                        "good": entry.good,
                        "bad": entry.bad
                    },
                    optional: {
                        maxCombo: entry.combo,
                    }

                };
            });
            mirage.scores = remappedList;
            console.log("Final mirage object:", mirage);

            const blob = new Blob([JSON.stringify(mirage, null, 2)], {
                type: "application/json",
            });

            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "dancearound_scores_mirage_import.json";
            a.click();
            console
        } catch (err) {
            console.error("Fetch/download error:", err);
            alert("Failed to fetch or process JSON. See console for details.");
        }
    }

    waitFor("#id_ctpl_body")
        .then((container) => {
        const btn = document.createElement("button");
        btn.textContent = "📥 DOWNLOAD PLAY HISTORY SCORE JSON";
        btn.style.cssText = `
      margin: 10px; padding: 8px 12px;
      font-size: 14px; cursor: pointer;
      background: #2563eb; color: white;
      border: none; border-radius: 6px;
      z-index: 9999;
    `;
        btn.onclick = fetchAndDownload;

        container.prepend(btn);
    })
        .catch((err) => console.warn("Could not inject button:", err));
})();
