import { FLOWCHART_INTRO, FLOWCHART_DATA } from "../data/flowchartData.js";
import { PSEUDOCODE_INTRO, PSEUDOCODE_DATA } from "../data/pseudocodeData.js";
import { gameState, resetAllProgress } from "../utils/storage.js";
import { playClick, playCorrect, playWrong } from "../utils/audio.js";
import { navigateTo } from "./navigation.js";
import { startLevel } from "./gameplay.js";

function renderStarsHTML(earnedCount, total = 3) {
  let html = `<div class="stars-row" aria-label="${earnedCount} dari ${total} bintang">`;
  for (let i = 1; i <= total; i++) {
    const cls = i <= earnedCount ? "earned" : "empty";
    html += `
      <svg class="star-svg ${cls}" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `;
  }
  html += `</div>`;
  return html;
}

export function spawnConfetti() {
  const container = document.getElementById("confetti-container");
  if (!container) return;
  container.innerHTML = "";

  const colors = ["#2563EB", "#FACC15", "#60A5FA", "#FDE047", "#1D4ED8"];
  for (let i = 0; i < 42; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    container.appendChild(piece);
  }

  setTimeout(() => {
    container.innerHTML = "";
  }, 3800);
}

/* =========================================================
   1. RENDER HALAMAN MATERI (FLOWCHART & PSEUDOCODE)
   ========================================================= */
export function renderMateri(activeTab = "flowchart") {
  const container = document.getElementById("materi-content-area");
  if (!container) return;

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-materi-tab") === activeTab);
  });

  if (activeTab === "flowchart") {
    const cardsHTML = FLOWCHART_DATA.map(
      (item) => `
      <article class="card materi-item-card">
        <div class="materi-visual-area">${item.svg}</div>
        <div>
          <span class="badge badge-blue">${item.shape}</span>
          <h3 class="card-title">${item.name}</h3>
          <p class="card-desc" style="margin-bottom: 0;">${item.functionDesc}</p>
        </div>
      </article>
    `
    ).join("");

    container.innerHTML = `
      <div class="materi-intro-card">
        <h2 class="card-title" style="margin-top:0;">${FLOWCHART_INTRO.title}</h2>
        <p style="margin-bottom:8px;"><strong>Pengertian:</strong> ${FLOWCHART_INTRO.definition}</p>
        <p><strong>Fungsi Utama:</strong> ${FLOWCHART_INTRO.purpose}</p>
      </div>
      <div class="grid-3">${cardsHTML}</div>
    `;
  } else {
    const cardsHTML = PSEUDOCODE_DATA.map(
      (item) => `
      <article class="card materi-item-card">
        <div class="materi-visual-area">
          <pre class="code-snippet-box">${item.syntax}</pre>
        </div>
        <div>
          <span class="badge badge-yellow">Perintah Dasar</span>
          <h3 class="card-title">${item.name}</h3>
          <p class="card-desc" style="margin-bottom: 0;">${item.functionDesc}</p>
        </div>
      </article>
    `
    ).join("");

    container.innerHTML = `
      <div class="materi-intro-card">
        <h2 class="card-title" style="margin-top:0;">${PSEUDOCODE_INTRO.title}</h2>
        <p style="margin-bottom:8px;"><strong>Pengertian:</strong> ${PSEUDOCODE_INTRO.definition}</p>
        <p><strong>Fungsi Utama:</strong> ${PSEUDOCODE_INTRO.purpose}</p>
        <div class="materi-note">${PSEUDOCODE_INTRO.note}</div>
      </div>
      <div class="grid-3">${cardsHTML}</div>
    `;
  }
}

export function initMateriTabs() {
  renderMateri("flowchart");
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      playClick();
      const tab = btn.getAttribute("data-materi-tab");
      if (tab) renderMateri(tab);
    });
  });
}

/* =========================================================
   2. RENDER HALAMAN PANDUAN + SANDBOX MINI DRAG & DROP
   ========================================================= */
export function renderPanduan() {
  const container = document.getElementById("panduan-content-area");
  if (!container) return;

  container.innerHTML = `
    <div class="grid-2" style="margin-bottom: 24px;">
      <div class="card">
        <span class="badge badge-blue">Langkah 1 • Tujuan &amp; Mekanisme</span>
        <h3 class="card-title">Cara Bermain Drag &amp; Drop</h3>
        <ul style="padding-left: 18px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
          <li><strong>Tujuan Permainan:</strong> Menguji pemahaman simbol Flowchart dan perintah Pseudocode secara tepat.</li>
          <li><strong>Tarik &amp; Letakkan (Drag &amp; Drop):</strong> Klik tahan (atau sentuh) kartu simbol/kode di kolom kiri, lalu seret ke kotak definisi yang sesuai di kolom kanan.</li>
          <li><strong>Alternatif Tap-to-Match:</strong> Pada layar sentuh, Anda juga bisa mengetuk kartu objek lalu mengetuk kotak tujuan.</li>
          <li><strong>Validasi Instan:</strong> Jawaban benar mendapat notifikasi hijau dan penjelasan singkat. Jawaban salah dapat langsung dicoba kembali.</li>
        </ul>
      </div>

      <div class="card">
        <span class="badge badge-yellow">Langkah 2 • Penilaian &amp; Level</span>
        <h3 class="card-title">Sistem Poin, Bintang &amp; Pembukaan Level</h3>
        <ul style="padding-left: 18px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
          <li><strong>Perolehan Poin:</strong> Setiap jawaban benar bernilai <strong>+10 poin</strong> (maksimal 60 poin per level, total 120 poin). Jawaban salah tidak mengurangi poin.</li>
          <li><strong>Ketentuan Bintang:</strong> Skor <strong>50–60</strong> = 3 Bintang, <strong>40–49</strong> = 2 Bintang, <strong>0–39</strong> = 1 Bintang.</li>
          <li><strong>Aturan Level:</strong> Selesaikan seluruh 6 soal pada <strong>Level 1 (Flowchart)</strong> untuk membuka gembok <strong>Level 2 (Pseudocode)</strong>.</li>
        </ul>
      </div>
    </div>

    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div>
          <span class="badge badge-yellow">Simulasi Interaktif</span>
          <h3 class="card-title">Coba Contoh Drag &amp; Drop di Sini</h3>
          <p style="font-size:0.9rem; color:var(--text-secondary);">Seret simbol <strong>TERMINATOR</strong> ke kotak definisi di sebelahnya untuk mencoba mekanisme permainan.</p>
        </div>
        <button type="button" id="btn-reset-sandbox" class="btn btn-secondary btn-sm">Ulangi Contoh</button>
      </div>

      <div class="sandbox-demo-grid">
        <div id="sandbox-source" class="drag-item" draggable="true">
          <div class="drag-item-visual">
            <svg width="68" height="34" viewBox="0 0 78 40" fill="none">
              <rect x="4" y="5" width="70" height="30" rx="15" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.4"/>
            </svg>
          </div>
          <div class="drag-item-info">
            <div class="drag-item-label">TERMINATOR</div>
            <div class="drag-item-sub">Seret objek ini</div>
          </div>
        </div>

        <div id="sandbox-target" class="drop-zone">
          <span class="drop-zone-text">Menunjukkan awal dan akhir suatu algoritma.</span>
          <span id="sandbox-slot" class="drop-zone-slot">Letakkan di sini</span>
        </div>
      </div>
    </div>
  `;

  setupPanduanSandbox();
}

function setupPanduanSandbox() {
  const src = document.getElementById("sandbox-source");
  const tgt = document.getElementById("sandbox-target");
  const slot = document.getElementById("sandbox-slot");
  const resetBtn = document.getElementById("btn-reset-sandbox");
  if (!src || !tgt || !slot) return;

  let selected = false;

  const completeDemo = () => {
    if (tgt.classList.contains("matched-correct")) return;
    playCorrect();
    src.classList.add("matched");
    src.classList.remove("selected");
    tgt.classList.add("matched-correct");
    slot.textContent = "Cocok! (+10 Poin)";
  };

  src.addEventListener("dragstart", (e) => {
    e.dataTransfer?.setData("text/plain", "demo");
    src.classList.add("dragging");
  });

  src.addEventListener("dragend", () => {
    src.classList.remove("dragging");
  });

  tgt.addEventListener("dragover", (e) => {
    e.preventDefault();
    tgt.classList.add("drag-over");
  });

  tgt.addEventListener("dragleave", () => {
    tgt.classList.remove("drag-over");
  });

  tgt.addEventListener("drop", (e) => {
    e.preventDefault();
    tgt.classList.remove("drag-over");
    completeDemo();
  });

  src.addEventListener("click", () => {
    if (src.classList.contains("matched")) return;
    playClick();
    selected = !selected;
    src.classList.toggle("selected", selected);
  });

  tgt.addEventListener("click", () => {
    if (selected) completeDemo();
  });

  resetBtn?.addEventListener("click", () => {
    playClick();
    selected = false;
    src.classList.remove("matched", "selected");
    tgt.classList.remove("matched-correct", "drag-over");
    slot.textContent = "Letakkan di sini";
  });
}

/* =========================================================
   3. RENDER HALAMAN PEMILIHAN LEVEL
   ========================================================= */
export function renderLevelCards() {
  const container = document.getElementById("level-cards-container");
  const finalBtn = document.getElementById("btn-view-final-from-levels");
  if (!container) return;

  const l1 = gameState.level1;
  const l2 = gameState.level2;

  if (finalBtn) {
    finalBtn.classList.toggle("hidden", !(l1.completed && l2.completed));
  }

  const l1StatusBadge = l1.completed
    ? `<span class="badge badge-green">✓ Selesai</span>`
    : `<span class="badge badge-blue">Sedang Tersedia</span>`;

  const l2StatusBadge = !l2.unlocked
    ? `<span class="badge badge-locked">🔒 Terkunci</span>`
    : l2.completed
    ? `<span class="badge badge-green">✓ Selesai</span>`
    : `<span class="badge badge-blue">Sedang Tersedia</span>`;

  container.innerHTML = `
    <!-- LEVEL 1 -->
    <article class="card level-card">
      <div>
        <div class="level-card-header">
          <span class="badge badge-blue">LEVEL 1</span>
          ${l1StatusBadge}
        </div>
        <h2 class="card-title" style="font-size:1.35rem;">LEVEL 1 – FLOWCHART</h2>
        <p class="card-desc">Kenali simbol dan fungsi Flowchart melalui 6 tantangan pencocokan visual standar diagram alir.</p>
        ${renderStarsHTML(l1.stars)}
        <p style="font-size:0.88rem; color:var(--text-secondary);">
          Skor Tertinggi: <strong style="color:var(--dark-navy);">${l1.score} / 60 Poin</strong>
        </p>
      </div>
      <div style="margin-top:20px;">
        <button type="button" id="btn-play-level-1" class="btn btn-primary btn-full">
          ${l1.completed ? "Mainkan Ulang Level 1" : "Mulai Level 1"}
        </button>
      </div>
    </article>

    <!-- LEVEL 2 -->
    <article class="card level-card ${!l2.unlocked ? "locked" : ""}">
      <div>
        <div class="level-card-header">
          <span class="badge ${l2.unlocked ? "badge-blue" : "badge-locked"}">LEVEL 2</span>
          ${l2StatusBadge}
        </div>
        <h2 class="card-title" style="font-size:1.35rem;">LEVEL 2 – PSEUDOCODE</h2>
        <p class="card-desc">Kenali struktur dan fungsi Pseudocode beserta sintaks dasar algoritma.</p>
        ${renderStarsHTML(l2.stars)}
        <p style="font-size:0.88rem; color:var(--text-secondary);">
          ${
            l2.unlocked
              ? `Skor Tertinggi: <strong style="color:var(--dark-navy);">${l2.score} / 60 Poin</strong>`
              : "Selesaikan Level 1 untuk membuka level ini."
          }
        </p>
      </div>
      <div style="margin-top:20px;">
        <button type="button" id="btn-play-level-2" class="btn ${l2.unlocked ? "btn-primary" : "btn-disabled"} btn-full" ${!l2.unlocked ? "disabled" : ""}>
          ${!l2.unlocked ? "🔒 Terkunci" : l2.completed ? "Mainkan Ulang Level 2" : "Mulai Level 2"}
        </button>
      </div>
    </article>
  `;

  document.getElementById("btn-play-level-1")?.addEventListener("click", () => {
    playClick();
    startLevel(1);
  });

  document.getElementById("btn-play-level-2")?.addEventListener("click", () => {
    if (!gameState.level2.unlocked) return;
    playClick();
    startLevel(2);
  });

  finalBtn?.addEventListener("click", () => {
    playClick();
    renderFinalResult();
    navigateTo("page-final");
  });
}

/* =========================================================
   4. RENDER AWARDING SCREEN PER LEVEL
   ========================================================= */
export function renderAwardingScreen(levelNum, sessionResult) {
  const container = document.getElementById("awarding-content-area");
  if (!container) return;

  const isLevel1 = levelNum === 1;
  const levelName = isLevel1 ? "LEVEL 1 – FLOWCHART" : "LEVEL 2 – PSEUDOCODE";
  const unlockInfo = isLevel1
    ? `<div class="materi-note" style="text-align:center;">🎉 <strong>Level 2 (Pseudocode) telah terbuka!</strong> Anda siap melanjutkan ke tantangan berikutnya.</div>`
    : `<div class="materi-note" style="text-align:center;">🏆 <strong>Selamat! Seluruh materi permainan telah berhasil diselesaikan!</strong></div>`;

  const nextButtonHTML = isLevel1
    ? `<button type="button" id="btn-award-next" class="btn btn-primary btn-full">LANJUT KE LEVEL BERIKUTNYA</button>`
    : `<button type="button" id="btn-award-final" class="btn btn-primary btn-full">LIHAT REKAP HASIL AKHIR</button>`;

  container.innerHTML = `
    <div class="trophy-wrapper">
      <svg width="42" height="42" viewBox="0 0 24 24" fill="#FACC15" stroke="#172554" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
      </svg>
    </div>

    <div><span class="badge badge-yellow">${levelName} SELESAI</span></div>
    <h1 class="page-title">Selamat! Level Berhasil Diselesaikan</h1>
    <p class="page-subtitle">Anda telah mencocokkan seluruh konsep dengan tepat.</p>

    ${renderStarsHTML(sessionResult.stars)}

    <div class="awarding-score-box">
      <div style="font-size:0.82rem; font-weight:700; color:#854D0E;">TOTAL POIN LEVEL</div>
      <div class="awarding-score-value">${sessionResult.score} <span style="font-size:1rem; font-weight:600;">/ 60</span></div>
    </div>

    <div class="stats-mini-grid">
      <div class="stat-mini-card">
        <div style="font-size:0.8rem; color:var(--text-secondary);">Jawaban Benar</div>
        <div style="font-size:1.3rem; font-weight:800; color:var(--success-green);">${sessionResult.correct}</div>
      </div>
      <div class="stat-mini-card">
        <div style="font-size:0.8rem; color:var(--text-secondary);">Percobaan Salah</div>
        <div style="font-size:1.3rem; font-weight:800; color:var(--error-red);">${sessionResult.wrong}</div>
      </div>
    </div>

    ${unlockInfo}

    <div class="awarding-actions">
      ${nextButtonHTML}
      <button type="button" id="btn-award-retry" class="btn btn-secondary btn-full">ULANGI LEVEL</button>
      <button type="button" id="btn-award-menu" class="btn btn-secondary btn-full">KEMBALI KE MENU</button>
    </div>
  `;

  spawnConfetti();

  document.getElementById("btn-award-next")?.addEventListener("click", () => {
    playClick();
    startLevel(2);
  });

  document.getElementById("btn-award-final")?.addEventListener("click", () => {
    playClick();
    renderFinalResult();
    navigateTo("page-final");
  });

  document.getElementById("btn-award-retry")?.addEventListener("click", () => {
    playClick();
    startLevel(levelNum);
  });

  document.getElementById("btn-award-menu")?.addEventListener("click", () => {
    playClick();
    navigateTo("page-algo-menu");
  });
}

/* =========================================================
   5. RENDER FINAL RESULT SCREEN
   ========================================================= */
export function renderFinalResult() {
  const container = document.getElementById("final-content-area");
  if (!container) return;

  const l1 = gameState.level1;
  const l2 = gameState.level2;
  const totalScore = l1.score + l2.score;
  const totalStars = l1.stars + l2.stars;
  const totalCorrect = l1.correct + l2.correct;
  const totalWrong = l1.wrong + l2.wrong;

  const appreciation =
    totalScore >= 100
      ? "Luar biasa! Pemahaman Anda terhadap simbol Flowchart dan struktur dasar Pseudocode sangat matang."
      : totalScore >= 80
      ? "Bagus sekali! Anda telah menguasai sebagian besar konsep dasar algoritma dengan baik."
      : "Kerja bagus! Terus berlatih agar semakin terbiasa mengenali setiap simbol dan perintah algoritma.";

  container.innerHTML = `
    <div class="text-center">
      <span class="badge badge-yellow">ALGO MATCH • REKAP HASIL AKHIR</span>
      <h1 class="page-title">Pencapaian Belajar Anda</h1>
      <p class="page-subtitle">${appreciation}</p>
    </div>

    <div class="final-summary-banner">
      <div style="font-size:0.88rem; font-weight:700; color:var(--primary-blue);">TOTAL SKOR KESELURUHAN</div>
      <div style="font-size:2.8rem; font-weight:800; color:var(--dark-navy); line-height:1.2; margin:6px 0;">
        ${totalScore} <span style="font-size:1.2rem; color:var(--text-secondary);">/ 120 Poin</span>
      </div>
      <div>${renderStarsHTML(totalStars, 6)}</div>
      <div style="font-size:0.9rem; font-weight:600; color:var(--dark-navy); margin-top:4px;">
        Total Bintang Diperoleh: ${totalStars} dari 6 Bintang
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:20px;">
      <div class="card">
        <div class="level-card-header">
          <span class="badge badge-blue">LEVEL 1 – FLOWCHART</span>
          <span class="badge badge-green">✓ Selesai</span>
        </div>
        <div style="font-size:1.5rem; font-weight:800; margin:6px 0;">${l1.score} / 60 Poin</div>
        ${renderStarsHTML(l1.stars)}
        <p style="font-size:0.85rem; color:var(--text-secondary);">Benar: ${l1.correct} | Salah: ${l1.wrong}</p>
      </div>

      <div class="card">
        <div class="level-card-header">
          <span class="badge badge-blue">LEVEL 2 – PSEUDOCODE</span>
          <span class="badge badge-green">✓ Selesai</span>
        </div>
        <div style="font-size:1.5rem; font-weight:800; margin:6px 0;">${l2.score} / 60 Poin</div>
        ${renderStarsHTML(l2.stars)}
        <p style="font-size:0.85rem; color:var(--text-secondary);">Benar: ${l2.correct} | Salah: ${l2.wrong}</p>
      </div>
    </div>

    <div class="stats-mini-grid" style="max-width:460px;">
      <div class="stat-mini-card text-center">
        <div style="font-size:0.82rem; color:var(--text-secondary);">Total Jawaban Benar</div>
        <div style="font-size:1.4rem; font-weight:800; color:var(--success-green);">${totalCorrect} / 12</div>
      </div>
      <div class="stat-mini-card text-center">
        <div style="font-size:0.82rem; color:var(--text-secondary);">Total Percobaan Salah</div>
        <div style="font-size:1.4rem; font-weight:800; color:var(--error-red);">${totalWrong}</div>
      </div>
    </div>

    <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:26px;">
      <button type="button" id="btn-final-replay" class="btn btn-primary btn-lg">MAIN LAGI</button>
      <button type="button" id="btn-final-menu" class="btn btn-secondary btn-lg">KEMBALI KE MENU</button>
    </div>
  `;

  spawnConfetti();

  document.getElementById("btn-final-replay")?.addEventListener("click", () => {
    playClick();
    resetAllProgress();
    startLevel(1);
  });

  document.getElementById("btn-final-menu")?.addEventListener("click", () => {
    playClick();
    navigateTo("page-algo-menu");
  });
}