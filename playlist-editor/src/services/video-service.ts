/// <reference path="../types/services.d.ts" />

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";
const THUMBNAIL_URL_PREFIX = "https://i.ytimg.com/vi/";
const THUMBNAIL_URL_SUFFIX = "/default.jpg";

const youtubeServiceURL = globalThis.youtubeServiceURL;

let idCount = 100;

// https://regex101.com/r/mPyKKP/1/
window.youtubeRegexPattern = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/.source;

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

window.parseYoutubeId = (url: string) => {
  const result = RegExp(window.youtubeRegexPattern, "i").exec(url);
  if (result && result.length > 1) {
    return result[1];
  }
  return null;
};

window.generatePlaylist = async (videoIds: string[]) => {
  const id = await window.generatePlaylistId();
  const date = new Date();
  return {
    id,
    title: date.toLocaleString(),
    videos: videoIds,
    timestamp: date.getTime(),
  };
};

export {};
