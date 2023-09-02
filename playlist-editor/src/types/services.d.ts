interface Window {
  videoIdCount: number;
  youtubeRegexPattern: string;
  videoService: import("../services/video-service").VideoService;
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
type GeneratePlaylistIds = (size: number) => Promise<string[]>;
type ImportPlaylists = (playlistsExport: PlaylistExport[]) => Promise<void>;
type RemoveSavedPlaylists = () => Promise<void>;
type SavePlaylist = (playlist: Playlist) => Promise<string>;
type RemovePlaylist = (playlist: Playlist) => Promise<void>;
type GetPlaylists = () => Promise<Playlist[]>;
type GetPlaylist = (id: string) => Promise<Playlist>;

interface Window {
  getSettings: GetSettings;
  fetchObject: FetchObject;
  fetchAllObjects: FetchAllObjects;
  storeObject: StoreObject;
  removeObject: RemoveObject;
  generatePlaylistId: GeneratePlaylistId;
  generatePlaylistIds: GeneratePlaylistIds;
  importPlaylists: ImportPlaylists;
  removeSavedPlaylists: RemoveSavedPlaylists;
  savePlaylist: SavePlaylist;
  removePlaylist: RemovePlaylist;
  getPlaylists: GetPlaylists;
  getPlaylist: GetPlaylist;
}

/**
 * utils
 */

interface Window {
  success: (string) => Function;
  error: (string) => Function;
  info: (string) => Function;
}
