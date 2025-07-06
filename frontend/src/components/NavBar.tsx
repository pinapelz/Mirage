import { Link } from "react-router";

export const NavBar = ({ currentPage, user, handleLogout }: {
  currentPage: string;
  user: { username: string };
  handleLogout: () => void;
}) => {
  const getMenuOptions = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <>
            <Link
              to="/import"
              className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-800/50"
            >
              Import Data
            </Link>
          </>
        );
      case 'import':
        return (
          <>
            <Link
              to="/home"
              className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-800/50"
            >
              Home
            </Link>
          </>
        );
      case 'score':
        return (
          <>
            <Link
              to="/home"
              className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-800/50"
            >
              Home
            </Link>
            <Link
              to="/import"
              className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-800/50"
            >
              Import Data
            </Link>
          </>
        );
      default:
        return (
          <Link
            to="/import"
            className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-800/50"
          >
            Import Data
          </Link>
        );
    }
  };

  return (
    <nav className="border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-semibold text-lg">Mirage</span>
          </div>
          <div className="flex items-center space-x-4">
            {getMenuOptions()}
            <span className="text-slate-300 text-sm">
              Welcome back,{" "}
              <span className="text-violet-400 font-medium">
                {user.username}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-800/50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
