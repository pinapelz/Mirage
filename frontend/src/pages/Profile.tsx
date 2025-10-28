import { useNavigate } from 'react-router';
import LoadingDisplay  from "../components/LoadingDisplay";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import { NavBar } from '../components/NavBar';
import { useAuth } from "../contexts/AuthContext";



const Profile = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingDisplay message="Loading Profile Page..." />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Network error during logout. Please try again.");
    }
  };

  if (!user) {
    return <SessionExpiredPopup />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar user={user} handleLogout={handleLogout} currentPage="import"/>
      <h1>Profile</h1>
    </div>
  );
};

export default Profile;
