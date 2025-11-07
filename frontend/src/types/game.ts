export interface SupportedGame {
  internalName: string;
  formattedName: string;
  description: string;
}

export interface Score {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  timestamp: string | number;
  username?: string;
}

export interface ScoreDisplayProps {
  scores: Score[];
  viewMode: "cards" | "table";
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onDelete?: (scoreId: number) => void;
  showUsername?: boolean;
  hideTitleArtist?: boolean;
}
