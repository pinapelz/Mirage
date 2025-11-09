import React from "react";
import {Link} from "react-router";
import { globalSkipKeys } from "../../types/constants";
import type {Score, ScoreDisplayProps} from "../../types/game";
import SHA1 from "crypto-js/sha1";
import easyImg from "../../assets/games/diva/easy.webp";
import normalImg from "../../assets/games/diva/normal.webp";
import hardImg from "../../assets/games/diva/hard.webp";
import extremeImg from "../../assets/games/diva/extreme.webp";
import ex_extremeImg from "../../assets/games/diva/ex_extreme.webp";
import standardImg from "../../assets/games/diva/standard.webp";
import misstakeImg from "../../assets/games/diva/misstake.webp";
import perfectImg from "../../assets/games/diva/perfect.webp";
import greatImg from "../../assets/games/diva/great.webp";
import excellentImg from "../../assets/games/diva/excellent.webp";


const DivaScoreDisplay: React.FC<ScoreDisplayProps> = ({
  scores,
  viewMode,
  sortField,
  sortDirection,
  onSort,
  onDelete,
  showUsername = false,
  hideTitleArtist = false,
}) => {
  // Key mappings for better display names. Hit or miss
  const keyDisplayNames: Record<string, string> = {
    title: "Title",
    artist: "Artist",
    score: "SCORE",
    difficulty: "Difficulty Rating",
    lamp: "CLEAR RANK",
    diff_lamp: "Chart Difficulty",
    timestamp: "Date",
    sad: "Sad",
    cool: "Cool",
    fine: "Fine",
    safe: "Safe",
    worst: "Worst",
    judgements: "Judgements",
    maxCombo: "Max Combo",
    username: "Username",
  };

  const mainStatKeys = [
    "score",
    "difficulty",
    "lamp",
    "diff_lamp",
  ];
  const expandableKeys = ["judgements", "optional"];
  const gameParam = new URLSearchParams(window.location.search).get("game") || "diva";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return "N/A";

    // Handle timestamps
    if (key === "timestamp" || key === "date") {
      if(value === 0)
        return "N/A";
      const date = new Date(typeof value === "number" ? value : value);
      return date.toLocaleDateString();
    }

    if(key === "difficulty"){
      return  "★ " + value.toString();
    }

    if(key === "achievement"){
      return value.toString() + "%";
    }

    if (typeof value === "number") {
      if (key === "score" || key === "maxCombo" || key === "combo") {
        return value.toLocaleString();
      }
      return value.toString();
    }

    return String(value);
  };

  const getDisplayName = (key: string): string => {
    return keyDisplayNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const renderValue = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    key: string,
    compact: boolean = false,
  ): React.ReactElement => {
    if (value === null || value === undefined)
      return <span className="text-slate-500">N/A</span>;

    // Handle judgements specially
    if (key === "judgements" && typeof value === "object") {
      const judgementEntries = Object.entries(value);


      if (compact) {
        return (
          <div className="text-xs text-slate-300 space-y-1">
            {judgementEntries.map(([jKey, jValue]) => (
              <div key={jKey} className="flex justify-between">
                <span className="text-slate-400 capitalize">
                  {getDisplayName(jKey)}:
                </span>
                <span className="font-medium">{formatValue(jValue, jKey)}</span>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 text-xs">
          {judgementEntries.map(([jKey, jValue]) => (
            <span
              key={jKey}
              className="bg-slate-700/50 text-slate-200 px-2 py-1 rounded-full border border-slate-600"
            >
              <span className="capitalize">{getDisplayName(jKey)}</span>:{" "}
              {formatValue(jValue, jKey)}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey} className="flex justify-between text-xs">
              <span className="text-slate-400">{getDisplayName(subKey)}:</span>
              <span className="font-medium">
                {formatValue(subValue, subKey)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if(key === "diff_lamp"){
      let imgSrc = null;
      switch (value) {
        case "EASY":
          imgSrc = easyImg;
          break;
        case "NORMAL":
          imgSrc = normalImg;
          break;
        case "HARD":
          imgSrc = hardImg;
          break;
        case "EXTRME":
          imgSrc = extremeImg;
          break;
        case "EX EXTRME":
          imgSrc = ex_extremeImg;
          break;
        default:
          imgSrc = standardImg;
          break;
      }
      return <span>
        <img src={imgSrc} alt={value} />
      </span>;
    }

    if(key === "lamp"){
      let imgSrc = null;
      switch (value){
        case "NOT CLEAR":
          imgSrc = misstakeImg;
          break;
        case "STANDARD":
          imgSrc = standardImg;
          break;
        case "GREAT":
          imgSrc = greatImg;
          break;
        case "PERFECT":
          imgSrc = perfectImg;
          break;
        case "EXCELLENT":
          imgSrc = excellentImg;
          break;
        default:
          imgSrc = standardImg;
          break;
      }
      return <span>
        <img src={imgSrc} alt={value} className="w-4xl" />
      </span>;
    }


    return <span>{formatValue(value, key)}</span>;
  };

  const getScoreEntries = (score: Score) => {
    const entries = Object.entries(score).filter(
      ([key]) => !globalSkipKeys.includes(key),
    );

    const mainStats = entries.filter(([key]) => mainStatKeys.includes(key));
    const expandable = entries.filter(([key]) => expandableKeys.includes(key));
    const others = entries.filter(
      ([key]) =>
        !mainStatKeys.includes(key) &&
        !expandableKeys.includes(key) &&
        key !== "timestamp" &&
        key !== "title" &&
        key !== "artist"
    );

    return {
      mainStats,
      expandable,
      others,
      timestamp: score.timestamp,
    };
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <span className="text-slate-500">↕</span>;
    }
    return sortDirection === "asc" ? (
      <span className="text-violet-400">↑</span>
    ) : (
      <span className="text-violet-400">↓</span>
    );
  };

  const sortedScores = [...scores].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    let comparison = 0;

    if (typeof aVal === "string" && typeof bVal === "string") {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === "number" && typeof bVal === "number") {
      comparison = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Get all possible keys for table headers
  const allKeys = Array.from(
    new Set(scores.flatMap((score) => Object.keys(score))),
  ).filter((key) => !globalSkipKeys.includes(key));

  // Prioritize important keys for table display
  const tableKeys = [
    ...(hideTitleArtist ? [] : ["title", "song", "artist"]),
    ...(showUsername ? ["username"] : []),
    "score",
    "difficulty",
    "lamp",
    "diff_lamp",
    "rating",
    "percent",
    "grade",
    "judgements",
    "maxCombo",
    "combo",
    "num_players",
    "timestamp",
  ].filter((key) => allKeys.includes(key));

  // Add actions column if delete function is provided
  const showActions = onDelete && viewMode === "table";

  if (scores.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-slate-400 text-2xl">🎵</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          No scores found
        </h3>
        <p className="text-slate-500">Import some score data to get started!</p>
      </div>
    );
  }

  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedScores.map((score, index) => {
          const chartIdHash = SHA1(`${gameParam}${score.title}${score.artist}`).toString();
          const { mainStats, expandable, timestamp } =
            getScoreEntries(score);
          return (
            <div
              key={score.id || index}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
            >
              {/* Primary Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  {!hideTitleArtist && (
                    <Link to={`/chart?chartId=${chartIdHash}&game=${gameParam}`}>
                      <h3 className="text-lg font-semibold text-white mb-1 break-words leading-tight">
                        {score.title || score.song || "Unknown Title"}
                      </h3>
                      {score.artist && (
                        <p className="text-slate-400 text-sm break-words leading-tight">
                          {score.artist}
                        </p>
                      )}
                    </Link>
                  )}
                  {showUsername && score.username && (
                    <p className="text-slate-500 text-xs break-words leading-tight">
                      by {score.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Main Stats */}
              {mainStats.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {mainStats.slice(0, 5).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                        {getDisplayName(key)}
                      </p>
                      <p className="text-white font-semibold text-lg">
                        {renderValue(value, key)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Expandable sections (judgements, optional) */}
              {expandable.map(([key, value]) => (
                <div key={key} className="mb-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                    {getDisplayName(key)}
                  </p>
                  {renderValue(value, key)}
                </div>
              ))}

              {/* Timestamp */}
              <div className="pt-4 border-t border-slate-800/50">
                <p className="text-slate-500 text-xs">
                  {timestamp === 0 ? "N/A" : (
                    <>
                      {new Date(
                        typeof timestamp === "number" ? timestamp : timestamp,
                      ).toLocaleDateString()}{" "}
                      •{" "}
                      {new Date(
                        typeof timestamp === "number" ? timestamp : timestamp,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Table
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-slate-800/50 border-b border-slate-700/50">
            <tr>
              {tableKeys.map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-slate-300 font-medium"
                >
                  {key === "judgements" ? (
                    <span>{getDisplayName(key)}</span>
                  ) : (
                    <button
                      onClick={() => onSort(key)}
                      className="flex items-center space-x-2 hover:text-white transition-colors"
                    >
                      <span>{getDisplayName(key)}</span>
                      <SortIcon field={key} />
                    </button>
                  )}
                </th>
              ))}
              {showActions && (
                <th className="px-4 py-3 text-left text-slate-300 font-medium w-16">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sortedScores.map((score, index) => (
              <tr
                key={score.id || index}
                className="hover:bg-slate-800/30 transition-colors group"
              >
                {tableKeys.map((key) => (
                  <td key={key} className="px-4 py-3">
                    {key === "lamp" || key === "diff_lamp" ? (
                      <div className="flex items-center space-x-2">
                        <span className="inline-block bg-slate-800/50 text-slate-200 px-2 py-1 rounded text-xs border border-slate-600">
                          {score[key] || "No Clear"}
                        </span>
                      </div>
                    ) : key === "judgements" ? (
                      <div className="w-32">
                        {renderValue(score[key], key, true)}
                      </div>
                    ) : key === "timestamp" ? (
                      <span className="text-slate-400 text-xs">
                        {new Date(
                          typeof score[key] === "number"
                            ? score[key]
                            : score[key],
                        ).toLocaleDateString()}
                      </span>
                    ) : key === "username" ? (
                      <span className="text-violet-400 text-sm font-medium">
                        {score[key] || "Unknown"}
                      </span>
                    ) : (
                      <span
                        className={`${(key === "title" || key === "song") && !hideTitleArtist ? "text-white font-medium" : key === "score" ? "text-white font-medium" : "text-slate-300"}`}
                      >
                        {renderValue(score[key], key)}
                      </span>
                    )}
                  </td>
                ))}
                {showActions && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDelete(score.id)}
                      className="text-red-400 hover:text-red-300 opacity-100 transition-opacity duration-200 p-1 rounded bg-red-500/10"
                      title="Delete score"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DivaScoreDisplay;
