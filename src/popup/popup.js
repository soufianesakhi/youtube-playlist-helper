document.getElementById("from-bookmark").onclick = () => {
  activatePopupMenu("from-bookmark-menu");
};

document.getElementById("from-urls").onclick = () => {
  activatePopupMenu("from-urls-menu");
};

document.querySelectorAll(".back-item").forEach(
  /** @param {HTMLElement} item */
  (item) => {
    item.onclick = () => {
      activatePopupMenu("main-menu");
    };
  }
);

function activatePopupMenu(menuId) {
  document.querySelectorAll(".popup-menu").forEach(
    /** @param {HTMLElement} menu */
    (menu) => {
      menu.style.display = "none";
    }
  );
  document.getElementById(menuId).style.display = "block";
}
