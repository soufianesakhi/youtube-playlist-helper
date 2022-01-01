/// <reference path="../types/services.d.ts" />

window.videoIdCount = 100;

// https://regex101.com/r/8OtNe5/1
window.youtubeRegexPattern =
  /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?\."'<\\]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?\."'<\\]{11,})/.source;

class VideoService {
  YOUTUBE_URL_PREFIX = "https://www.youtube.com/watch?v=";
  THUMBNAIL_URL_PREFIX = "https://i.ytimg.com/vi/";
  THUMBNAIL_URL_SUFFIX = "/default.jpg";

  youtubeServiceURL = globalThis.youtubeServiceURL;

  async fetchVideo(videoId: string, sessionOnly = false) {
    let title = "";
    let channel = "";
    let sessionVideoData = sessionStorage.getItem(videoId);
    if (!sessionOnly && !sessionVideoData) {
      try {
        const res = await fetch(
          `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
        );
        const json = await res.json();
        title = json.title;
        channel = json.author_name;
        sessionStorage.setItem(videoId, JSON.stringify({ title, channel }));
      } catch (e) {
        console.log(e);
      }
    } else if(sessionVideoData) {
      ({ title, channel } = JSON.parse(sessionVideoData));
    } else {
      title = "";
      channel = "";
    }
    return {
      id: window.videoIdCount++,
      videoId,
      url: this.YOUTUBE_URL_PREFIX + videoId,
      title,
      channel,
      thumbnailUrl: this.getVideoThumbnailUrl(videoId),
    };
  }

  getVideoThumbnailUrl(videoId) {
    if (!videoId) {
      return null;
    }
    return this.THUMBNAIL_URL_PREFIX + videoId + this.THUMBNAIL_URL_SUFFIX;
  }

  parseYoutubeId(url: string) {
    const result = RegExp(window.youtubeRegexPattern, "i").exec(url);
    if (result && result.length > 1) {
      return result[1];
    }
    return null;
  }

  parseYoutubeIds(text: string) {
    let matches: RegExpExecArray;
    let videoIds: string[] = [];
    const regex = RegExp(window.youtubeRegexPattern, "ig");
    while ((matches = regex.exec(text))) {
      videoIds.push(matches[1]);
    }
    return videoIds;
  }

  async generatePlaylist(videoIds?: string[]) {
    const id = await window.generatePlaylistId();
    const date = new Date();
    return {
      id,
      title: date.toLocaleString(),
      videos: videoIds || [],
      timestamp: date.getTime(),
    };
  }

  openPlaylistEditor(playlist: Playlist) {
    const previousPage =
      location.hash.length > 0 ? location.hash.substring(1) : "/";
    history.pushState({ playlist, previousPage }, "", "#/editor");
    window.dispatchEvent(new Event("hashchange"));
  }

  PLAYLIST_LIMIT = 50;
  async openPlaylist(videoIds: string[]) {
    const remainingVideoIds = [...videoIds];
    // prettier-ignore
    // @ts-ignore
    const videoIdsChunks = new Array(Math.ceil(remainingVideoIds.length / this.PLAYLIST_LIMIT)).fill().map(_ => remainingVideoIds.splice(0, this.PLAYLIST_LIMIT));
    const settings = await window.getSettings();
    await Promise.all(
      videoIdsChunks.map(async (videoIds) => {
        const video_ids = videoIds.join(",");
        let url = `https://www.youtube.com/watch_videos?video_ids=${video_ids}`;
        if (settings.openPlaylistPage) {
          url = `${this.youtubeServiceURL}/watch_videos?video_ids=${video_ids}`;
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
  }
}

window.videoService = new VideoService();

export type { VideoService };
