import { useEffect, useState, useCallback } from "react";
import LoadingDisplay  from "../components/LoadingDisplay";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { NavBar } from "../components/NavBar";
import type { SupportedGame}  from "../types/game";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import ScoreDisplay from "../components/displays/GenericScoreDisplay";
import DancerushScoreDisplay from "../components/displays/DancerushScoreDisplay";
import DancearoundScoreDisplay from "../components/displays/DancearoundScoreDisplay";
import DivaScoreDisplay from "../components/displays/DivaScoreDisplay";
import MusicDiverDisplay from "../components/displays/MusicDiverScoreDisplay";
import ReflecBeatScoreDisplay from "../components/displays/ReflecBeatScoreDisplay";
import NostalgiaScoreDisplay from "../components/displays/NostalgiaScoreDisplay";
import TaikoScoreDisplay from "../components/displays/TaikoScoreDisplay";
type SortField = string;
type SortDirection = "asc" | "desc";

import { getFilterOptions } from "../types/constants";

const Score = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [formattedGameName, setFormattedGameName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scores, setScores] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [username, setUsername] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [requestOrder, setRequestOrder] = useState<string>("timestamp");
  const [viewingOwnScores, setViewingOwnScores] = useState(true);

  const gameName =
    new URLSearchParams(window.location.search).get("game") || "dancerush";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Network error during logout. Please try again.");
    }
  };

  useEffect(() => {
    try{
      fetch(import.meta.env.VITE_API_URL + `/supportedGames`)
        .then(response => response.json())
        .then(data => {
          const game = data.find((game: SupportedGame) => game.internalName === gameName);
          setFormattedGameName(game ? game.formattedName : gameName);
        })
        .catch(error => console.error(error));
    } catch (error) {
      console.error("Error:", error);
      alert("Network error. Please try again.");
    }
  }, [gameName]);

  const renderRequestFilterMenu = () => {
    const filterOptions = getFilterOptions(gameName);
    return (
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 backdrop-blur-sm rounded-xl p-1 border border-slate-800/50">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setRequestOrder(option.value)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flattenScoreData = (score: any) => {
    const flat = { ...score, ...score.data };
    delete flat.data;
    delete flat.gameInternalName;
    return flat;
  };

  const fetchScores = useCallback(
    async (pageNum: number) => {
      if (!user) return;

      setLoading(true);
      try {
        const url = new URL(import.meta.env.VITE_API_URL + "/scores");
        const targetUserId = new URLSearchParams(window.location.search).get("userId");
        if (targetUserId) {
          url.searchParams.append("userId", targetUserId);
        } else {
          url.searchParams.append("userId", user.id.toString());
        }
        if(targetUserId && targetUserId !== user.id.toString()){
          setViewingOwnScores(false);
        }
        else{
          setViewingOwnScores(true);
        }
        url.searchParams.append("internalGameName", gameName);
        url.searchParams.append("pageNum", pageNum.toString());
        url.searchParams.append("sortKey", requestOrder);
        url.searchParams.append("direction", "asc");

        const response = await fetch(url.toString(), {credentials: 'include'});
        if (!response.ok) throw new Error("Failed to fetch scores");
        const data = await response.json();
        setUsername(data.user);
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
    [user, gameName, requestOrder],
  );

  const handleDeleteScore = async (scoreId: number) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this score? This action cannot be undone.")) {
      return;
    }

    try {
      const url = new URL(import.meta.env.VITE_API_URL + "/scores");
      url.searchParams.append("userId", user.id.toString());
      url.searchParams.append("internalGameName", gameName);
      url.searchParams.append("scoreId", scoreId.toString());

      const response = await fetch(url.toString(), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete score");

      await fetchScores(currentPage);
    } catch (error) {
      console.error("Failed to delete score:", error);
      alert("Failed to delete score. Please try again.");
    }
  };

  useEffect(() => {
    if (user) fetchScores(1);
  }, [user, fetchScores]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (!user) {
    return <SessionExpiredPopup />;
  }

  if (isLoading || loading) {
    return (
      <LoadingDisplay message={"Loading Scores for " + formattedGameName}/>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <NavBar user={user} handleLogout={handleLogout} currentPage="score" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              {viewingOwnScores ? "Your Scores" : `${username}'s Scores`} for {formattedGameName}
            </h1>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/50 backdrop-blur-sm rounded-xl p-1 border border-slate-800/50">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === "cards"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === "table"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Filter Menu */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="w-full sm:w-auto">
              {renderRequestFilterMenu()}
            </div>
          </div>
        </div>

        {(() => {
          switch (gameName) {
            case "dancerush":
              return (
                <DancerushScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDeleteScore}
                />
              );
            case "dancearound":
              return (
                <DancearoundScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDeleteScore}
                />
              );
            case "diva":
              return (
                <DivaScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDeleteScore}
                />
              );
            case "musicdiver":
              return (
                <MusicDiverDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDeleteScore}
                />
              );
            case "reflecbeat":
              return (
                <ReflecBeatScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDeleteScore}
                />
              );
            case "nostalgia":
              return (
                <NostalgiaScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDeleteScore}
                />
              );
            case "taiko":
              return (
                <TaikoScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDeleteScore}
                />
              );
            default:
              return (
                <ScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDeleteScore}
                />
              );
          }
        })()}

        {numPages > 1 && (
          <div className="flex justify-center mt-8 sm:mt-12">
            <div className="flex flex-wrap gap-1 sm:gap-2 bg-slate-900/50 backdrop-blur-sm rounded-xl p-2 border border-slate-800/50 max-w-full overflow-x-auto">
              {[...Array(numPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchScores(i + 1)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
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
        <p className="text-slate-400 mt-4 text-sm sm:text-base md:text-lg text-center">
          Displaying {scores.length} scores • Page {currentPage} of {numPages}
        </p>
        {viewMode === "table" && (
          <p className="text-slate-500 mt-2 text-xs text-center md:hidden">
            ← Swipe horizontally to see more →
          </p>
        )}
      </main>
    </div>
  );
};

export default Score;
