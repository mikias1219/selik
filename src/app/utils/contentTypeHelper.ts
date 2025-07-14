const contentTypeMap: Record<string, string> = {
  movies: "movie",
  music: "music",
  games: "game",
  ebooks: "book",
  posters: "series",
};

export function getApiContentType(pluralType: string): string {
  return contentTypeMap[pluralType.toLowerCase()] || pluralType.toLowerCase();
}
