/**
 * video-service
 */

type FetchVideo = (id: string) => Promise<Video>;
type ParseYoutubeId = (url: string) => string;
type GeneratePlaylist = (videoIds: string[]) => Promise<Playlist>;
type OpenPlaylistEditor = (playlist: Playlist) => void;
type OpenPlaylist = (videoIds: string[]) => Promise<void>;

interface Window {
  videoIdCount: number;
  youtubeRegexPattern: string;
  fetchVideo: FetchVideo;
  parseYoutubeId: ParseYoutubeId;
  generatePlaylist: GeneratePlaylist;
  openPlaylistEditor: OpenPlaylistEditor;
  openPlaylist: OpenPlaylist;
}

/**
 * storage-service
 */

type GetSettings = () => Promise<Settings>;
type StoreObject = (id: string, obj: any) => Promise<void>;
type RemoveObject = (id: string) => Promise<void>;
type FetchObject = <T>(id: string, defaultValue: T) => Promise<T>;
type FetchAllObjects = () => Promise<{ [key: string]: any }>;
type GeneratePlaylistId = () => Promise<string>;
type SavePlaylist = (playlist: Playlist) => Promise<string>;
type RemovePlaylist = (playlist: Playlist) => Promise<void>;
type GetPlaylists = () => Promise<Playlist[]>;

interface Window {
  getSettings: GetSettings;
  fetchObject: FetchObject;
  fetchAllObjects: FetchAllObjects;
  storeObject: StoreObject;
  removeObject: RemoveObject;
  generatePlaylistId: GeneratePlaylistId;
  savePlaylist: SavePlaylist;
  removePlaylist: RemovePlaylist;
  getPlaylists: GetPlaylists;
  saveRecentPlaylist: SavePlaylist;
  getRecentPlaylists: GetPlaylists;
}
