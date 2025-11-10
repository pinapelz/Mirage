import { useState } from 'react';

interface InviteFormData {
  uses: string;
  code: string;
}

interface InviteCodeManagerProps {
  onInviteSubmit: (formData: InviteFormData) => Promise<void>;
  isCreatingInvite: boolean;
  createdInviteCode: string | null;
}

const InviteCodeManager = ({ onInviteSubmit, isCreatingInvite, createdInviteCode }: InviteCodeManagerProps) => {
  const [inviteFormData, setInviteFormData] = useState<InviteFormData>({
    uses: '',
    code: ''
  });

  const handleInviteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInviteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteFormData.uses) {
      alert('Please specify the number of uses for the invite code');
      return;
    }

    const uses = parseInt(inviteFormData.uses);
    if (isNaN(uses) || uses <= 0) {
      alert('Please enter a valid number of uses');
      return;
    }

    await onInviteSubmit(inviteFormData);
    
    // Reset form after successful submission
    setInviteFormData({
      uses: '',
      code: ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Invite code copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <>
      <p className="text-slate-300 leading-relaxed mb-6 p-4 bg-slate-800/50 rounded-md border-l-4 border-violet-500">
        Generate invite codes to allow new users to register. You can specify how many times the code can be used
        and optionally set a custom code (otherwise one will be generated automatically).
      </p>

      {createdInviteCode && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-md">
          <h3 className="text-green-400 font-semibold mb-2">Invite Code Created Successfully!</h3>
          <div className="flex items-center gap-2">
            <code className="bg-slate-800 px-3 py-2 rounded text-green-300 font-mono">
              {createdInviteCode}
            </code>
            <button
              onClick={() => copyToClipboard(createdInviteCode)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="uses" className="block text-sm font-medium text-slate-300 mb-2">
            Number of Uses
          </label>
          <input
            type="number"
            id="uses"
            name="uses"
            value={inviteFormData.uses}
            onChange={handleInviteInputChange}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="How many times this code can be used"
            min="1"
            required
          />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-slate-300 mb-2">
            Custom Code (Optional)
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={inviteFormData.code}
            onChange={handleInviteInputChange}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Leave blank to generate automatically"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={isCreatingInvite}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isCreatingInvite ? 'Creating Invite Code...' : 'Create Invite Code'}
          </button>
        </div>
      </form>
    </>
  );
};

export default InviteCodeManager;