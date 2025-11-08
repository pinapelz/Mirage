import { useNavigate } from "react-router";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../contexts/AuthContext";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import { useState } from "react";


const Admin = () => {
  const { user, isLoading, logout } = useAuth();
  const [showAddGame, setShowAddGame] = useState(false);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const [formData, setFormData] = useState({
    gameInternalName: '',
    gameFormattedName: '',
    gameDescription: ''
  });
  const [inviteFormData, setInviteFormData] = useState({
    uses: '',
    code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInviteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInviteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gameInternalName || !formData.gameFormattedName || !formData.gameDescription) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/admin/createGame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create game');
      }

      alert('Game created successfully!');
      setFormData({
        gameInternalName: '',
        gameFormattedName: '',
        gameDescription: ''
      });
      setShowAddGame(false);

    } catch (error) {
      console.error('Failed to create game:', error);
      alert(error instanceof Error ? error.message : 'Failed to create game');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteFormData.uses) {
      alert('Please specify the number of uses for the invite code');
      return;
    }

    const uses = parseInt(inviteFormData.uses);
    if (isNaN(uses) || uses <= 0) {
      alert('Please enter a valid number of uses');
      return;
    }

    setIsCreatingInvite(true);

    try {
      const requestBody: { uses: number; code?: string } = { uses };
      if (inviteFormData.code.trim()) {
        requestBody.code = inviteFormData.code.trim();
      }

      const response = await fetch(import.meta.env.VITE_API_URL + '/admin/createInvite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invite code');
      }

      const result = await response.json();
      setCreatedInviteCode(result.inviteCode.code);
      setInviteFormData({
        uses: '',
        code: ''
      });

    } catch (error) {
      console.error('Failed to create invite code:', error);
      alert(error instanceof Error ? error.message : 'Failed to create invite code');
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Invite code copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SessionExpiredPopup />;
  }
  if(!user.isAdmin && user.id != 1){
    console.log(user.id == 1)
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">You are not authorized to access this page.</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar user={user} handleLogout={handleLogout} currentPage="home"/>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Page</h1>
          <p className="text-slate-400">
            Welcome Mirage Webmaster! Here are a variety of settings and tools you can use to customize the experience
          </p>
        </div>

        {/* Create Invite Code Section */}
        <div className="mb-8">
          <div className="bg-slate-900 rounded-lg border border-slate-700">
            <button
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800 transition-colors rounded-lg"
              onClick={() => setShowCreateInvite(!showCreateInvite)}
            >
              <h2 className="text-xl font-semibold text-white">Create Invite Code</h2>
              <svg
                className={`w-5 h-5 text-slate-400 transform transition-transform ${
                  showCreateInvite ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCreateInvite && (
              <div className="px-6 pb-6">
                <p className="text-slate-300 leading-relaxed mb-6 p-4 bg-slate-800/50 rounded-md border-l-4 border-violet-500">
                  Generate invite codes to allow new users to register. You can specify how many times the code can be used
                  and optionally set a custom code (otherwise one will be generated automatically).
                </p>

                {createdInviteCode && (
                  <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-md">
                    <h3 className="text-green-400 font-semibold mb-2">Invite Code Created Successfully!</h3>
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-800 px-3 py-2 rounded text-green-300 font-mono">
                        {createdInviteCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(createdInviteCode)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleInviteSubmit}>
                  <div>
                    <label htmlFor="uses" className="block text-sm font-medium text-slate-300 mb-2">
                      Number of Uses
                    </label>
                    <input
                      type="number"
                      id="uses"
                      name="uses"
                      value={inviteFormData.uses}
                      onChange={handleInviteInputChange}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="How many times this code can be used"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-300 mb-2">
                      Custom Code (Optional)
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={inviteFormData.code}
                      onChange={handleInviteInputChange}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Leave blank to generate automatically"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isCreatingInvite}
                      className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      {isCreatingInvite ? 'Creating Invite Code...' : 'Create Invite Code'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Add New Game Section */}
        <div className="mb-8">
          <div className="bg-slate-900 rounded-lg border border-slate-700">
            <button
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800 transition-colors rounded-lg"
              onClick={() => setShowAddGame(!showAddGame)}
            >
              <h2 className="text-xl font-semibold text-white">Add New Game</h2>
              <svg
                className={`w-5 h-5 text-slate-400 transform transition-transform ${
                  showAddGame ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAddGame && (
              <div className="px-6 pb-6">
                <p className="text-slate-300 leading-relaxed mb-6 p-4 bg-slate-800/50 rounded-md border-l-4 border-violet-500">
                  This form allows you to add a new game to Mirage. By default, Mirage will attempt to derive a method of showing the game's score on its own.
                  You may override this behavior by writing your own custom score display logic.
                </p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="gameInternalName" className="block text-sm font-medium text-slate-300 mb-2">
                      Game Internal Name
                    </label>
                    <input
                      type="text"
                      id="gameInternalName"
                      name="gameInternalName"
                      value={formData.gameInternalName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="The unique internal identifier for the game (i.e. dancerush)"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="formattedName" className="block text-sm font-medium text-slate-300 mb-2">
                      Formatted Name
                    </label>
                    <input
                      type="text"
                      id="gameFormattedName"
                      name="gameFormattedName"
                      value={formData.gameFormattedName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="The formatted/stylized name users will see (i.e DANCERUSH STARDOM)"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="formattedName" className="block text-sm font-medium text-slate-300 mb-2">
                      Game Description
                    </label>
                    <input
                      type="text"
                      id="gameDescription"
                      name="gameDescription"
                      value={formData.gameDescription}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="A brief description of the game"
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      {isSubmitting ? 'Adding Game...' : 'Add Game'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
