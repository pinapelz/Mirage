interface UserScript {
  name: string;
  url: string;
}

interface FlowerUserscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainGameName: string;
  userPage: string;
  importPage: string;
  scripts: UserScript[];
}

interface FlowerUserscriptCardProps {
  mainGameName: string;
  onClick: () => void;
}

export const FlowerUserscriptCard = ({ mainGameName, onClick }: FlowerUserscriptCardProps) => {
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
      <h4 className="text-white font-semibold mb-2">
        {mainGameName} Flower/Eagle Play History (Userscript)
      </h4>
      <p className="text-slate-400 text-sm mb-4">
        Import playdata from cabinets on the Flower network
      </p>
      <button
        onClick={onClick}
        className="hover:cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base font-medium transition-colors"
      >
        Export Flower/Eagle Data
      </button>
    </div>
  )
}

const FlowerUserscriptModal = ({
  isOpen,
  onClose,
  mainGameName,
  userPage,
  importPage,
  scripts,
}: FlowerUserscriptModalProps) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };
  if(mainGameName === undefined){
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
              Import {mainGameName} Flower/Eagle Play Data
            </h3>
            <p className="text-slate-400 text-sm">
              Follow the instructions below to import your data
            </p>
          </div>

          {/* Warning */}
          <div className="mb-6 rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
            <p className="text-sm text-blue-400">
              You will need your ACCESS CODE to register on Flower/Eagle for the first time! <br/><br/>
              Do this by tapping your Amusement IC card at any machine on the Flower/Eagle network and copying
              down the code displayed on the screen.
              <br/><br/>
              This is likely not the same code as the one on the back of your card.
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-4 rounded-md bg-slate-800 border border-slate-700 p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">
              Instructions:
            </h4>
            <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
              <li>
                Log into the{" "}
                <a
                  className="font-bold hover:underline"
                  href={userPage}>
                  {mainGameName} Project Flower page
                </a>
              </li>
              <li>
                Navigate to the{" "}
                <a
                  className="font-bold hover:underline"
                  href={importPage}>
                  {mainGameName} Play History Page
                </a>{" "}
              </li>
              <li>
                Install the relevant userscript (use a browser extension such as{" "}
                <a
                  className="font-bold hover:underline"
                  href="https://violentmonkey.github.io/">Violentmonkey</a>)
              </li>
              {/* Additional Info */}
              <div className="my-2 rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
                <p className="text-sm text-blue-400">
                  {scripts.map(userscript => (
                    <a
                      href={userscript.url}
                      className="font-bold underline"
                    >
                      {userscript.name}
                    </a>
                  ))}
                </p>
              </div>
              <li>
                A button will appear on the page that you can click to start the scraping process.
              </li>
              <li>
                Upload the resulting JSON file into Mirage using the
                Batch-Manual Upload functionality
              </li>
              <li>Verify that all data has been imported correctly</li>
            </ol>
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

export default FlowerUserscriptModal;
