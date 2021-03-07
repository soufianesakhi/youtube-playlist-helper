[
  ...document.querySelectorAll(
    ".ytd-playlist-panel-video-renderer[href], .ytd-playlist-video-renderer[href]"
  ),
]
  .map((e) => e.getAttribute("href"))
  .map((href) => href && href.match(/watch\?v=([^&,]+)/))
  .map((match) => (match && match[1]) || "")
  .filter((id) => id !== "");