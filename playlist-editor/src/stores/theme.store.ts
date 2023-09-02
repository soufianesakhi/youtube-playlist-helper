import { derived, get, readable, writable, type Readable } from "svelte/store";
import type { Theme, ThemeChoice } from "../types/model.js";

const themeStorageKey = "themeChoice";

const theme = writable<ThemeChoice>("device");

export const currentTheme: Readable<Theme> = derived(theme, ($theme) =>
  $theme == "device"
    ? window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : $theme
);

function updatePageTheme() {
  document.documentElement.dataset.theme = get(currentTheme);
}

export function initTheme() {
  window
    .fetchObject(themeStorageKey, "device")
    .then((themeChoice: ThemeChoice) => {
      theme.set(themeChoice);
      theme.subscribe((themeChoice) => {
        window.storeObject(themeStorageKey, themeChoice);
        updatePageTheme();
      });
      updatePageTheme();
    });
}
