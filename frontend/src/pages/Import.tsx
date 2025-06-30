import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import JsonUploadModal from '../components/modals/JsonUploadModal';

interface SupportedGame {
  internalName: string;
  formattedName: string;
  description: string;
}

const Import = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState('');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [supportedGames, setSupportedGames] = useState<SupportedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

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
        setUploadStatus({
          type: 'error',
          message: 'Failed to load supported games. Please refresh the page.'
        });
      } finally {
        setGamesLoading(false);
      }
    };

    fetchSupportedGames();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Network error during logout. Please try again.');
    }
  };

  const handleJsonUpload = async (data: any) => {
    try {
      console.log('Uploading data for game:', selectedGame, data);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/uploadScore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          meta: {
            game: data.meta.game,
            service: data.meta.service,
            playtype: data.meta.playtype
          },
          scores: data.scores
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload scores');
      }

      const result = await response.json();

      setUploadStatus({
        type: 'success',
        message: `Successfully imported ${result.scoreCount} score(s) for ${supportedGames.find(g => g.internalName === data.meta.game)?.formattedName || data.meta.game}`
      });

      setTimeout(() => {
        setUploadStatus({ type: null, message: '' });
      }, 5000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import data. Please try again.'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading import page...</p>
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
            <p className="text-slate-300 mb-6">Please sign in to import your data.</p>
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
              <Link to="/home" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-violet-600 rounded-md flex items-center justify-center group-hover:bg-violet-700 transition-colors">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-white font-semibold text-lg">Mirage</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/home"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
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
          <h1 className="text-3xl font-bold text-white mb-2">Import Data</h1>
          <p className="text-slate-400">Import your game scores and progress from various sources</p>
        </div>

        {/* Status Message */}
        {uploadStatus.type && (
          <div className={`mb-6 rounded-md p-4 ${
            uploadStatus.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <p className={`text-sm ${
              uploadStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {uploadStatus.message}
            </p>
          </div>
        )}

        {/* Game Selection Card */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Select Game</h2>
            <p className="text-slate-400 text-sm mb-6">
              Choose the game you want to import data for
            </p>

            {gamesLoading ? (
              <div className="w-full md:w-96 bg-slate-800 border border-slate-600 rounded-md px-4 py-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-slate-400">Loading games...</span>
                </div>
              </div>
            ) : (
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full md:w-96 bg-slate-800 border border-slate-600 text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a game</option>
                {supportedGames.map((game) => (
                  <option key={game.internalName} value={game.internalName} title={game.description}>
                    {game.formattedName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Import Options */}
          {selectedGame && (
            <div className="space-y-6 mt-8">
              <h3 className="text-lg font-semibold text-white">Import Options</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* JSON Upload Card */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-violet-500 transition-colors">
                  <div className="w-12 h-12 bg-violet-600/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Batch-Manual Upload</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Upload your game data from a Mirage compatible JSON file
                  </p>
                  <button
                    onClick={() => setIsJsonModalOpen(true)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Upload JSON
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JSON Upload Modal */}
      <JsonUploadModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        onUpload={handleJsonUpload}
        game={supportedGames.find(g => g.internalName === selectedGame)?.formattedName || ''}
      />
    </div>
  );
};

export default Import;
