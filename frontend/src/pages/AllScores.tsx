import { useEffect, useState, useCallback } from "react";
import LoadingDisplay from "../components/displays/LoadingDisplay";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { NavBar } from "../components/NavBar";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import ScoreDisplay from "../components/displays/GenericScoreDisplay";
import DancerushScoreDisplay from "../components/displays/DancerushScoreDisplay";
import DancearoundScoreDisplay from "../components/displays/DancearoundScoreDisplay";
import DivaScoreDisplay from "../components/displays/DivaScoreDisplay";
import MusicDiverScoreDisplay from "../components/displays/MusicDiverScoreDisplay";
import NostalgiaScoreDisplay from "../components/displays/NostalgiaScoreDisplay";
import ReflecBeatScoreDisplay from "../components/displays/ReflecBeatScoreDisplay";
type SortField = string;
type SortDirection = "asc" | "desc";

import { getFilterOptions } from "../types/constants";

interface Game {
  internalName: string;
  formattedName: string;
  description: string;
}

const AllScores = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [requestOrder, setRequestOrder] = useState<string>("timestamp");
  const [pbOnly, setPbOnly] = useState<boolean>(true);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>(
    new URLSearchParams(window.location.search).get("game") || ""
  );

  const gameName = selectedGame;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Network error during logout. Please try again.");
    }
  };

  const renderRequestFilterMenu = () => {
    const filterOptions = getFilterOptions(gameName);
    return (
      <div className="flex items-center space-x-2 bg-slate-900/50 backdrop-blur-sm rounded-xl p-1 border border-slate-800/50">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setRequestOrder(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              requestOrder === option.value
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  const renderPbOnlyToggle = () => {
    return (
      <div className="flex items-center space-x-2 bg-slate-900/50 backdrop-blur-sm rounded-xl p-1 border border-slate-800/50">
        <button
          onClick={() => setPbOnly(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            pbOnly
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
              : "text-slate-300 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          Personal Bests
        </button>
        <button
          onClick={() => setPbOnly(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            !pbOnly
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
              : "text-slate-300 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          All Scores
        </button>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flattenScoreData = (score: any) => {
    const flat = { ...score, ...score.data };
    delete flat.data;
    delete flat.gameInternalName;
    return flat;
  };

  const fetchGames = useCallback(async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/supportedGames");
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      setGames(data);
      if (!selectedGame && data.length > 0) {
        setSelectedGame(data[0].internalName);
      }
    } catch (error) {
      console.error("Failed to load games:", error);
      alert("Failed to load games. Please refresh the page.");
    }
  }, [selectedGame]);

  const fetchScores = useCallback(
    async (pageNum: number) => {
      if (!user || !gameName) return;

      setLoading(true);
      try {
        const url = new URL(import.meta.env.VITE_API_URL + "/allScores");
        url.searchParams.append("internalGameName", gameName);
        url.searchParams.append("pageNum", pageNum.toString());
        url.searchParams.append("sortKey", requestOrder);
        // Always sort by timestamp in desc order by default to show most recent first
        // For other fields, also default to desc to show highest values first
        url.searchParams.append("direction", "desc");
        url.searchParams.append("pbOnly", pbOnly.toString());

        const response = await fetch(url.toString(), {credentials: 'include'});
        if (!response.ok) throw new Error("Failed to fetch scores");
        const data = await response.json();
        const flattened = data.scores.map(flattenScoreData);
        setScores(flattened);
        setNumPages(data.num_pages);
        setCurrentPage(pageNum);
      } catch (error) {
        console.error("Failed to load scores:", error);
        alert("Failed to load scores. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    },
    [user, gameName, requestOrder, pbOnly],
  );

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (user && gameName) {
      fetchScores(1);
    }
  }, [user, fetchScores, gameName]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleGameChange = (gameInternalName: string) => {
    setSelectedGame(gameInternalName);
    setCurrentPage(1);
    // Reset sort order to timestamp to show most recent scores first
    setRequestOrder("timestamp");
    // Update URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set("game", gameInternalName);
    window.history.replaceState({}, "", url.toString());
  };

  if (!user) {
    return <SessionExpiredPopup />;
  }

  if (isLoading) {
    return (
      <LoadingDisplay message="Loading Community Scores..." />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <NavBar user={user} handleLogout={handleLogout} currentPage="allscores" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-linear-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              {gameName
                ? `${games.find(g => g.internalName === gameName)?.formattedName || gameName} - Community Scores`
                : "Community Scores"
              }
            </h1>
            <div className="flex items-center space-x-2 bg-slate-900/50 backdrop-blur-sm rounded-xl p-1 border border-slate-800/50">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === "cards"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === "table"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Game Selection */}
          <div className="mb-8">
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Select Game
            </label>
            <div className="relative">
              <select
                value={selectedGame}
                onChange={(e) => handleGameChange(e.target.value)}
                className="w-full md:w-80 bg-slate-800/70 backdrop-blur-sm border border-slate-600 text-white rounded-xl px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all duration-200 appearance-none cursor-pointer hover:bg-slate-700/70"
              >
                {games.length === 0 && (
                  <option value="">Loading games...</option>
                )}
                {games.map((game) => (
                  <option key={game.internalName} value={game.internalName}>
                    {game.formattedName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter Menu */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {gameName && renderRequestFilterMenu()}
              {renderPbOnlyToggle()}
            </div>
          </div>

          <p className="text-slate-400 mb-6">
            {pbOnly
              ? "Showing personal best scores for each chart from all players"
              : "Showing all recently received scores from all players"
            }{gameName ? ` for ${games.find(g => g.internalName === gameName)?.formattedName || gameName}` : ""}
          </p>
        </div>

        {!gameName ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Please select a game to view scores</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-300 text-lg">Loading community scores...</p>
          </div>
        ) : (() => {
          switch (gameName) {
            case "dancerush":
              return (
                <DancerushScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showUsername={true}
                />
              );
              break;
            case "dancearound":
              return (
                <DancearoundScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showUsername={true}
                />
              );
              break;
            case "diva":
              return (
                <DivaScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showUsername={true}
                />
              );
              break;
            case "musicdiver":
              return (
                <MusicDiverScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showUsername={true}
                />
              );
              break;
            case "nostalgia":
              return (
                <NostalgiaScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showUsername={true}
                />
              );
              break;
            case "reflecbeat":
              return (
                <ReflecBeatScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showUsername={true}
                />
              );
              break;
            default:
              return (
                <ScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showUsername={true}
                />
              );
          }
        })()}

        {numPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2 bg-slate-900/50 backdrop-blur-sm rounded-xl p-2 border border-slate-800/50">
              {[...Array(numPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchScores(i + 1)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentPage === i + 1
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="text-slate-400 mt-4 text-lg">
          {loading ? "Loading..." : `Displaying ${scores.length} scores • Page ${currentPage} of ${numPages}`}
        </p>
      </main>
    </div>
  );
};

export default AllScores;
