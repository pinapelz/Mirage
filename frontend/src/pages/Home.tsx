import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import type { SupportedGame } from '../types/game';
import { useState, useEffect } from 'react';

import dancerushImage from '../assets/games/dancerush.webp';

const Home = () => {
  const { user, isLoading, logout } = useAuth();
  const [supportedGames, setSupportedGames] = useState<SupportedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Network error during logout. Please try again.');
    }
  };

  const getGameImage = (internalName: string) => {
    switch(internalName){
      case "dancerush": {
        return dancerushImage;
      }
       default: {
         return null
      }
    }
  }

  useEffect(() => {
    const fetchSupportedGames = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL+'/supportedGames');
        if (!response.ok) {
          throw new Error('Failed to fetch supported games');
        }
        const data = await response.json();
        setSupportedGames(data);
      } catch (error) {
        console.error('Failed to fetch supported games:', error);
        alert('Failed to load supported games. Please refresh the page.');
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
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-slate-900 rounded-lg p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Session Expired</h2>
            <p className="text-slate-300 mb-6">Please sign in to access your dashboard.</p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-md font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/"
                className="block w-full border border-slate-600 hover:border-violet-500 text-slate-300 hover:text-white py-3 rounded-md font-medium transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-violet-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-white font-semibold text-lg">Mirage</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/import"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Import Data
              </Link>
              <span className="text-slate-300 text-sm">Welcome back, {user.username}</span>
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Track your rhythm game progress and performance</p>
        </div>

        {/* Supported Games */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedGames.map((game) => (
              <div
                key={game.internalName}
                className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 group"
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
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">{game.formattedName}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{game.description}</p>
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
