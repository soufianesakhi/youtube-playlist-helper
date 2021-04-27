/**
 * video-service
 */

type FetchVideo = (id: string) => Promise<Video>;
type ParseYoutubeId = (url: string) => string;
type GeneratePlaylist = (videoIds: string[]) => Promise<Playlist>;
type OpenPlaylistEditor = (playlist: Playlist) => void;

interface Window {
  videoIdCount: number;
  youtubeRegexPattern: string;
  fetchVideo: FetchVideo;
  parseYoutubeId: ParseYoutubeId;
  generatePlaylist: GeneratePlaylist;
  openPlaylistEditor: OpenPlaylistEditor;
}

/**
 * storage-service
 */

type GeneratePlaylistId = () => Promise<string>;
type SavePlaylist = (playlist: Playlist) => void;
type GetPlaylists = () => Promise<Playlist[]>;

interface Window {
  generatePlaylistId: GeneratePlaylistId;
  savePlaylist: SavePlaylist;
  saveRecentPlaylist: SavePlaylist;
  getRecentPlaylists: GetPlaylists;
}
