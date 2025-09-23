import { Link } from "react-router";
import { useState } from "react";

export const NavBar = ({ currentPage, user, handleLogout }: {
  currentPage: string;
  user: { username: string };
  handleLogout: () => void;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuOptions = (
    <>
      <Link
        to="/home"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          currentPage === 'dashboard' || currentPage === 'home'
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/import"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          currentPage === 'import'
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Import Data
      </Link>
      <Link
        to="/allscores"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          currentPage === 'allscores'
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Community Scores
      </Link>
    </>
  );

  return (
    <nav className="border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-semibold text-lg">Mirage</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuOptions}
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

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuOptions}
              <div className="border-t border-slate-800/50 mt-3 pt-3">
                <div className="text-slate-300 text-sm px-4 py-2">
                  Welcome back,{" "}
                  <span className="text-violet-400 font-medium">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-800/50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};