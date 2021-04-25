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
  videos: Video[] | string[];
  timestamp: number;
}
