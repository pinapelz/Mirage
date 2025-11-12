import type { SupportedGame } from "../../types/game";

interface DonerHirobaModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: SupportedGame | undefined;
  renderAsCard?: () => void;
}

const TaikoDonderHirobaModal = ({
  isOpen,
  onClose,
  game,
  renderAsCard,
}: DonerHirobaModalProps) => {
  if (renderAsCard) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-violet-500 transition-colors">
        <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
        <h4 className="text-white font-semibold mb-2">Donder Hiroba Import</h4>
        <p className="text-slate-400 text-sm mb-4">
          Import Play History from Donder Hiroba
        </p>
        <button
          onClick={renderAsCard}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base font-medium transition-colors"
        >
          Export MyPage
        </button>
      </div>
    );
  }

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };
  if (game === undefined) {
    return "Sorry, due to some extreme error the game you're looking for doesn't seem to exist...";
  }
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-slate-900 rounded-lg border border-slate-700 w-full max-w-xl p-6 shadow-xl">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Import {game.formattedName} Data (Donder Hiroba)
            </h3>
            <p className="text-slate-400 text-sm">
              Exporting from Donder Hiroba requires slightly more setup than
              other methods. Follow the instructions{" "}
              <a
                href="https://github.com/pinapelz/donder-hiroba-to-mirage-import/blob/main/README.md"
                className="text-blue-500 hover:underline"
              >
                here
              </a>
              .
            </p>
          </div>
          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaikoDonderHirobaModal;
