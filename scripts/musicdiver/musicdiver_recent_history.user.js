// ==UserScript==
// @name         Music Diver (MyPage) Recently Played Mirage Scraper
// @namespace    https://mypage.musicdiver.jp/
// @version      1.1
// @description  MUSIC DIVER My Page Recent History to Mirage import JSON
// @match        https://mypage.musicdiver.jp/record?view=history*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let mirage = {};
  let remappedData = [];

  async function fetchRecordHistory() {
    const url = "https://mypage.musicdiver.jp/api/record_history?lang=en";
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.responseCode !== 200) {
        console.error("Music Diver API error:", data.responseMessage);
        return;
      }

      const diffMap = {
        0: "EASY",
        1: "NORMAL",
        2: "HARD",
        3: "EXTREME",
      };

      remappedData = data.response.map((rec) => {
        const date = new Date(rec.created_at.replace(" ", "T") + "+09:00");
        const unixTime = date.getTime();

        // Determine lamp based on flag precedence
        let lamp = "FAILED";
        if (rec.clear_flag) lamp = "CLEAR";
        else if (rec.epic_flag) lamp = "EPIC";
        else if (rec.all_perfect_flag) lamp = "ALL PERFECT";
        else if (rec.full_combo_flag) lamp = "FULL COMBO";

        return {
          timestamp: unixTime,
          title: rec.music_title,
          artist: rec.artist_name,
          difficulty: diffMap[rec.difficulty_id] || "UNKNOWN",
          level: rec.level,
          score: rec.score,
          rank: rec.rank,
          lamp,
          judgements: {
            critical: rec.critical_num,
            perfect: rec.perfect_num,
            great: rec.great_num,
            good: rec.good_num,
            bad: rec.bad_num,
            miss: rec.miss_num,
          },
        };
      });

      mirage = {
        meta: {
          game: "musicdiver",
          playtype: "Single",
          service: "MUSIC DIVER My Page Recent History",
        },
        scores: remappedData,
      };

      console.log("🎵 Music Diver Records:", remappedData);
      console.log("Mirage export object:", mirage);

      showDownloadButton();
    } catch (err) {
      console.error("Error fetching Music Diver data:", err);
    }
  }

  function showDownloadButton() {
    // Avoid duplicates
    if (document.getElementById("md-download-json")) return;

    const btn = document.createElement("button");
    btn.id = "md-download-json";
    btn.textContent = "⬇️ Download Mirage Score JSON";
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "9999",
      padding: "10px 16px",
      background: "#1e90ff",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      transition: "background 0.2s",
    });

    btn.onmouseenter = () => (btn.style.background = "#0070f0");
    btn.onmouseleave = () => (btn.style.background = "#1e90ff");

    btn.addEventListener("click", () => {
      if (!remappedData.length) {
        alert("No data available yet. Try refreshing!");
        return;
      }
      const blob = new Blob([JSON.stringify(mirage, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "musicdiver_records.json";
      a.click();
      URL.revokeObjectURL(url);
    });

    document.body.appendChild(btn);
  }

  window.addEventListener("load", fetchRecordHistory);
})();
