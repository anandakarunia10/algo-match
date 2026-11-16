const STORAGE_KEY = "algo_match_tpack_state_v1";
const SPREADSHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxYrbcHYtrjFrpJ-a3TjOV8Ut9zRn_rRwr7zDbovgbLgQx0b5GHE-4f-kCggxT818AsbA/exec";

const DEFAULT_STATE = {
  player: {
    nama: "",
    nim: "",
    kelas: "",
  },
  level1: {
    score: 0,
    stars: 0,
    completed: false,
    correct: 0,
    wrong: 0,
  },
  level2: {
    score: 0,
    stars: 0,
    completed: false,
    unlocked: false,
    correct: 0,
    wrong: 0,
  },
  soundEnabled: true,
  isPlaying: false,
  currentLevel: 1,
};

export const gameState = structuredClone(DEFAULT_STATE);

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.player) Object.assign(gameState.player, parsed.player);
    if (parsed.level1) Object.assign(gameState.level1, parsed.level1);
    if (parsed.level2) Object.assign(gameState.level2, parsed.level2);
    if (typeof parsed.soundEnabled === "boolean") {
      gameState.soundEnabled = parsed.soundEnabled;
    }

    // Isi otomatis form identitas jika sebelumnya sudah pernah diisi
    const namaInput = document.getElementById("input-player-nama");
    const nimInput = document.getElementById("input-player-nim");
    const kelasInput = document.getElementById("input-player-kelas");
    if (namaInput && gameState.player.nama) namaInput.value = gameState.player.nama;
    if (nimInput && gameState.player.nim) nimInput.value = gameState.player.nim;
    if (kelasInput && gameState.player.kelas) kelasInput.value = gameState.player.kelas;
  } catch (err) {
    console.warn("Gagal memuat progres dari localStorage:", err);
  }
}

export function saveProgress() {
  try {
    const payload = {
      player: gameState.player,
      level1: gameState.level1,
      level2: gameState.level2,
      soundEnabled: gameState.soundEnabled,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Gagal menyimpan progres ke localStorage:", err);
  }
}

export function resetAllProgress() {
  const keepSound = gameState.soundEnabled;
  const keepPlayer = { ...gameState.player };
  Object.assign(gameState, structuredClone(DEFAULT_STATE));
  gameState.soundEnabled = keepSound;
  gameState.player = keepPlayer;
  saveProgress();
}

export function calculateStars(score) {
  if (score >= 50) return 3;
  if (score >= 40) return 2;
  return 1;
}

export async function syncProgressToSpreadsheet(statusLabel = "Selesai") {
  if (!SPREADSHEET_WEBHOOK_URL) return;

  const payload = {
    nama: gameState.player?.nama || "Anonim",
    nim: gameState.player?.nim || "-",
    kelas: gameState.player?.kelas || "-",
    scoreLevel1: gameState.level1.score,
    scoreLevel2: gameState.level2.score,
    totalScore: gameState.level1.score + gameState.level2.score,
    totalStars: gameState.level1.stars + gameState.level2.stars,
    status: statusLabel,
  };

  try {
    await fetch(SPREADSHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("Gagal mengirim data ke Spreadsheet:", err);
  }
}