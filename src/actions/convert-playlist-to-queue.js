// @ts-nocheck
(async () => {
  async function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function lastSelector(selector) {
    return Array.from(document.querySelectorAll(selector)).pop();
  }

  for (let i = 0; i < 2; i++) {
    document.querySelector("ytd-compact-video-renderer #menu yt-icon").click();
    await wait(200);
    document
      .querySelector("ytd-popup-container #items yt-formatted-string")
      .click();
  }

  await wait(1000);

  for (let i = 0; i < 2; i++) {
    await wait(200);

    lastSelector(
      "#content ytd-playlist-panel-video-renderer ytd-menu-renderer yt-icon"
    ).click();

    await wait(200);

    lastSelector("ytd-popup-container #items yt-formatted-string").click();
  }

  document.body.scrollIntoView();
  
  await wait(200);
  
  alert("Playlist converted to queue");
})();
