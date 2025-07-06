import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { NavBar } from "../components/NavBar";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import ScoreDisplay from "../components/tables/GenericScoreTable";

type SortField = string;
type SortDirection = "asc" | "desc";

const Score = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
        url.searchParams.append("userId", user.id);
        url.searchParams.append("internalGameName", gameName);
        url.searchParams.append("pageNum", pageNum.toString());

        const response = await fetch(url.toString());
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
    [user],
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

  if (!user) {
    return <SessionExpiredPopup />;
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-300 text-lg">Loading your scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <NavBar user={user} handleLogout={handleLogout} currentPage="score"/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              Your Scores
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
          <p className="text-slate-400 text-lg">
            Displaying {scores.length} scores • Page {currentPage} of {numPages}
          </p>
        </div>

        {(() => {
          switch (viewMode) {
            default:
              return (
                <ScoreDisplay
                  scores={scores}
                  viewMode={viewMode}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
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
      </main>
    </div>
  );
};

export default Score;
