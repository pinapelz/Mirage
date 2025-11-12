import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router";
import LoadingDisplay from "../components/LoadingDisplay";
import { useAuth } from "../contexts/AuthContext";
import SessionExpiredPopup from "../components/SessionExpiredPopup";
import type { SupportedGame } from "../types/game";
import { uploadScore } from "../utils/scoreUpload";
import { NavBar } from "../components/NavBar";
import { EamusementUserscriptCard } from "../components/modals/EamusementUserscriptModal";
import { FlowerUserscriptCard } from "../components/modals/FlowerUserscriptModal";

const JsonUploadModal = lazy(() => import("../components/modals/JsonUploadModal"));
const EamusementUserscriptModal = lazy(() => import("../components/modals/EamusementUserscriptModal"));
const DivaNetModal = lazy(() => import("../components/modals/DivaNetModal"));
const MusicDiverModal = lazy(() => import("../components/modals/MusicDiverModal"));
const FlowerUserscriptModal = lazy(() => import("../components/modals/FlowerUserscriptModal"));
const TaikoDonderHirobaModal = lazy(() => import("../components/modals/TaikoDonderHirobaModal"));
const TaikoEGTSModal = lazy(() => import("../components/modals/TaikoEGTSModal"));

type ModalType = 'json' | 'dancerush' | 'dancearound' | 'divanet' | 'musicdiver' | 'nostalgia' | 'reflecbeat' | 'taiko';

const Import = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState("");
  const [openModal, setOpenModal] = useState<ModalType | null>(null);

  const [supportedGames, setSupportedGames] = useState<SupportedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    const fetchSupportedGames = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + "/supportedGames",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch supported games");
        }
        const data = await response.json();
        setSupportedGames(data);
      } catch (error) {
        console.error("Failed to fetch supported games:", error);
        setUploadStatus({
          type: "error",
          message: "Failed to load supported games. Please refresh the page.",
        });
      } finally {
        setGamesLoading(false);
      }
    };

    fetchSupportedGames();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Network error during logout. Please try again.");
    }
  };

  // has to be any as this is a dynamic trackerm with dynamic score formats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleJsonUpload = async (data: any) => {
    try {
      console.log("Uploading data for game:", selectedGame, data);

      const result = await uploadScore({
        meta: {
          game: data.meta.game,
          service: data.meta.service,
          playtype: data.meta.playtype,
        },
        scores: data.scores,
      });

      setUploadStatus({
        type: "success",
        message: `Successfully imported ${result.scoreCount} score(s) for ${supportedGames.find((g) => g.internalName === data.meta.game)?.formattedName || data.meta.game}`,
      });

      setTimeout(() => {
        setUploadStatus({ type: null, message: "" });
      }, 5000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to import data. Please try again.",
      });
    }
  };

  const JsonUploadCard = () => (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6 hover:border-violet-500 transition-colors">
      <div className="w-10 sm:w-12 h-10 sm:h-12 bg-violet-600/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
        <svg
          className="w-6 h-6 text-violet-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <h4 className="text-white font-semibold mb-2">Batch-Manual Upload</h4>
      <p className="text-slate-400 text-sm mb-4">
        Upload your game data from a Mirage compatible JSON file
      </p>
      <button
        onClick={() => setOpenModal('json')}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base font-medium transition-colors"
      >
        Upload JSON
      </button>
    </div>
  );

  const renderImportOptions = () => {
    switch (selectedGame) {
      case "dancerush":
        return (
          <>
            <JsonUploadCard />
            <EamusementUserscriptCard
            mainGameName="DANCERUSH"
            onClick={() => setOpenModal('dancerush')}
            />
          </>
        );
      case "dancearound":
        return (
          <>
            <JsonUploadCard />
            <EamusementUserscriptCard
              mainGameName="DANCE aROUND"
              onClick={() => setOpenModal('dancearound')}
            />
          </>
        );
      case "diva":
        return (
          <>
            <JsonUploadCard />
            <DivaNetModal
              isOpen={false}
              onClose={() => {}}
              game={supportedGames.find((g) => g.internalName === selectedGame)}
              renderAsCard={() => setOpenModal('divanet')}
            />
          </>
        );
      case "musicdiver":
        return (
          <>
            <JsonUploadCard />
            <MusicDiverModal
              isOpen={false}
              onClose={() => {}}
              game={supportedGames.find((g) => g.internalName === selectedGame)}
              renderAsCard={() => setOpenModal('musicdiver')}
            />
          </>
        );
      case "nostalgia":
        return (
          <>
            <JsonUploadCard />
            <FlowerUserscriptCard
            mainGameName="NOSTALGIA"
            onClick={() => setOpenModal('nostalgia')}
            />
          </>
        );
      case "reflecbeat":
        return (
          <>
            <JsonUploadCard />
            <FlowerUserscriptCard
            mainGameName="REFLEC BEAT"
            onClick={() => setOpenModal('reflecbeat')}
            />
          </>
        );
      case "taiko":
        return (
          <>
            <JsonUploadCard />
            <TaikoDonderHirobaModal
            isOpen={false}
            onClose={() => {}}
            game={supportedGames.find((g) => g.internalName === selectedGame)}
            renderAsCard={() => setOpenModal('taiko')}
            />
            <TaikoEGTSModal
            isOpen={false}
            onClose={() => {}}
            game={supportedGames.find((g) => g.internalName === selectedGame)}
            renderAsCard={() => setOpenModal('taiko')}
            />
          </>
        );
      default:
        return <JsonUploadCard />;
    }
  };

  if (isLoading) {
    return (
      <LoadingDisplay message="Loading Import Page..." />
    );
  }

  if (!user) {
    return <SessionExpiredPopup />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <NavBar user={user} handleLogout={handleLogout} currentPage="import"/>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Import Data</h1>
          <p className="text-sm sm:text-base text-slate-400">
            Import your game scores and progress from various sources
          </p>
        </div>

        {/* Status Message */}
        {uploadStatus.type && (
          <div
            className={`mb-6 rounded-md p-4 ${
              uploadStatus.type === "success"
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            <p
              className={`text-sm ${
                uploadStatus.type === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {uploadStatus.message}
            </p>
          </div>
        )}

        {/* Game Selection Card */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Select Game</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6">
              Choose the game you want to import data for
            </p>

            {gamesLoading ? (
              <div className="w-full md:w-96 bg-slate-800 border border-slate-600 rounded-md px-4 py-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-slate-400">Loading games...</span>
                </div>
              </div>
            ) : (
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full md:w-96 bg-slate-800 border border-slate-600 text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a game</option>
                {supportedGames.map((game) => (
                  <option
                    key={game.internalName}
                    value={game.internalName}
                    title={game.description}
                  >
                    {game.formattedName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Import Options */}
          {selectedGame && (
            <div className="space-y-6 mt-8">
              <h3 className="text-lg font-semibold text-white">
                Import Options
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderImportOptions()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals wrapped in Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        {openModal === 'json' && (
          <JsonUploadModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            onUpload={handleJsonUpload}
            game={
              supportedGames.find((g) => g.internalName === selectedGame)
                ?.formattedName || ""
            }
          />
        )}
        {openModal === 'dancerush' && (
          <EamusementUserscriptModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            mainGameName="DANCERUSH"
            userPage="https://p.eagate.573.jp/game/dan/1st/top/entrance.html"
            importPage="https://p.eagate.573.jp/payment/p/ex_select_course.html"
            scripts={[{
              name: "e-amusement Recently Played Score Export Userscript (Last 20 Played)",
              url: "https://github.com/pinapelz/Mirage/raw/refs/heads/main/scripts/dancerush/eamuse/dancerush_play_history.user.js"
            }]}
          />
        )}
        {openModal === 'dancearound' && (
          <EamusementUserscriptModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            mainGameName="DANCE aROUND"
            userPage="https://p.eagate.573.jp/game/around/1st/top/index.html"
            importPage="https://p.eagate.573.jp/game/around/1st/top/index.html#play_hist"
            scripts={[{
              name: "e-amusement Recently Played Score Export Userscript (Last 20 Played)",
              url: "https://github.com/pinapelz/Mirage/raw/refs/heads/main/scripts/dancearound/eamuse/dancearound_play_history.user.js"
            }]}
          />
        )}
        {openModal === 'divanet' && (
          <DivaNetModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            game={
              supportedGames.find((g) => g.internalName === selectedGame) ||
              undefined
            }
          />
        )}
        {openModal === 'musicdiver' && (
          <MusicDiverModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            game={
              supportedGames.find((g) => g.internalName === selectedGame) ||
              undefined
            }
          />
        )}
        {openModal === 'nostalgia' && (
          <FlowerUserscriptModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            mainGameName="NOSTALGIA"
            userPage="https://projectflower.eu"
            importPage="https://projectflower.eu/game/nostalgia/54827307"
            scripts={[{
              name: "Flower Play History (Exports only the page you are on)",
              url: "https://github.com/pinapelz/Mirage/raw/refs/heads/main/scripts/nostalgia/flower/nostalgia_flower_scraper.user.js"
            }]}
          />
        )}
        {openModal === 'reflecbeat' && (
          <FlowerUserscriptModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            mainGameName="REFLEC BEAT"
            userPage="https://projectflower.eu"
            importPage="https://projectflower.eu/game/rb/profile/21363050"
            scripts={[{
              name: "Flower Play History (Exports only the page you are on)",
              url: "https://github.com/pinapelz/Mirage/raw/refs/heads/main/scripts/reflecbeat/flower/reflecbeat_flower_scraper.user.js"
            }]}
          />
        )}
        {openModal === 'taiko' && (
          <TaikoDonderHirobaModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            game={
              supportedGames.find((g) => g.internalName === selectedGame) ||
              undefined
            }
          />
        )}
        {openModal === 'taiko' && (
          <TaikoEGTSModal
            isOpen={true}
            onClose={() => setOpenModal(null)}
            game={
              supportedGames.find((g) => g.internalName === selectedGame) ||
              undefined
            }
          />
        )}
      </Suspense>
    </div>
  );
};

export default Import;
