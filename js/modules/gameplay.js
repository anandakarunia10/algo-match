import { FLOWCHART_DATA } from "../data/flowchartData.js";
import { PSEUDOCODE_DATA } from "../data/pseudocodeData.js";
import { gameState, saveProgress, calculateStars } from "../utils/storage.js";
import { playClick, playCorrect, playWrong, playWin } from "../utils/audio.js";
import { navigateTo } from "./navigation.js";
import { renderAwardingScreen } from "./renderPages.js";

let activeItems = [];
let solvedIds = new Set();
let sessionScore = 0;
let sessionWrong = 0;
let selectedItemId = null;

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function startLevel(levelNum) {
  gameState.currentLevel = levelNum;
  gameState.isPlaying = true;
  solvedIds = new Set();
  sessionScore = 0;
  sessionWrong = 0;
  selectedItemId = null;

  activeItems = levelNum === 1 ? FLOWCHART_DATA : PSEUDOCODE_DATA;

  // Update Header UI
  document.getElementById("gp-level-badge").textContent = `LEVEL ${levelNum}`;
  document.getElementById("gp-level-title").textContent =
    levelNum === 1 ? "FLOWCHART" : "PSEUDOCODE";
  document.getElementById("gp-source-col-title").textContent =
    levelNum === 1 ? "Simbol Flowchart" : "Struktur / Perintah Pseudocode";
  document.getElementById("gp-instruction-text").textContent =
    levelNum === 1
      ? "Seret simbol Flowchart di sebelah kiri menuju kotak fungsi yang tepat di sebelah kanan (atau ketuk objek lalu ketuk target)."
      : "Seret perintah Pseudocode di sebelah kiri menuju kotak fungsi yang tepat di sebelah kanan (atau ketuk perintah lalu ketuk target).";

  const fbBox = document.getElementById("gp-feedback-box");
  fbBox?.classList.add("hidden");
  document.getElementById("gp-complete-bar")?.classList.add("hidden");

  updateGameplayStats();
  renderGameplayBoard(levelNum);
  navigateTo("page-gameplay", true);
}

function updateGameplayStats() {
  const total = activeItems.length;
  const solvedCount = solvedIds.size;
  const currentQuestion = Math.min(solvedCount + 1, total);
  const percent = Math.round((solvedCount / total) * 100);

  document.getElementById("gp-score").textContent = String(sessionScore);
  document.getElementById("gp-question-counter").textContent =
    solvedCount === total
      ? `Selesai (${total} dari ${total} Soal)`
      : `Soal ${currentQuestion} dari ${total}`;
  document.getElementById("gp-progress-percent").textContent = `Progress: ${percent}%`;
  document.getElementById("gp-progress-fill").style.width = `${percent}%`;
}

function showFeedback(isSuccess, title, message) {
  const box = document.getElementById("gp-feedback-box");
  const icon = document.getElementById("gp-feedback-icon");
  const titleEl = document.getElementById("gp-feedback-title");
  const textEl = document.getElementById("gp-feedback-text");
  if (!box || !icon || !titleEl || !textEl) return;

  box.classList.remove("hidden", "success", "error");
  box.classList.add(isSuccess ? "success" : "error");

  icon.innerHTML = isSuccess
    ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

  titleEl.textContent = title;
  textEl.textContent = message;
}

function renderGameplayBoard(levelNum) {
  const dragContainer = document.getElementById("gp-drag-items");
  const dropContainer = document.getElementById("gp-drop-zones");
  if (!dragContainer || !dropContainer) return;

  const shuffledSources = shuffleArray(activeItems);
  const shuffledTargets = shuffleArray(activeItems);

  // Render Kartu Objek yang Dapat Diseret
  dragContainer.innerHTML = shuffledSources
    .map((item) => {
      const visualHTML =
        levelNum === 1
          ? `<div class="drag-item-visual">${item.svg}</div>`
          : `<div class="drag-item-visual"><code class="badge badge-blue" style="font-family:'Fira Code',monospace;">${item.name}</code></div>`;

      const subText =
        levelNum === 1
          ? item.shape
          : item.syntax.split("\n")[0];

      return `
        <div class="drag-item" draggable="true" data-item-id="${item.id}">
          ${visualHTML}
          <div class="drag-item-info">
            <div class="drag-item-label">${item.name}</div>
            <div class="drag-item-sub font-mono">${subText}</div>
          </div>
        </div>
      `;
    })
    .join("");

  // Render Target Drop Zone
  dropContainer.innerHTML = shuffledTargets
    .map(
      (item) => `
      <div class="drop-zone" data-target-id="${item.id}">
        <span class="drop-zone-text">${item.functionDesc}</span>
        <span class="drop-zone-slot">Taruh di sini</span>
      </div>
    `
    )
    .join("");

  attachBoardInteractions();
}

function evaluateMatch(draggedId, targetElement) {
  if (!draggedId || !targetElement) return;
  const targetId = targetElement.getAttribute("data-target-id");
  if (solvedIds.has(targetId)) return;

  const itemData = activeItems.find((x) => x.id === draggedId);
  const sourceElement = document.querySelector(`.drag-item[data-item-id="${draggedId}"]`);

  // Bersihkan seleksi tap
  selectedItemId = null;
  document.querySelectorAll(".drag-item").forEach((el) => el.classList.remove("selected"));

  if (draggedId === targetId && itemData) {
    // JAWABAN BENAR (Poin hanya diberikan 1x per soal)
    solvedIds.add(targetId);
    sessionScore += 10;
    playCorrect();

    if (sourceElement) {
      sourceElement.classList.add("matched");
      sourceElement.setAttribute("draggable", "false");
    }

    targetElement.classList.add("matched-correct");
    const slot = targetElement.querySelector(".drop-zone-slot");
    if (slot) slot.textContent = `✓ ${itemData.name} (+10)`;

    updateGameplayStats();
    showFeedback(true, "BENAR! (+10 Poin)", itemData.explanation);

    if (solvedIds.size === activeItems.length) {
      handleLevelComplete();
    }
  } else {
    // JAWABAN SALAH
    sessionWrong += 1;
    playWrong();

    targetElement.classList.remove("shake-error");
    void targetElement.offsetWidth; // trigger reflow untuk ulangi animasi
    targetElement.classList.add("shake-error");
    setTimeout(() => targetElement.classList.remove("shake-error"), 400);

    const hintMsg = itemData
      ? `Pasangan belum sesuai untuk ${itemData.name}. Petunjuk: ${itemData.hint}`
      : "Pasangan belum sesuai. Silakan coba cocokan kembali!";
    showFeedback(false, "BELUM TEPAT!", hintMsg);
  }
}

function handleLevelComplete() {
  const levelNum = gameState.currentLevel;
  const stars = calculateStars(sessionScore);
  const result = {
    score: sessionScore,
    stars,
    correct: solvedIds.size,
    wrong: sessionWrong,
  };

  if (levelNum === 1) {
    gameState.level1.completed = true;
    gameState.level1.score = Math.max(gameState.level1.score, sessionScore);
    gameState.level1.stars = Math.max(gameState.level1.stars, stars);
    gameState.level1.correct = result.correct;
    gameState.level1.wrong = result.wrong;
    gameState.level2.unlocked = true;
  } else {
    gameState.level2.completed = true;
    gameState.level2.score = Math.max(gameState.level2.score, sessionScore);
    gameState.level2.stars = Math.max(gameState.level2.stars, stars);
    gameState.level2.correct = result.correct;
    gameState.level2.wrong = result.wrong;
  }

  saveProgress();
  playWin();

  const completeBar = document.getElementById("gp-complete-bar");
  completeBar?.classList.remove("hidden");

  const finishBtn = document.getElementById("btn-gp-finish-level");
  if (finishBtn) {
    finishBtn.onclick = () => {
      playClick();
      gameState.isPlaying = false;
      renderAwardingScreen(levelNum, result);
      navigateTo("page-awarding", true);
    };
  }
}

function attachBoardInteractions() {
  const dragItems = document.querySelectorAll("#gp-drag-items .drag-item");
  const dropZones = document.querySelectorAll("#gp-drop-zones .drop-zone");

  let activeTouchId = null;
  let touchGhost = null;

  dragItems.forEach((item) => {
    const id = item.getAttribute("data-item-id");

    // 1. Desktop HTML5 Drag & Drop
    item.addEventListener("dragstart", (e) => {
      if (solvedIds.has(id)) return;
      e.dataTransfer?.setData("text/plain", id);
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });

    // 2. Touch Dragging (Mobile / Tablet)
    item.addEventListener("touchstart", (e) => {
      if (solvedIds.has(id)) return;
      const touch = e.touches[0];
      activeTouchId = id;
      item.classList.add("dragging");

      touchGhost = item.cloneNode(true);
      touchGhost.style.position = "fixed";
      touchGhost.style.width = `${item.offsetWidth}px`;
      touchGhost.style.pointerEvents = "none";
      touchGhost.style.zIndex = "999";
      touchGhost.style.opacity = "0.9";
      touchGhost.style.left = `${touch.clientX - item.offsetWidth / 2}px`;
      touchGhost.style.top = `${touch.clientY - 30}px`;
      document.body.appendChild(touchGhost);
    }, { passive: true });

    item.addEventListener("touchmove", (e) => {
      if (!activeTouchId || !touchGhost) return;
      e.preventDefault();
      const touch = e.touches[0];
      touchGhost.style.left = `${touch.clientX - touchGhost.offsetWidth / 2}px`;
      touchGhost.style.top = `${touch.clientY - 30}px`;

      dropZones.forEach((z) => z.classList.remove("drag-over"));
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const zone = elemBelow?.closest(".drop-zone");
      if (zone && !zone.classList.contains("matched-correct")) {
        zone.classList.add("drag-over");
      }
    }, { passive: false });

    item.addEventListener("touchend", (e) => {
      if (!activeTouchId) return;
      item.classList.remove("dragging");
      if (touchGhost) {
        touchGhost.remove();
        touchGhost = null;
      }
      dropZones.forEach((z) => z.classList.remove("drag-over"));

      const touch = e.changedTouches[0];
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const zone = elemBelow?.closest(".drop-zone");
      if (zone) {
        evaluateMatch(activeTouchId, zone);
      }
      activeTouchId = null;
    });

    // 3. Tap-to-Match (Klik/Sentuh untuk memilih)
    item.addEventListener("click", () => {
      if (solvedIds.has(id)) return;
      playClick();
      if (selectedItemId === id) {
        selectedItemId = null;
        item.classList.remove("selected");
      } else {
        selectedItemId = id;
        dragItems.forEach((el) => el.classList.remove("selected"));
        item.classList.add("selected");
      }
    });
  });

  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!zone.classList.contains("matched-correct")) {
        zone.classList.add("drag-over");
      }
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");
      const draggedId = e.dataTransfer?.getData("text/plain");
      if (draggedId) {
        evaluateMatch(draggedId, zone);
      }
    });

    // Tap-to-Match pada target
    zone.addEventListener("click", () => {
      if (selectedItemId && !zone.classList.contains("matched-correct")) {
        evaluateMatch(selectedItemId, zone);
      }
    });
  });
}