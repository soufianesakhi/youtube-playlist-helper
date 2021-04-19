interface Video {
  id: string | number;
  videoId: string;
  url: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
}

type fetchVideoType = (id: string) => Promise<Video>;

interface Window {
  fetchVideo: fetchVideoType;
}
