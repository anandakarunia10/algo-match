import { gameState, saveProgress } from "../utils/storage.js";
import { playClick } from "../utils/audio.js";
import { renderLevelCards } from "./renderPages.js";

let pendingExitTarget = null;
let previousInfoOrigin = "page-submenu";

export function showToast(message) {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

export function setInfoOrigin(originPageId) {
  previousInfoOrigin = originPageId;
}

export function getInfoOrigin() {
  return previousInfoOrigin;
}

export function navigateTo(pageId, skipConfirm = false) {
  if (gameState.isPlaying && pageId !== "page-gameplay" && !skipConfirm) {
    pendingExitTarget = pageId;
    openExitModal();
    return;
  }

  if (pageId !== "page-gameplay") {
    gameState.isPlaying = false;
  }

  document.querySelectorAll(".page").forEach((section) => {
    section.classList.add("hidden");
    section.classList.remove("active");
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (pageId === "page-levels") {
    renderLevelCards();
  }
}

function openExitModal() {
  const modal = document.getElementById("exit-confirm-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeExitModal() {
  const modal = document.getElementById("exit-confirm-modal");
  if (modal) modal.classList.add("hidden");
}

export function initNavigation() {
  // Klik Logo Navbar -> Menu Pembelajaran
  document.getElementById("brand-home-btn")?.addEventListener("click", () => {
    playClick();
    navigateTo("page-portal");
  });

  // 3 Placeholder Menu di Portal Utama
  document.querySelectorAll(".placeholder-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      playClick();
      const menuName = link.getAttribute("data-menu-name") || "Menu";
      showToast(`Menu "${menuName}" disiapkan sebagai placeholder untuk pengembangan berikutnya.`);
    });
  });

  // Portal Utama -> Submenu Game Interaktif
  document.getElementById("btn-open-game-submenu")?.addEventListener("click", () => {
    playClick();
    navigateTo("page-submenu");
  });

  // Submenu Game Interaktif -> 3 Tujuan
  document.getElementById("btn-submenu-game")?.addEventListener("click", () => {
    playClick();
    navigateTo("page-splash");
  });

  document.getElementById("btn-submenu-materi")?.addEventListener("click", () => {
    playClick();
    setInfoOrigin("page-submenu");
    navigateTo("page-materi");
  });

  document.getElementById("btn-submenu-panduan")?.addEventListener("click", () => {
    playClick();
    setInfoOrigin("page-submenu");
    navigateTo("page-panduan");
  });

  // Splash -> Main Menu ALGO MATCH
  document.getElementById("btn-enter-algo-menu")?.addEventListener("click", () => {
    playClick();
    navigateTo("page-algo-menu");
  });

  // Main Menu ALGO MATCH -> Validasi Identitas lalu Pemilihan Level
  document.getElementById("btn-algo-start")?.addEventListener("click", () => {
    const namaEl = document.getElementById("input-player-nama");
    const nimEl = document.getElementById("input-player-nim");
    const kelasEl = document.getElementById("input-player-kelas");

    const nama = namaEl?.value.trim() || "";
    const nim = nimEl?.value.trim() || "";
    const kelas = kelasEl?.value.trim() || "";

    if (!nama || !nim || !kelas) {
      playClick();
      showToast("Harap isi Nama Lengkap, NIM, dan Kelas terlebih dahulu!");
      if (!nama) namaEl?.focus();
      else if (!nim) nimEl?.focus();
      else kelasEl?.focus();
      return;
    }

    gameState.player = { nama, nim, kelas };
    saveProgress();
    playClick();
    navigateTo("page-levels");
  });

  document.getElementById("btn-algo-materi")?.addEventListener("click", () => {
    playClick();
    setInfoOrigin("page-algo-menu");
    navigateTo("page-materi");
  });

  document.getElementById("btn-algo-panduan")?.addEventListener("click", () => {
    playClick();
    setInfoOrigin("page-algo-menu");
    navigateTo("page-panduan");
  });

  // Tombol Kembali Dinamis pada Materi & Panduan
  document.getElementById("btn-materi-back")?.addEventListener("click", () => {
    playClick();
    navigateTo(getInfoOrigin());
  });

  document.getElementById("btn-panduan-back")?.addEventListener("click", () => {
    playClick();
    navigateTo(getInfoOrigin());
  });

  document.getElementById("btn-materi-to-play")?.addEventListener("click", () => {
    playClick();
    navigateTo("page-levels");
  });

  document.getElementById("btn-panduan-to-play")?.addEventListener("click", () => {
    playClick();
    navigateTo("page-levels");
  });

  // Atribut data-nav generik
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      playClick();
      const dest = btn.getAttribute("data-nav");
      if (dest) navigateTo(dest);
    });
  });

  // Modal Konfirmasi Keluar Gameplay
  document.getElementById("btn-gp-exit")?.addEventListener("click", () => {
    playClick();
    pendingExitTarget = "page-levels";
    openExitModal();
  });

  document.getElementById("btn-cancel-exit")?.addEventListener("click", () => {
    playClick();
    pendingExitTarget = null;
    closeExitModal();
  });

  document.getElementById("btn-confirm-exit")?.addEventListener("click", () => {
    playClick();
    closeExitModal();
    const target = pendingExitTarget || "page-levels";
    pendingExitTarget = null;
    navigateTo(target, true);
  });
}