import { Link } from "react-router";

export default function SessionExpiredPopup() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="bg-slate-900 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            Session Expired
          </h2>
          <p className="text-slate-300 mb-6">
            Please sign in to import your data.
          </p>
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
