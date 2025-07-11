import { useNavigate } from "react-router";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../contexts/AuthContext";
import type { SupportedGame } from "../types/game";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import { useState, useEffect } from "react";

import dancerushImage from "../assets/games/dancerush.webp";

const Home = () => {
  const { user, isLoading, logout } = useAuth();
  const [supportedGames, setSupportedGames] = useState<SupportedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Network error during logout. Please try again.");
    }
  };

  const getGameImage = (internalName: string) => {
    switch (internalName) {
      case "dancerush": {
        return dancerushImage;
      }
      default: {
        return null;
      }
    }
  };

  useEffect(() => {
    const fetchSupportedGames = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + "/supportedGames",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch supported games");
        }
        const data = await response.json();
        setSupportedGames(data);
      } catch (error) {
        console.error("Failed to fetch supported games:", error);
        alert("Failed to load supported games. Please refresh the page.");
      } finally {
        setGamesLoading(false);
      }
    };
    fetchSupportedGames();
  }, []);

  if (isLoading || gamesLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SessionExpiredPopup />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar user={user} handleLogout={handleLogout} currentPage="import"/>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Track your rhythm game progress and performance
          </p>
        </div>

        {/* Supported Games */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedGames.map((game) => (
              <div
                key={game.internalName}
                className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/score?game=${game.internalName}`)}
              >
                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                  {getGameImage(game.internalName) !== null ? (
                    <img
                      src={getGameImage(game.internalName) || undefined}
                      alt={game.formattedName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-slate-600">
                        <svg
                          className="w-16 h-16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                    {game.formattedName}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
