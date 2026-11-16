const STORAGE_KEY = "algo_match_tpack_state_v1";

const DEFAULT_STATE = {
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
    if (parsed.level1) Object.assign(gameState.level1, parsed.level1);
    if (parsed.level2) Object.assign(gameState.level2, parsed.level2);
    if (typeof parsed.soundEnabled === "boolean") {
      gameState.soundEnabled = parsed.soundEnabled;
    }
  } catch (err) {
    console.warn("Gagal memuat progres dari localStorage:", err);
  }
}

export function saveProgress() {
  try {
    const payload = {
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
  Object.assign(gameState, structuredClone(DEFAULT_STATE));
  gameState.soundEnabled = keepSound;
  saveProgress();
}

export function calculateStars(score) {
  if (score >= 50) return 3;
  if (score >= 40) return 2;
  return 1;
}