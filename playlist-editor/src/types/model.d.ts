interface Video {
  id: string | number;
  videoId: string;
  url: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
}

interface PlaylistExport {
  title: string;
  videos: string[];
  timestamp: number;
}

interface Playlist {
  id: string;
  title: string;
  loadedVideos?: Video[];
  videos: string[];
  timestamp: number;
  saved?: boolean;
}

interface Settings {
  [id: string]: any;
  openPlaylistEditorAfterCreation: boolean;
  openPlaylistPage: boolean;
  closeAfterCombine: boolean;
  disableThumbnails: boolean;
  openPlaylistBuilderAfterAdd: boolean;
  openSavedPlaylistAfterAdd: boolean;
  defaultEditorPage: "/recent" | "/new" | "/saved";
  createdPlaylistStorage: "recent" | "saved" | "";
}
