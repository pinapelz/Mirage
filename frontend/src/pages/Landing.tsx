import { Link } from "react-router";
import { useEffect, useState } from "react";
import type { SupportedGame } from "../types/game";
import sakuraMirageImage from "../assets/games/mirage.webp";

const Landing = () => {
  const [requireInvite, setRequireInvite] = useState(false);
  const [numUsers, setNumUsers] = useState(0);
  const [supportedGames, setSupportedGames] = useState<SupportedGame[] | null>(null);
  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + "/info");
        const data = await response.json();
        setRequireInvite(Boolean(data.requireInvite));
        setNumUsers(Number(data.userCount));
      } catch (error) {
        console.error('Error fetching server info:', error);
      }
    };

    const fetchSupportedGames = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + "/supportedGames");
        const data = await response.json();
        setSupportedGames(data);
      } catch (error) {
        console.error('Error fetching supported games:', error);
      }
    };
    fetchServerInfo();
    fetchSupportedGames();
  }, []);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-violet-600 hover:bg-violet-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative py-12 sm:py-18 lg:py-24 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url(${sakuraMirageImage})`,
            backgroundPosition: "center top",
          }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-950/60"></div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Welcome to <span className="text-violet-400">Mirage!</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-6 sm:mb-8 leading-relaxed">
              Looks like you're not logged in. If you've got an account,{" "}
              <Link
                to="/login"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Login!
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Server Stats Section */}
      <section className="py-6 sm:py-8 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Server <span className="text-violet-400">Status</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-violet-300 mb-2">Users</h3>
                <p className="text-2xl font-bold text-white">{numUsers}</p>
                <p className="text-sm text-slate-400">registered users</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-violet-300 mb-2">Registration</h3>
                <p className="text-2xl font-bold text-white">
                  {requireInvite ? "Invite Only" : "Open"}
                </p>
                <p className="text-sm text-slate-400">
                  {requireInvite ? "ask an admin" : "anyone can join"}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold text-violet-300 mb-2">Games</h3>
                <p className="text-2xl font-bold text-white">
                  {supportedGames ? supportedGames.length : "Loading..."}
                </p>
                <p className="text-sm text-slate-400">supported games</p>
              </div>
            </div>
            {supportedGames && supportedGames.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Supported Games</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {supportedGames.map((game) => (
                    <div key={game.internalName} className="bg-slate-800/30 rounded-md p-3 border border-slate-700/50">
                      <h4 className="text-violet-300 font-medium">{game.formattedName}</h4>
                      <p className="text-sm text-slate-400 mt-1">{game.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-6 sm:py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              What is this?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              <span className="font-semibold text-violet-300">Mirage</span> is a
              flexible Rhythm Game Score Tracker that works without relying on
              predefined seeds. It offers a lightweight alternative that can act
              as a holdover for tracking scores when chart metadata isn't
              readily available.
            </p>
          </div>
        </div>
      </section>

      {/* Track Your Scores Section */}
      <section className="py-6 sm:py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              <span className="text-violet-400">Track</span> Your Scores
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Mirage lets you import scores from the games you play for
              safe-keeping, so you can prevent losing them to the void should
              anything ever happen.
            </p>
          </div>
        </div>
      </section>

      {/* Add your own games */}
      <section className="py-6 sm:py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              <span className="text-purple-400">Add</span> Your Own Games
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              While not as robust as other seed-based systems. Mirage makes it
              easy for you to track and keep score for any game, no matter how
              niche it is.
            </p>
          </div>
        </div>
      </section>

      {/* Join with others */}
      <section className="py-6 sm:py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Mirage <span className="text-violet-400">Together</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Mirage is easily self-hostable and can be used locally for a single person or hosted so you can track scores with your friends. Everything is open-source.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-8 sm:py-12 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">
              Ready to Start <span className="text-violet-400">Tracking?</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white px-6 sm:px-8 py-3 rounded-md text-base sm:text-lg font-medium transition-colors min-w-[200px] shadow-lg shadow-violet-600/25 text-center"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto border border-slate-600 hover:border-violet-500 text-slate-300 hover:text-white px-6 sm:px-8 py-3 rounded-md text-base sm:text-lg font-medium transition-colors min-w-[200px] text-center"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 sm:py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <a className="hover:underline" href="">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
