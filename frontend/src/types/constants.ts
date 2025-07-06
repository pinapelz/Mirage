export const EamuseImportInfo: Record<string, { scorePage: string }> = {
  dancerush: {
    scorePage: "https://p.eagate.573.jp/game/dan/1st/playdata/entrance.html#music_data",
  },
};

export function getFilterOptions(game: string): { value: string; label: string }[] {
  switch (game) {
    case "dancerush":
      return [
        { value: "timestamp", label: "Recent" },
        { value: "score", label: "Score" },
        { value: "lamp", label: "Rank" },
        { value: "lamp_diff", label: "Difficulty"}
      ];
    default:
      return [
        { value: "timestamp", label: "Recent" },
        { value: "score", label: "Score" },
      ];
  }
}
