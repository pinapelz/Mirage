import { useEffect, useState, useCallback } from "react";
import LoadingDisplay from "../components/displays/LoadingDisplay";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { NavBar } from "../components/NavBar";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import ScoreDisplay from "../components/displays/GenericScoreDisplay";
import DancerushScoreDisplay from "../components/displays/DancerushScoreDisplay";
import DivaScoreDisplay from "../components/displays/DivaScoreDisplay";
import MusicDiverDisplay from "../components/displays/MusicDiverScoreDisplay";
import SongInfoDisplay from "../components/modals/SongInfoDisplay";
import DancearoundScoreDisplay from "../components/displays/DancearoundScoreDisplay";
import NostalgiaScoreDisplay from "../components/displays/NostalgiaScoreDisplay";
import ReflecBeatScoreDisplay from "../components/displays/ReflecBeatScoreDisplay";
type SortField = string;
type SortDirection = "asc" | "desc";

import { getFilterOptions } from "../types/constants";

const Chart = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [pbOnly, setPbOnly] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [requestOrder, setRequestOrder] = useState<string>("timestamp");

  const chartIdHash = new URLSearchParams(window.location.search).get("chartId") || "";
  if (!chartIdHash) {
    navigate("/home");
  }

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
  }

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
        const url = new URL(import.meta.env.VITE_API_URL + "/scores/" + chartIdHash);
        url.searchParams.append("pageNum", pageNum.toString());
        url.searchParams.append("sortKey", requestOrder);
        url.searchParams.append("direction", "asc");
        url.searchParams.append("pbOnly", pbOnly.toString());
        url.searchParams.append("game", gameName);

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
    [user, requestOrder, chartIdHash, gameName, pbOnly],
  );

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

  const handleTogglePB = () => {
    setPbOnly(!pbOnly);
  };

  if (!user) {
    return <SessionExpiredPopup />;
  }

  if (isLoading || loading) {
    return (
      <LoadingDisplay message="Loading Chart" />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <NavBar user={user} handleLogout={handleLogout} currentPage="score" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SongInfoDisplay
          scores={scores}
        />
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"/>
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
              <button
                onClick={() => handleTogglePB()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pbOnly
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {pbOnly ? "Showing only PBs" : "Showing all scores"}
              </button>
            </div>
          </div>

          {/* Filter Menu */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
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
                  showUsername={true}
                  hideTitleArtist={true}
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
                    showUsername={true}
                    hideTitleArtist={true}
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
                    showUsername={true}
                    hideTitleArtist={true}
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
                    showUsername={true}
                    hideTitleArtist={true}
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
                    showUsername={true}
                    hideTitleArtist={true}
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
                    showUsername={true}
                    hideTitleArtist={true}
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
                  showUsername={true}
                  hideTitleArtist={true}
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
          Displaying {scores.length} scores • Page {currentPage} of {numPages}
        </p>
      </main>

    </div>
  );
};

export default Chart;
