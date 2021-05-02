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

type GetSettings = () => Promise<Settings>;
type StoreObject = (id: string, obj: any) => void;
type FetchObject = <T>(id: string, defaultValue: T) => Promise<T>;
type GeneratePlaylistId = () => Promise<string>;
type SavePlaylist = (playlist: Playlist) => void;
type GetPlaylists = () => Promise<Playlist[]>;

interface Window {
  getSettings: GetSettings;
  storeObject: StoreObject;
  fetchObject: FetchObject;
  generatePlaylistId: GeneratePlaylistId;
  savePlaylist: SavePlaylist;
  getPlaylists: GetPlaylists;
  saveRecentPlaylist: SavePlaylist;
  getRecentPlaylists: GetPlaylists;
}
