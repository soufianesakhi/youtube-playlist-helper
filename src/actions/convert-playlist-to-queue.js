// @ts-nocheck
(async () => {
  async function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function lastSelector(selector) {
    return Array.from(document.querySelectorAll(selector)).pop();
  }

  document.querySelector("ytd-compact-video-renderer #menu yt-icon").click();
  await wait(500);

  document
    .querySelector("ytd-popup-container #items yt-formatted-string")
    .click();

  await wait(1000);

  lastSelector(
    "#content ytd-playlist-panel-video-renderer ytd-menu-renderer yt-icon"
  ).click();

  await wait(500);

  [
    ...document.querySelectorAll(
      "ytd-popup-container #items yt-formatted-string"
    ),
  ]
    .filter((e) => e.textContent.toLowerCase().includes("remove"))
    .shift()
    .click();

  document.body.scrollIntoView();

  await wait(200);

  alert("Playlist converted to queue");
})();
