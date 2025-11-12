import type { SupportedGame } from "../../types/game";

interface TaikoEGTSModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: SupportedGame | undefined;
  renderAsCard?: () => void;
}

const TaikoEGTSModal = ({
  isOpen,
  onClose,
  game,
  renderAsCard,
}: TaikoEGTSModalProps) => {
  if (renderAsCard) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-[#533166] transition-colors">
        <div className="w-12 h-12 bg-[#533166]/20 rounded-lg flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-[#8a5a9c]"
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
        <h4 className="text-white font-semibold mb-2">EGTS/TaikoLocalServer Import</h4>
        <p className="text-slate-400 text-sm mb-4">
          Import Play History from EGTS Legacy WebUI or a local TaikoLocalServer instance
        </p>
        <button
          onClick={renderAsCard}
          className="hover:cursor-pointer w-full bg-[#533166] hover:bg-[#4a2c5a] text-white py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base font-medium transition-colors"
        >
          Export EGTS Play History
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
              Import {game.formattedName} EGTS Data
            </h3>
            <p className="text-slate-400 text-sm">
              Follow the instructions below to import your data
            </p>
          </div>
          {/* Warning */}
          <div className="mb-6 rounded-md bg-[#533166]/10 border border-[#533166]/20 p-3">
            <p className="text-sm text-[#8a5a9c]">
              Before exporting ensure that the display language of Songs is set to Japanese, or is consistent with your other imports so that your data is consistent.
            </p>
          </div>


          {/* Instructions */}
          <div className="mb-4 rounded-md bg-slate-800 border border-slate-700 p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">
              Instructions:
            </h4>
            <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
              <li>Log into your the WebUI. Its assumed you already know the link if you're using this import method</li>
              <li>
                Install the appropriate userscript to your browser (use an extension such
                as Tampermonkey).
              </li>
              {/* Additional Info */}
              <div className="my-2 rounded-md bg-[#533166]/10 border border-[#533166]/20 p-3">
                <p className="text-sm text-[#8a5a9c]">
                  <a
                    href="https://github.com/pinapelz/Mirage/raw/refs/heads/main/scripts/taiko/egts/taiko_egts_to_mirage.user.js"
                    className="underline"
                  >
                    EGTS/TAL Export Userscript
                  </a>
                </p>
              </div>
              <li>
                On the WebUI, navigate to the "Play History" page and refresh.
              </li>
              <li>
                A button will appear on the page that you can click to start the scraping process.
              </li>
              <li>Upload the resulting JSON file into Mirage using the Batch-Manual Upload functionality</li>
              <li>Verify that all data has been imported correctly</li>
            </ol>
          </div>


          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-[#533166] hover:bg-[#4a2c5a] text-white rounded-md font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaikoEGTSModal;
