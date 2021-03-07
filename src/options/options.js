var CheckBoxOption = (function () {
  /**
   * @class
   * @param {string} id
   * @param {boolean} defaultValue
   */
  function CheckBoxOption(id, defaultValue) {
    this.id = id;
    this.defaultValue = defaultValue;
  }
  CheckBoxOption.prototype.restore = function () {
    browser.storage.sync.get(this.id).then((result) => {
      query(`#${this.id}`).checked =
        result && result[this.id] != null ? result[this.id] : this.defaultValue;
    }, console.log);
  };
  CheckBoxOption.prototype.save = function () {
    const input = query(`#${this.id}:checked`);
    browser.storage.sync.set({
      [this.id]: !!input,
    });
  };
  return CheckBoxOption;
})();

const OPEN_PLAYLIST_PAGE_OPTION = new CheckBoxOption(
  "open_playlist_page",
  false
);

const CLOSE_AFTER_COMBINE_OPTION = new CheckBoxOption(
  "close_after_combine",
  false
);

/**
 * @param  {Event} e
 */
function saveOptions(e) {
  e.preventDefault();
  OPEN_PLAYLIST_PAGE_OPTION.save();
  CLOSE_AFTER_COMBINE_OPTION.save();
}

function restoreOptions() {
  OPEN_PLAYLIST_PAGE_OPTION.restore();
  CLOSE_AFTER_COMBINE_OPTION.restore();
}

document.addEventListener("DOMContentLoaded", restoreOptions);
query("form").addEventListener("submit", saveOptions);

/**
 * @param  {string} selector
 * @returns {any}
 */
function query(selector) {
  return document.querySelector(selector);
}
