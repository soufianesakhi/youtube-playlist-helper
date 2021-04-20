interface Video {
  id: string | number;
  videoId: string;
  url: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
}

type FetchVideo = (id: string) => Promise<Video>;
type ParseYoutubeId = (url: string) => string;

interface Window {
  fetchVideo: FetchVideo;
  parseYoutubeId: ParseYoutubeId;
  youtubeRegexPattern: string;
}
