interface Video {
  id: string;
  url: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
}

interface Playlist {
  id: string;
  title: string;
  videos: Video[];
  timestamp: number;
}
