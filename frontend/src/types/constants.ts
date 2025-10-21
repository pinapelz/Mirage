export const globalSkipKeys = [
  "id",
  "internalname",
  "internalName",
  "gameInternalName",
  "userId",
  "chartId"
];

export function getFilterOptions(game: string): { value: string; label: string }[] {
  switch (game) {
    case "dancerush":
      return [
        { value: "timestamp", label: "Recently Played" },
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
