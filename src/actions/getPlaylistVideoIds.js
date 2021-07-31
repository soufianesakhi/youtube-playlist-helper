[
  ...document.querySelectorAll(
    "#content .ytd-playlist-panel-video-renderer[href], #content .ytd-playlist-video-renderer[href]"
  ),
]
  .map((e) => e.getAttribute("href"))
  .map((href) => href && href.match(/watch\?v=([^&,]+)/))
  .map((match) => (match && match[1]) || "")
  .filter((id) => id !== "");
