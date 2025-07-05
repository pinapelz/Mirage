import type { SupportedGame } from "../../types/game";
import { EamuseImportInfo } from "../../types/constants";

interface EamusementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: SupportedGame | undefined;
}

const EamusementUploadModal = ({
  isOpen,
  onClose,
  game,
}: EamusementUploadModalProps) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };
  if(game === undefined){
    return "Sorry, due to some extreme error the game you're looking for doesn't seem to exist..."
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
              Import {game.formattedName} Data
            </h3>
            <p className="text-slate-400 text-sm">
              Follow the instructions below to import your data
            </p>
          </div>

          {/* Warning */}
          <div className="mb-6 rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
            <p className="text-sm text-blue-400">
              You may or may need to be subscribed to{" "}
              <a
                className="font-bold hover:underline"
                href="https://p.eagate.573.jp/payment/p/ex_select_course.html"
              >
                KONAMI's e-amusement Basic and/or Premium course
              </a>{" "}
              to view a exportable playdata history for certain games.
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-4 rounded-md bg-slate-800 border border-slate-700 p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">
              Instructions:
            </h4>
            <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
              <li>Log into your e-amusement account</li>
              {EamuseImportInfo[game.internalName] ? (
                <li>
                  Navigate to your{" "}
                  <a href={EamuseImportInfo[game.internalName]?.scorePage}>
                    {game.formattedName} score data page
                  </a>{" "}
                  {game.formattedName} score data page
                </li>
              ) : (
                <li>Navigate to your {game.formattedName} score data page</li>
              )}
              {EamuseImportInfo[game.internalName] ? (
                <li>
                  Install the userscript to your browser (use an extension such
                  as Tampermonkey)
                </li>
              ) : (
                <li>
                  Scrape the data using any method of your choice and translate
                  it into a Mirage {game.formattedName} compatible JSON format
                </li>
              )}
              <li>Upload the resulting JSON file into Mirage using the Batch-Manual Upload functionality</li>
              <li>Verify that all data has been imported correctly</li>
            </ol>
          </div>

          {/* Additional Info */}
          <div className="mb-6 rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
            <p className="text-sm text-blue-400">
              This feature is currently under development. Please check back
              later for the full implementation.
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

export default EamusementUploadModal;
