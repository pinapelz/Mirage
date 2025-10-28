import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { isBrowser } from "react-device-detect";
import LoadingDisplay from "../components/LoadingDisplay";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../contexts/AuthContext";
import Heatmap from "../components/Heatmap";
import type { HeatmapData } from "../components/Heatmap";

const Profile = () => {
  const { user, isLoading, logout } = useAuth();
  const targetUser =
    new URLSearchParams(window.location.search).get("userId") || ""; // looking at profile of this user
  const navigate = useNavigate();
  const [fetchingHeatmapData, setFetchingHeatmapData] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({ data: [] });

  useEffect(() => {
    if (targetUser) {
      setFetchingHeatmapData(true);
      const fetchHeatmapData = async () => {
        try {
          const response = await fetch(
            new URL(
              import.meta.env.VITE_API_URL + "/heatmap?userId=" + targetUser,
            ),
            { credentials: "include" },
          );
          const data = await response.json();
          return data;
        } catch (error) {
          setFetchingHeatmapData(false);
          console.error("Failed to fetch heatmap data:", error);
          throw error;
        }
      };
      fetchHeatmapData().then((data) => {
        const heatmapDates: { [key: string]: number } = {};
        for (let i = 0; i < data.scores.length; i++) {
          const date = new Date(data.scores[i].timestamp);
          const dateString = date.toDateString();
          if (!heatmapDates[dateString]) {
            heatmapDates[dateString] = 1;
          } else {
            heatmapDates[dateString] += 1;
          }
        }
        setHeatmapData({
          data: Object.entries(heatmapDates).map(([date, count]) => ({
            date,
            count,
          })),
        });
        setFetchingHeatmapData(false);
      });
    }
  }, [targetUser]);

  if (!targetUser) {
    navigate("/");
  }

  if (isLoading || fetchingHeatmapData) {
    return <LoadingDisplay message="Loading Profile Page..." />;
  }

  if (!user) {
    return <SessionExpiredPopup />;
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
      <NavBar user={user} handleLogout={handleLogout} currentPage="" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {user.username}
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            This is a profile page for {user.username}
          </p>
        </div>
        {isBrowser ? (
          <div className="flex flex-col items-center justify-center">
            <Heatmap data={heatmapData.data} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
