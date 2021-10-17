// @ts-nocheck
document.querySelector('ytd-compact-video-renderer #menu yt-icon').click();
setTimeout(() => {
    document.querySelector('ytd-popup-container #items yt-formatted-string').click();
    setTimeout(() => {
        const menuBtn = Array.from(document.querySelectorAll('#content ytd-playlist-panel-video-renderer ytd-menu-renderer yt-icon')).pop();
        menuBtn.scrollIntoView();
        menuBtn.click();
        setTimeout(() => {
            Array.from(document.querySelectorAll("ytd-popup-container #items yt-formatted-string")).pop().click();
            document.body.scrollIntoView();
        }, 200);
    }, 1000);
}, 200);
