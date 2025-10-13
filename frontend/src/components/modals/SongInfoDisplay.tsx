import { useEffect, useState, useCallback } from "react";

interface ChartInfo {
  title: string;
  artist: string;
  notes?: number;
  game?: string;
  difficulties: DifficultyInfo[];
}

interface DifficultyInfo {
  difficulty: string;
  level?: number;
}

interface SongInfoDisplayProps {
  scores?: Record<string, unknown>[];
}

const SongInfoDisplay = ({
  scores = [],
}: SongInfoDisplayProps) => {
  const [chartInfo, setChartInfo] = useState<ChartInfo | null>(null);

  const extractInfoFromScores = useCallback(() => {
    if (scores.length === 0) {
      setChartInfo(null);
      return;
    }

    const firstScore = scores[0];
    const title = firstScore.title as string || "Unknown Title";
    const artist = firstScore.artist as string || "Unknown Artist";
    const notes = firstScore.notes as number;
    const game = firstScore.game as string;

    const difficultyMap = new Map<string, DifficultyInfo>();

    scores.forEach(score => {
      if (score.difficulty !== undefined) {
        const diffKey = (score.diff_lamp as string) || (score.difficulty as string).toString();
        if (!difficultyMap.has(diffKey)) {
          const level = score.diff_lamp
            ? (score.difficulty as number)
            : (score.level as number);

          difficultyMap.set(diffKey, {
            difficulty: diffKey,
            level: level,
          });
        }
      }
    });

    const difficulties = Array.from(difficultyMap.values()).sort((a, b) => {
      if (a.level !== undefined && b.level !== undefined) {
        return a.level - b.level;
      }
      return a.difficulty.localeCompare(b.difficulty);
    });

    setChartInfo({
      title,
      artist,
      notes,
      game,
      difficulties
    });
  }, [scores]);

  useEffect(() => {
    extractInfoFromScores();
  }, [extractInfoFromScores]);

  if (!chartInfo) return null;

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Song Details */}
        <div className="lg:col-span-2 space-y-4">
          {chartInfo.game && (
            <div className="text-center">
              <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                {chartInfo.game}
              </span>
            </div>
          )}

          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {chartInfo.title}
            </h3>
            <p className="text-lg text-slate-300">
              {chartInfo.artist}
            </p>
          </div>

          {chartInfo.notes && (
            <div className="text-center mt-4">
              <span className="block text-xs text-slate-400 mb-1">Notes</span>
              <span className="text-sm text-white">{chartInfo.notes}</span>
            </div>
          )}
        </div>

        {/* Right - Charts */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 text-center">Known Difficulties</h4>
          <div className="space-y-2">
            {chartInfo.difficulties.map((diff, index) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-lg p-3 border border-slate-600 text-center"
              >
                <div className="font-medium text-white text-sm">
                  {diff.difficulty.toUpperCase()}
                  {diff.level !== undefined && ` ${diff.level}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongInfoDisplay;
