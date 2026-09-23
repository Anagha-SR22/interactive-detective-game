import { state } from "./gameState.js";

const KEY = "rajarajeshwari-villa-save-v1";

export function saveGame() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasSave() {
  return !!localStorage.getItem(KEY);
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

export function hydrateState(saved) {
  if (!saved) return;
  Object.keys(state).forEach(key => {
    if (saved[key] !== undefined) state[key] = saved[key];
  });
}
