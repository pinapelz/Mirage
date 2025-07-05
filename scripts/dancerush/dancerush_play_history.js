// ==UserScript==
// @name         DANCERUSH Mirage Scraper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  DANCERUSH e-amusement site to Mirage import JSON
// @match        https://p.eagate.573.jp/game/dan/1st/playdata/entrance.html*
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

    function getDifficulty(fumen, mdb) {
        let difficulty, lamp;

        switch (fumen) {
            case "1a":
                difficulty = mdb.fumen_1a.difnum;
                lamp = "NORMAL";
                break;
            case "1b":
                difficulty = mdb.fumen_1b.difnum;
                lamp = "EASY";
                break;
            case "2a":
                difficulty = mdb.fumen_2a.difnum;
                lamp = "NORMAL";
                break;
            case "2b":
            default:
                difficulty = mdb.fumen_2b.difnum;
                lamp = "EASY";
                break;
        }

        return { difficulty, lamp };
    }

    function getCorrectPlayerJudgements(player_code, score_data){
        if(!score_data.p2){
            return score_data.p1;
        }
        if(player_code === score_data.p1.member_code){
            return score_data.p1;
        }
        else{
            return score_data.p2;
        }
    }


    async function fetchAndDownload() {
        const url = "https://p.eagate.573.jp/game/dan/1st/json/pdata_getdata.html";
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
                    game: "DANCERUSH STARDOM",
                    playtype: "Single",
                    service: "e-amusement PLAY HISTORY",
                },
            };
            const remappedList = play_hist.map((entry) => {
                const p_judgements = getCorrectPlayerJudgements(data.data.easite_get_playerdata.userid.code, entry)
                const diff = getDifficulty(entry.music_type, song_db[entry.music_id].difficulty)
                return {
                    title: song_db[entry.music_id].info.title_name,
                    artist: song_db[entry.music_id].info.artist_name,
                    diff_lamp: diff.lamp,
                    score: entry.score,
                    lamp: entry.rank,
                    difficulty: diff.difficulty,
                    timestamp: entry.lastplay_date,
                    judgements: {
                        "perfect": p_judgements.perfect,
                        "great": p_judgements.great,
                        "good": p_judgements.good,
                        "bad": p_judgements.bad
                    },
                    optional: {
                        maxCombo: entry.combo,
                    }

                };
            });
            mirage.scores = remappedList;

            const blob = new Blob([JSON.stringify(mirage, null, 2)], {
                type: "application/json",
            });

            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "dancerush_scores_mirage_import.json";
            a.click();
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
