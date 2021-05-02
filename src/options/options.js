/// <reference path="../../playlist-editor/src/types/model.d.ts" />

class CheckBoxOption {
  /**
   * @param {string} id
   * @param {boolean} defaultValue
   */
  constructor (id, defaultValue) {
    this.id = id;
    this.defaultValue = defaultValue;
  }

  restore() {
    browser.storage.sync.get(this.id).then((result) => {
      query(`#${this.id}`).checked =
        result && result[this.id] != null ? result[this.id] : this.defaultValue;
    }, console.log);
  };

  async save() {
    const input = query(`#${this.id}:checked`);
    await browser.storage.sync.set({
      [this.id]: !!input,
    });
  };
}

/**
 * @type {Settings}
 */
let settings;

/**
 * @type {CheckBoxOption[]}
 */
let options = [];

/**
 * @param  {Event} e
 */
async function saveOptions(e) {
  e.preventDefault();
  await Promise.all(options.map(option => option.save()));
  alert("Settings saved");
}

async function restoreOptions() {
  settings = await window.getSettings();
  Object.keys(settings).forEach((id) => {
    const option = new CheckBoxOption(id, settings[id]);
    options.push(option);
    option.restore();
  });
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
