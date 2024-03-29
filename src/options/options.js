const MULTI_VALUE_SETTINGS = ["defaultEditorPage", "themeChoice"];

/**
 * @typedef {import("../../playlist-editor/src/types/model.js").Settings} Settings
 * @typedef {import("./options.js").Option} Option
 */

/**
 * @param {string} id
 * @param {boolean} defaultValue
 * @returns {Option}
 */
function buildOption(id, defaultValue) {
  if (MULTI_VALUE_SETTINGS.indexOf(id) > -1) {
    return new SelectBoxOption(id, defaultValue);
  }
  return new CheckBoxOption(id, defaultValue);
}

/**
 * @implements {Option}
 */
class CheckBoxOption {
  /**
   * @param {string} id
   * @param {boolean} defaultValue
   */
  constructor(id, defaultValue) {
    this.id = id;
    this.defaultValue = defaultValue;
  }

  restore() {
    browser.storage.sync.get(this.id).then((result) => {
      /** @type {HTMLInputElement} */
      const element = query(`#${this.id}`);
      element.checked =
        result && result[this.id] != null ? result[this.id] : this.defaultValue;
    }, console.log);
  }

  async save() {
    const input = query(`#${this.id}:checked`);
    await browser.storage.sync.set({
      [this.id]: !!input,
    });
  }
}

/**
 * @implements {Option}
 */
class SelectBoxOption {
  /**
   * @param {string} id
   * @param {boolean} defaultValue
   */
  constructor(id, defaultValue) {
    this.id = id;
    this.defaultValue = defaultValue;
  }

  restore() {
    browser.storage.sync.get(this.id).then((result) => {
      /** @type {HTMLSelectElement} */
      const element = query(`#${this.id}`);
      element.value =
        result && result[this.id] != null ? result[this.id] : this.defaultValue;
    }, console.log);
  }

  async save() {
    /** @type {HTMLSelectElement} */
    const element = query(`#${this.id}`);
    await browser.storage.sync.set({
      [this.id]: element.value,
    });
  }
}

/**
 * @type {Settings}
 */
let settings;

/**
 * @type {Option[]}
 */
let options = [];

/**
 * @param  {Event} e
 */
async function saveOptions(e) {
  e.preventDefault();
  await Promise.all(options.map((option) => option.save()));
  browser.runtime.sendMessage({
    cmd: "update-settings",
  });
  window.success("Settings saved");
}

async function restoreOptions() {
  settings = await window.getSettings();
  Object.keys(settings).forEach((id) => {
    const option = buildOption(id, settings[id]);
    options.push(option);
    option.restore();
  });
  let theme = settings.themeChoice;
  if (theme == "device") {
    theme = window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.dataset.theme = theme;
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
