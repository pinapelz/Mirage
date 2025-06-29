import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user, isLoading, logout } = useAuth();
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

  if (isLoading) {
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

        {/* Coming Soon Card */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-12 text-center">
          <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard Coming Soon</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            We're working hard to bring you an amazing dashboard experience. Track your scores,
            analyze your performance, and compete with friends - all coming soon!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="bg-slate-800 px-6 py-3 rounded-lg border border-slate-600">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-violet-300">User ID:</span> {user.id}
              </p>
            </div>
            <div className="bg-slate-800 px-6 py-3 rounded-lg border border-slate-600">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-violet-300">Email:</span> {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
