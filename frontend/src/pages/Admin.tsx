import { useNavigate } from "react-router";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../contexts/AuthContext";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import UnauthorizedAccess from "../components/UnauthorizedAccess";
import CollapsibleSection from "../components/CollapsibleSection";
import InviteCodeManager from "../components/InviteCodeManager";
import GameManager from "../components/GameManager";
import { useState } from "react";

interface GameFormData {
  gameInternalName: string;
  gameFormattedName: string;
  gameDescription: string;
}

interface InviteFormData {
  uses: string;
  code: string;
}

const Admin = () => {
  const { user, isLoading, logout } = useAuth();
  const [showAddGame, setShowAddGame] = useState(false);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
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

  const handleGameSubmit = async (formData: GameFormData) => {
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
      setShowAddGame(false);

    } catch (error) {
      console.error('Failed to create game:', error);
      alert(error instanceof Error ? error.message : 'Failed to create game');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteSubmit = async (inviteFormData: InviteFormData) => {
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

    } catch (error) {
      console.error('Failed to create invite code:', error);
      alert(error instanceof Error ? error.message : 'Failed to create invite code');
    } finally {
      setIsCreatingInvite(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300">Loading Admin Dashboard...</p>
      </div>
    </div>;
  }

  if (!user) {
    return <SessionExpiredPopup />;
  }

  if (!user.isAdmin && user.id != 1) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar user={user} handleLogout={handleLogout} currentPage="home"/>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Page</h1>
          <p className="text-slate-400">
            Welcome Mirage Webmaster! Here are a variety of settings and tools you can use to customize the experience
          </p>
        </div>

        {/* Create Invite Code Section */}
        <CollapsibleSection
          title="Create Invite Code"
          isOpen={showCreateInvite}
          onToggle={() => setShowCreateInvite(!showCreateInvite)}
        >
          <InviteCodeManager
            onInviteSubmit={handleInviteSubmit}
            isCreatingInvite={isCreatingInvite}
            createdInviteCode={createdInviteCode}
          />
        </CollapsibleSection>

        {/* Add New Game Section */}
        <CollapsibleSection
          title="Add New Game"
          isOpen={showAddGame}
          onToggle={() => setShowAddGame(!showAddGame)}
        >
          <GameManager
            onGameSubmit={handleGameSubmit}
            isSubmitting={isSubmitting}
          />
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default Admin;
