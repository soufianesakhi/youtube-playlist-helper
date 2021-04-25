type FetchVideo = (id: string) => Promise<Video>;
type ParseYoutubeId = (url: string) => string;
type GeneratePlaylist = (videoIds: string[]) => Promise<Playlist>;

type GeneratePlaylistId = () => Promise<string>;
type SavePlaylist = (playlist: Playlist) => void;
type GetPlaylists = () => Promise<Playlist[]>;

interface Window {
  youtubeRegexPattern: string;
  fetchVideo: FetchVideo;
  parseYoutubeId: ParseYoutubeId;
  generatePlaylist: GeneratePlaylist;
  generatePlaylistId: GeneratePlaylistId;
  savePlaylist: SavePlaylist;
  saveRecentPlaylist: SavePlaylist;
  getRecentPlaylists: GetPlaylists;
}
