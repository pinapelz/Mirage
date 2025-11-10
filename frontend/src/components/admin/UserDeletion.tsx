import { useState } from 'react';

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface UserDeletionProps {
  onUserDeleted?: () => void;
}

const UserDeletion = ({ onUserDeleted }: UserDeletionProps) => {
  const [userId, setUserId] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchUser = async () => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    const id = parseInt(userId);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid user ID');
      return;
    }

    setIsSearching(true);
    setError(null);
    setUserToDelete(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me?userId=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to find user');
      }

      const data = await response.json();
      setUserToDelete(data.user);
    } catch (error) {
      console.error('Failed to search user:', error);
      setError(error instanceof Error ? error.message : 'Failed to search user');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      alert(`User "${userToDelete.username}" has been successfully deleted.`);

      // Reset form
      setUserId('');
      setUserToDelete(null);
      setShowConfirmation(false);

      // Call callback if provided
      onUserDeleted?.();

    } catch (error) {
      console.error('Failed to delete user:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setUserId('');
    setUserToDelete(null);
    setShowConfirmation(false);
    setError(null);
  };

  return (
    <>
      <p className="text-slate-300 leading-relaxed mb-6 p-4 bg-slate-800/50 rounded-md border-l-4 border-red-500">
        <strong className="text-red-400">Warning:</strong> This action is irreversible. Deleting a user will permanently remove their account and all associated data including scores and statistics.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-md">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Search User Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-slate-300 mb-2">
              User ID
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Enter user ID to search"
                min="1"
                disabled={isSearching}
              />
              <button
                onClick={handleSearchUser}
                disabled={isSearching || !userId.trim()}
                className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        {userToDelete && !showConfirmation && (
          <div className="p-4 bg-slate-800 border border-slate-600 rounded-md">
            <h3 className="text-lg font-semibold text-white mb-3">User Found</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-300">
                <span className="text-slate-400">ID:</span> {userToDelete.id}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Username:</span> {userToDelete.username}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Admin Status:</span>{' '}
                <span className={userToDelete.isAdmin ? 'text-yellow-400' : 'text-green-400'}>
                  {userToDelete.isAdmin ? 'Admin' : 'Regular User'}
                </span>
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowConfirmation(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                Delete User
              </button>
              <button
                onClick={resetForm}
                className="bg-slate-600 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Section */}
        {showConfirmation && userToDelete && (
          <div className="p-4 bg-red-900/20 border border-red-600 rounded-md">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Confirm Deletion</h3>
            <p className="text-slate-300 mb-4">
              Are you absolutely sure you want to delete the user <strong className="text-white">"{userToDelete.username}"</strong>?
            </p>
            <p className="text-sm text-red-300 mb-4">
              This action cannot be undone. All user data, scores, and statistics will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete User'}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isDeleting}
                className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDeletion;
