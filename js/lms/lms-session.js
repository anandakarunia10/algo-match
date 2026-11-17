import { LMS_CONFIG } from "./lms-config.js";

export async function hashPassword(plainText) {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    hash = (hash << 5) - hash + plainText.charCodeAt(i);
    hash |= 0;
  }
  return "fallback_" + Math.abs(hash).toString(16);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(LMS_CONFIG.SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && user.nim ? user : null;
  } catch {
    localStorage.removeItem(LMS_CONFIG.SESSION_KEY);
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem(LMS_CONFIG.SESSION_KEY, JSON.stringify(user));
  syncIdentityToGame(user);
}

export function clearSession() {
  localStorage.removeItem(LMS_CONFIG.SESSION_KEY);
}

export function syncIdentityToGame(user) {
  try {
    const gameRaw = localStorage.getItem(LMS_CONFIG.GAME_STATE_KEY);
    const gameObj = gameRaw ? JSON.parse(gameRaw) : {};
    gameObj.player = {
      nama: user.nama,
      nim: user.nim,
      kelas: user.kelas,
    };
    localStorage.setItem(LMS_CONFIG.GAME_STATE_KEY, JSON.stringify(gameObj));
  } catch (err) {
    console.warn("Gagal menyinkronkan identitas ke state game:", err);
  }
}