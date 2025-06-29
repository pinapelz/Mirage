import { Link } from 'react-router';

const Landing = () => {
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
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Banner */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
             style={{backgroundImage: "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-950/60"></div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to <span className="text-violet-400">Mirage!</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Looks like you're not logged in. If you've got an account, <Link to="/login" className="text-violet-400 hover:text-violet-300 underline">Login!</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              I'm New Around Here, What is this?
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              <span className="font-semibold text-violet-300">Mirage</span> is a Rhythm Game Score Tracker. That means we...
            </p>
          </div>
        </div>
      </section>

      {/* Track Your Scores Section */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              <span className="text-violet-400">Track</span> Your Scores.
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Mirage supports a bunch of your favourite games, and integrates with many existing services to
              make sure no score is lost to the void. Furthermore, it's backed by an Open-Source API, so your
              scores are always available!
            </p>
          </div>
        </div>
      </section>

      {/* Analyse Your Scores Section */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              <span className="text-purple-400">Analyse</span> Your Scores.
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Mirage analyses your scores for you, breaking them down into all the statistics you'll ever need.
              No more spreadsheets!
            </p>
          </div>
        </div>
      </section>

      {/* Provide Cool Features Section */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Provide <span className="text-violet-400">Cool Features</span>.
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Mirage implements the features rhythm gamers already talk about. Break your scores down
              into sessions, showcase your best metrics on your profile, study your progress on folders - it's all
              there, and done for you!
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Ready to Start <span className="text-violet-400">Tracking?</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors min-w-[200px] shadow-lg shadow-violet-600/25"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="border border-slate-600 hover:border-violet-500 text-slate-300 hover:text-white px-8 py-3 rounded-md text-lg font-medium transition-colors min-w-[200px]"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <a  className="hover:underline" href="">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
