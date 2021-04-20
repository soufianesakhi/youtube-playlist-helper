/// <reference path="../types/services.d.ts" />

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";
const THUMBNAIL_URL_PREFIX = "https://i.ytimg.com/vi/";
const THUMBNAIL_URL_SUFFIX = "/default.jpg";

const youtubeServiceURL = globalThis.youtubeServiceURL;

let idCount = 1;

window.fetchVideo = async (videoId: string) => {
  const res = await fetch(
    `${youtubeServiceURL}/get_video_info?video_id=${videoId}`,
    {
      headers: { origin: "https://www.youtube.com" },
    }
  );
  const text = await res.text();
  const playerRes = new URLSearchParams(text).get("player_response");
  const { videoDetails } = JSON.parse(playerRes);
  return {
    id: idCount++,
    videoId,
    url: YOUTUBE_URL_PREFIX + videoId,
    title: videoDetails.title,
    channel: videoDetails.author,
    thumbnailUrl: THUMBNAIL_URL_PREFIX + videoId + THUMBNAIL_URL_SUFFIX,
  };
};

export {};
