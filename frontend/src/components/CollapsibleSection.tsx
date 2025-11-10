import { ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const CollapsibleSection = ({ title, isOpen, onToggle, children }: CollapsibleSectionProps) => {
  return (
    <div className="mb-8">
      <div className="bg-slate-900 rounded-lg border border-slate-700">
        <button
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800 transition-colors rounded-lg"
          onClick={onToggle}
        >
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <svg
            className={`w-5 h-5 text-slate-400 transform transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="px-6 pb-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleSection;