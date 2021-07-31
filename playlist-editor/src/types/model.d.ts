interface Video {
  id: string | number;
  videoId: string;
  url: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
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
  openPlaylistPage: boolean;
  closeAfterCombine: boolean;
  disableThumbnails: boolean;
  defaultEditorPage: string;
}
