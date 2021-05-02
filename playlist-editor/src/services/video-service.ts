/// <reference path="../types/services.d.ts" />

const YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";
const THUMBNAIL_URL_PREFIX = "https://i.ytimg.com/vi/";
const THUMBNAIL_URL_SUFFIX = "/default.jpg";

const youtubeServiceURL = globalThis.youtubeServiceURL;

window.videoIdCount = 100;

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
    id: window.videoIdCount++,
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

window.openPlaylistEditor = (playlist: Playlist) => {
  const previousPage =
    location.hash.length > 0 ? location.hash.substring(1) : "/";
  history.pushState({ playlist, previousPage }, "", "#/editor");
  window.dispatchEvent(new Event("hashchange"));
};

const PLAYLIST_LIMIT = 50;
window.openPlaylist = async (videoIds: string[]) => {
  const remainingVideoIds = [...videoIds];
  // prettier-ignore
  // @ts-ignore
  const videoIdsChunks = new Array(Math.ceil(remainingVideoIds.length / PLAYLIST_LIMIT)).fill().map(_ => remainingVideoIds.splice(0, PLAYLIST_LIMIT));
  const settings = await window.getSettings();
  await Promise.all(
    videoIdsChunks.map(async (videoIds) => {
      var url =
        youtubeServiceURL + "/watch_videos?video_ids=" + videoIds.join(",");
      if (settings.openPlaylistPage) {
        const data = await (await fetch(url)).text();
        const exec = /og:video:url[^>]+\?list=([^"']+)/.exec(data);
        if (exec && exec.length > 1) {
          url = "https://www.youtube.com/playlist?list=" + exec[1];
        } else {
          alert(
            "Unable to retrieve playlist id. Directly playing videos instead..."
          );
        }
      }
      if (typeof browser != "undefined") {
        return browser.tabs.create({ url });
      } else {
        window.open(url, "_blank");
      }
    })
  );
};

export {};
