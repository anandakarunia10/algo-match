import { gameState, saveProgress } from "./storage.js";

let audioCtx = null;

// Jalur file dihitung relatif terhadap index.html
const bgm = new Audio("./assets/audio/backsound.mp3");
bgm.loop = true;
bgm.volume = 0.075; // Volume 25% agar tetap nyaman dan tidak menutupi SFX

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type, duration, delay = 0, volume = 0.14) {
  if (!gameState.soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

export function playClick() {
  playTone(520, "sine", 0.08, 0, 0.08);
}

export function playCorrect() {
  playTone(523.25, "triangle", 0.16, 0, 0.16);
  playTone(659.25, "triangle", 0.16, 0.09, 0.16);
  playTone(783.99, "triangle", 0.28, 0.18, 0.18);
}

export function playWrong() {
  playTone(240, "sawtooth", 0.18, 0, 0.11);
  playTone(190, "sawtooth", 0.24, 0.12, 0.11);
}

export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, idx) => {
    playTone(n, "triangle", 0.26, idx * 0.11, 0.16);
  });
}

export function playBacksound() {
  if (!gameState.soundEnabled) return;
  bgm.play().catch(() => {
    // Mencegah error di console jika browser memblokir autoplay sebelum klik pertama
  });
}

export function pauseBacksound() {
  bgm.pause();
}

export function initBacksound() {
  // Browser mewajibkan interaksi pertama pengguna sebelum memutar audio
  const startOnFirstInteract = () => {
    if (gameState.soundEnabled && bgm.paused) {
      playBacksound();
    }
    document.removeEventListener("click", startOnFirstInteract);
    document.removeEventListener("touchstart", startOnFirstInteract);
  };

  document.addEventListener("click", startOnFirstInteract);
  document.addEventListener("touchstart", startOnFirstInteract);
}

export function updateSoundUI() {
  const iconOn = document.getElementById("icon-sound-on");
  const iconOff = document.getElementById("icon-sound-off");
  if (!iconOn || !iconOff) return;

  if (gameState.soundEnabled) {
    iconOn.classList.remove("hidden");
    iconOff.classList.add("hidden");
  } else {
    iconOn.classList.add("hidden");
    iconOff.classList.remove("hidden");
  }
}

export function initAudioToggle() {
  updateSoundUI();
  const btn = document.getElementById("sound-toggle-btn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      gameState.soundEnabled = !gameState.soundEnabled;
      saveProgress();
      updateSoundUI();

      if (gameState.soundEnabled) {
        playClick();
        playBacksound();
      } else {
        pauseBacksound();
      }
    });
  }
}