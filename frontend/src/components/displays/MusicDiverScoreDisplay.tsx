import React from "react";
import SHA1 from "crypto-js/sha1";
import { Link } from "react-router";
import { globalSkipKeys } from "../../types/constants";

interface Score {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  timestamp: string | number;
  username?: string;
}

interface ScoreDisplayProps {
  scores: Score[];
  viewMode: "cards" | "table";
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onDelete?: (scoreId: number) => void;
  showUsername?: boolean;
  hideTitleArtist?: boolean;
}

const MusicDiverDisplay: React.FC<ScoreDisplayProps> = ({
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
    score: "Score",
    difficulty: "Difficulty",
    lamp: "Lamp",
    diff_lamp: "Lamp",
    timestamp: "Date",
    judgements: "Judgements",
    maxCombo: "Max Combo",
    perfect: "Perfect",
    great: "Great",
    good: "Good",
    bad: "Bad",
    miss: "Miss",
    rating: "Rating",
    percent: "Percent",
    chart: "Chart",
    song: "Song",
    ranking: "Ranking",
    combo: "Combo",
    grade: "Grade",
    level: "Level",
    bpm: "BPM",
    notes: "Notes",
    duration: "Duration",
    playcount: "Play Count",
    date: "Date",
    time: "Time",
    username: "Username",
    num_players: "Players"
  };

  const primaryKeys = ["title", "artist", "song"];
  const mainStatKeys = [
    "score",
    "level",
    "lamp",
    "rank",
    "diff_lamp",
    "percent",
    "rating",
    "grade",
  ];
  const expandableKeys = ["judgements", "optional"];
  const skipKeys = ["user", "username"]
  // get ?game=
  const internalGameName =new URLSearchParams(window.location.search).get("game") || "dancerush";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return "N/A";

    // Handle timestamps
    if (key === "timestamp" || key === "date") {
      const date = new Date(typeof value === "number" ? value : value);
      return date.toLocaleDateString();
    }

    if (typeof value === "number") {
      if (key === "score" || key === "maxCombo" || key === "combo") {
        return value.toLocaleString();
      }
      return value.toString();
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
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

    return <span>{formatValue(value, key)}</span>;
  };

  const getScoreEntries = (score: Score) => {
    const entries = Object.entries(score).filter(
      ([key]) => !globalSkipKeys.includes(key),
    );

    const primary = entries.filter(([key]) => primaryKeys.includes(key));
    const mainStats = entries.filter(([key]) => mainStatKeys.includes(key));
    const expandable = entries.filter(([key]) => expandableKeys.includes(key));
    const others = entries.filter(
      ([key]) =>
        !primaryKeys.includes(key) &&
        !mainStatKeys.includes(key) &&
        !expandableKeys.includes(key) &&
        key !== "timestamp",
    );

    return {
      primary,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {sortedScores.map((score, index) => {
          const chartIdHash = SHA1(`${internalGameName}${score.title}${score.artist}`).toString();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { primary, mainStats, expandable, others: rawOthers, timestamp } =
            getScoreEntries(score);
          const others = rawOthers.filter(([key]) => !skipKeys.includes(key));


          return (
            <div
              key={score.id || index}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
            >
              {/* Primary Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  {!hideTitleArtist && (
                    <Link to={`/chart?chartId=${chartIdHash}&game=${internalGameName}`}>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 break-words leading-tight">
                        {score.title || score.song || "Unknown Title"}
                      </h3>
                      {score.artist && (
                        <p className="text-slate-400 text-xs sm:text-sm break-words leading-tight">
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
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                  {mainStats.slice(0, 4).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                      <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wide mb-1">
                        {getDisplayName(key)}
                      </p>
                      <p className={`${key === 'lamp' || key === 'diff_lamp' || key === 'score' || key === 'level' ? 'font-orbitron' : ''} text-white font-semibold text-sm sm:text-lg ${
                        (key === 'lamp' || key === 'diff_lamp') && value && !String(value).toLowerCase().includes('fail') && !String(value).toLowerCase().includes('no clear')
                          ? 'text-[hsl(180,100%,40%)]'
                          : key === 'rank' && value && String(value).toLowerCase().includes('s')
                          ? 'text-yellow-300'
                          : key === 'rank' && value && String(value).toLowerCase().includes('a')
                          ? 'text-green-300'
                          : key === 'rank' && value && String(value).toLowerCase().includes('b')
                          ? 'text-blue-300'
                          : key === 'rank' && value && String(value).toLowerCase().includes('c')
                          ? 'text-orange-300'
                          : key === 'rank' && value && String(value).toLowerCase().includes('d')
                          ? 'text-red-300'
                          : key === 'score'
                          ? 'text-white'
                          : 'text-slate-300'
                      }`}>
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

              {/* Other fields */}
              {others.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {others.map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-400">
                          {getDisplayName(key)}:
                        </span>
                        <span className="text-white font-medium">
                          {renderValue(value, key)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="pt-4 border-t border-slate-800/50">
                <p className="text-slate-500 text-[10px] sm:text-xs">
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
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto relative">
        <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-slate-900/80 to-transparent pointer-events-none z-10"></div>
        <table className="w-full text-sm min-w-[800px] md:min-w-[1000px]">
          <thead className="bg-slate-800/50 border-b border-slate-700/50">
            <tr>
              {tableKeys.map((key) => (
                <th
                  key={key}
                  className="px-2 sm:px-4 py-2 sm:py-3 text-left text-slate-300 font-medium text-xs sm:text-sm"
                >
                  {key === "judgements" ? (
                    <span>{getDisplayName(key)}</span>
                  ) : (
                    <button
                      onClick={() => onSort(key)}
                      className="flex items-center space-x-1 sm:space-x-2 hover:text-white transition-colors"
                    >
                      <span>{getDisplayName(key)}</span>
                      <SortIcon field={key} />
                    </button>
                  )}
                </th>
              ))}
              {showActions && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-slate-300 font-medium w-16 text-xs sm:text-sm">
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
                  <td key={key} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    {key === "lamp" || key === "diff_lamp" ? (
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs border whitespace-nowrap font-orbitron
                          ${!score[key] ? 'text-slate-400'
                          : String(score[key]).toLowerCase().includes('fail') || String(score[key]).toLowerCase().includes('no clear')
                            ? 'text-red-400 border-red-400'
                            : 'text-[hsl(180,100%,40%)] border-[hsl(180,100%,40%)]'}`}>
                          {score[key] || "NO DATA"}
                        </span>
                      </div>
                    ) : key === "judgements" ? (
                      <div className="w-32">
                        {renderValue(score[key], key, true)}
                      </div>
                    ) : key === "timestamp" ? (
                      <span className="text-slate-400 text-[10px] sm:text-xs whitespace-nowrap">
                        {new Date(
                          typeof score[key] === "number"
                            ? score[key]
                            : score[key],
                        ).toLocaleDateString()}
                      </span>
                    ) : key === "username" ? (
                      <span className="text-violet-400 text-xs sm:text-sm font-medium">
                        {score[key] || "Unknown"}
                      </span>
                    ) : (
                      <span
                        className={`${(key === "title" || key === "song") && !hideTitleArtist
                          ? "text-white font-medium"
                          : key === "score"
                            ? "text-white font-medium font-orbitron"
                          : key === "difficulty"
                            ? `font-orbitron ${
                              score[key] && String(score[key]).toLowerCase().includes('basic')
                                ? 'text-green-400'
                              : score[key] && String(score[key]).toLowerCase().includes('advanced')
                                ? 'text-yellow-400'
                              : score[key] && String(score[key]).toLowerCase().includes('expert')
                                ? 'text-red-400'
                              : score[key] && String(score[key]).toLowerCase().includes('master')
                                ? 'text-purple-400'
                              : 'text-slate-300'
                            }`
                          : key === "rank"
                            ? score[key] && String(score[key]).toLowerCase().includes('s')
                              ? 'text-yellow-300'
                            : score[key] && String(score[key]).toLowerCase().includes('a')
                              ? 'text-green-300'
                            : score[key] && String(score[key]).toLowerCase().includes('b')
                              ? 'text-blue-300'
                            : score[key] && String(score[key]).toLowerCase().includes('c')
                              ? 'text-orange-300'
                            : score[key] && String(score[key]).toLowerCase().includes('d')
                              ? 'text-red-300'
                              : 'text-slate-300'
                          : "text-slate-300"}`}
                      >
                        {renderValue(score[key], key)}
                      </span>
                    )}
                  </td>
                ))}
                {showActions && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <button
                      onClick={() => onDelete(score.id)}
                      className="text-red-400 hover:text-red-300 opacity-100 transition-opacity duration-200 p-1 rounded bg-red-500/10"
                      title="Delete score"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default MusicDiverDisplay;
