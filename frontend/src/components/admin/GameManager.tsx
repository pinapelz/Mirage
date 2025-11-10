import { useState } from 'react';

interface GameFormData {
  gameInternalName: string;
  gameFormattedName: string;
  gameDescription: string;
}

interface GameManagerProps {
  onGameSubmit: (formData: GameFormData) => Promise<void>;
  isSubmitting: boolean;
}

const GameManager = ({ onGameSubmit, isSubmitting }: GameManagerProps) => {
  const [formData, setFormData] = useState<GameFormData>({
    gameInternalName: '',
    gameFormattedName: '',
    gameDescription: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

    await onGameSubmit(formData);
    
    // Reset form after successful submission
    setFormData({
      gameInternalName: '',
      gameFormattedName: '',
      gameDescription: ''
    });
  };

  return (
    <>
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
    </>
  );
};

export default GameManager;