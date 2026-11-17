import { LMS_CONFIG } from "./lms-config.js";
import { clearSession, getSession } from "./lms-session.js";
import {
  apiGetDashboardData,
  apiSubmitTugas,
  apiGetDosenData,
  apiAddMateri,
  apiUpdateMateri,
  apiDeleteMateri,
  apiGradeTugas,
} from "./lms-api.js";

let cachedDosenMateri = [];

function renderTujuanPembelajaran() {
  const { title, description, cpmk } = LMS_CONFIG.COURSE_INFO;
  document.getElementById("course-title").textContent = title;
  document.getElementById("course-desc").textContent = description;

  const container = document.getElementById("cpmk-list");
  if (!container) return;
  container.innerHTML = cpmk
    .map(
      (item) => `
      <div class="cpmk-item">
        <span class="cpmk-code">${item.code}</span>
        <p class="cpmk-text">${item.text}</p>
      </div>
    `
    )
    .join("");
}

function renderGameStats(stats) {
  document.getElementById("stat-lvl1").textContent = `${stats.scoreLevel1} / 60`;
  document.getElementById("stat-lvl2").textContent = `${stats.scoreLevel2} / 60`;
  document.getElementById("stat-total").textContent = `${stats.totalScore} Poin (${stats.totalStars} ★)`;
  document.getElementById("stat-status").textContent = stats.status;
}

function renderMateriList(materiList) {
  const grid = document.getElementById("lms-materi-grid");
  if (!grid) return;

  if (!materiList || materiList.length === 0) {
    grid.innerHTML = `<div class="empty-state-box">Belum ada materi yang diunggah pada tab 'Materi' di Spreadsheet.</div>`;
    return;
  }

  grid.innerHTML = materiList
    .map(
      (m) => `
      <article class="card">
        <div class="materi-card-top">
          <span class="badge badge-blue">${m.pertemuan}</span>
          <span class="badge badge-yellow">${m.tipe}</span>
        </div>
        <h3 class="card-title">${m.judul}</h3>
        <p class="card-desc">${m.deskripsi}</p>
        <div class="card-footer">
          <a href="${m.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-full">
            Buka Materi
          </a>
        </div>
      </article>
    `
    )
    .join("");
}

function renderTugasHistory(tugasList) {
  const container = document.getElementById("lms-tugas-history");
  if (!container) return;

  if (!tugasList || tugasList.length === 0) {
    container.innerHTML = `<div class="empty-state-box">Belum ada riwayat pengumpulan tugas untuk NIM Anda.</div>`;
    return;
  }

  container.innerHTML = tugasList
    .map((t) => {
      const isGraded = t.nilai !== "Belum Dinilai";
      return `
        <div class="tugas-history-item">
          <div class="tugas-item-head">
            <span class="tugas-item-title">${t.judulTugas}</span>
            <span class="badge ${isGraded ? "badge-green" : "badge-yellow"}">
              ${isGraded ? `Nilai: ${t.nilai}` : t.status}
            </span>
          </div>
          <div class="tugas-item-meta">Dikirim: ${t.timestamp} • Catatan: ${t.catatan}</div>
          <div class="tugas-item-footer">
            <a href="${t.linkJawaban}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              Lihat Tautan Jawaban
            </a>
          </div>
        </div>
      `;
    })
    .join("");
}

function resetMateriForm() {
  const form = document.getElementById("form-add-materi");
  form?.reset();
  document.getElementById("materi-edit-row").value = "";
  document.getElementById("materi-form-badge").textContent = "Tambah Konten";
  document.getElementById("materi-form-heading").textContent = "Publikasikan Materi Baru";
  document.getElementById("btn-add-materi").textContent = "Publikasikan Materi";
  document.getElementById("btn-cancel-edit-materi")?.classList.add("hidden");
}

function startEditMateri(materi) {
  document.getElementById("materi-edit-row").value = materi.rowNumber;
  document.getElementById("materi-pertemuan").value = materi.pertemuan;
  document.getElementById("materi-judul").value = materi.judul;
  document.getElementById("materi-tipe").value = materi.tipe;
  document.getElementById("materi-link").value = materi.link;
  document.getElementById("materi-deskripsi").value = materi.deskripsi;

  document.getElementById("materi-form-badge").textContent = `Edit Konten (${materi.id})`;
  document.getElementById("materi-form-heading").textContent = "Perbarui Modul Materi";
  document.getElementById("btn-add-materi").textContent = "Simpan Perubahan";
  document.getElementById("btn-cancel-edit-materi")?.classList.remove("hidden");

  document.getElementById("form-add-materi")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderDosenMateriList(materiList, notify) {
  cachedDosenMateri = materiList || [];
  const container = document.getElementById("dosen-materi-list");
  if (!container) return;

  if (cachedDosenMateri.length === 0) {
    container.innerHTML = `<div class="empty-state-box">Belum ada materi yang dirilis. Tambahkan melalui form di samping.</div>`;
    return;
  }

  container.innerHTML = cachedDosenMateri
    .map(
      (m) => `
      <div class="tugas-history-item">
        <div class="tugas-item-head">
          <span class="tugas-item-title">${m.pertemuan} — ${m.judul}</span>
          <span class="badge badge-yellow">${m.tipe}</span>
        </div>
        <div class="tugas-item-meta">${m.deskripsi}</div>
        <div class="tugas-item-footer">
          <a href="${m.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Buka Tautan
          </a>
          <div class="dosen-materi-actions">
            <button type="button" class="btn btn-secondary btn-sm btn-edit-materi" data-row="${m.rowNumber}">
              Edit
            </button>
            <button type="button" class="btn btn-danger-outline btn-sm btn-delete-materi" data-row="${m.rowNumber}">
              Hapus
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  container.querySelectorAll(".btn-edit-materi").forEach((btn) => {
    btn.addEventListener("click", () => {
      const rowNum = Number(btn.getAttribute("data-row"));
      const target = cachedDosenMateri.find((item) => item.rowNumber === rowNum);
      if (target) startEditMateri(target);
    });
  });

  container.querySelectorAll(".btn-delete-materi").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const rowNum = Number(btn.getAttribute("data-row"));
      const target = cachedDosenMateri.find((item) => item.rowNumber === rowNum);
      const label = target ? `"${target.judul}"` : "materi ini";

      if (!window.confirm(`Yakin ingin menghapus ${label} secara permanen?`)) return;

      btn.disabled = true;
      btn.textContent = "Menghapus...";

      try {
        const res = await apiDeleteMateri(rowNum);
        if (res.status === "success") {
          if (Number(document.getElementById("materi-edit-row")?.value) === rowNum) {
            resetMateriForm();
          }
          if (notify) notify(`✓ ${res.message}`);
          await loadDosenContent(notify);
        } else if (notify) {
          notify(`✕ ${res.message || "Gagal menghapus materi."}`);
        }
      } catch (err) {
        if (notify) notify(`✕ ${err.message || "Gagal terhubung ke server."}`);
      } finally {
        btn.disabled = false;
        btn.textContent = "Hapus";
      }
    });
  });
}

function renderDosenTugasList(tugasList, notify) {
  const container = document.getElementById("dosen-tugas-list");
  if (!container) return;

  if (!tugasList || tugasList.length === 0) {
    container.innerHTML = `<div class="empty-state-box">Belum ada mahasiswa yang mengumpulkan tugas.</div>`;
    return;
  }

  container.innerHTML = tugasList
    .map(
      (t) => `
      <div class="dosen-tugas-card">
        <div class="dosen-tugas-info">
          <div class="tugas-item-head">
            <span class="tugas-item-title">${t.nama} (${t.nim} • ${t.kelas})</span>
            <span class="badge ${t.status === "Dinilai" ? "badge-green" : "badge-yellow"}">${t.status}</span>
          </div>
          <div class="tugas-item-meta"><strong>${t.judulTugas}</strong> • ${t.timestamp}</div>
          <div class="tugas-item-meta">Catatan: ${t.catatan}</div>
          <a href="${t.linkJawaban}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Buka Jawaban Mahasiswa
          </a>
        </div>
        <div class="dosen-grade-box">
          <input type="number" min="0" max="100" class="grade-input" id="grade-input-${t.rowNumber}" value="${t.nilai}" placeholder="0-100" />
          <button type="button" class="btn btn-primary btn-sm btn-save-grade" data-row="${t.rowNumber}">
            Simpan Nilai
          </button>
        </div>
      </div>
    `
    )
    .join("");

  container.querySelectorAll(".btn-save-grade").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const rowNumber = btn.getAttribute("data-row");
      const inputEl = document.getElementById(`grade-input-${rowNumber}`);
      const nilai = inputEl?.value.trim();

      if (nilai === "" || Number(nilai) < 0 || Number(nilai) > 100) {
        if (notify) notify("✕ Masukkan angka nilai antara 0 sampai 100.");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Menyimpan...";

      try {
        const res = await apiGradeTugas({ rowNumber, nilai });
        if (res.status === "success") {
          if (notify) notify(`✓ ${res.message}`);
          await loadDosenContent(notify);
        } else if (notify) {
          notify(`✕ ${res.message || "Gagal menyimpan nilai."}`);
        }
      } catch (err) {
        if (notify) notify(`✕ ${err.message || "Gagal terhubung ke server."}`);
      } finally {
        btn.disabled = false;
        btn.textContent = "Simpan Nilai";
      }
    });
  });
}

function renderDosenGameTable(scoreList) {
  const tbody = document.getElementById("dosen-game-tbody");
  if (!tbody) return;

  if (!scoreList || scoreList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Belum ada data skor game.</td></tr>`;
    return;
  }

  tbody.innerHTML = scoreList
    .map(
      (s) => `
      <tr>
        <td>${s.timestamp}</td>
        <td>${s.nim}</td>
        <td><strong>${s.nama}</strong></td>
        <td>${s.kelas}</td>
        <td>${s.scoreLevel1}</td>
        <td>${s.scoreLevel2}</td>
        <td><strong>${s.totalScore}</strong> (${s.totalStars} ★)</td>
        <td><span class="badge badge-blue">${s.status}</span></td>
      </tr>
    `
    )
    .join("");
}

function switchTabGroup(btnSelector, panelSelector, dataAttr, targetId) {
  document.querySelectorAll(btnSelector).forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute(dataAttr) === targetId);
  });

  document.querySelectorAll(panelSelector).forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `panel-${targetId}`);
  });
}

export async function loadDosenContent(notify) {
  const listEl = document.getElementById("dosen-tugas-list");
  const materiEl = document.getElementById("dosen-materi-list");
  if (listEl) listEl.innerHTML = `<div class="empty-state-box">Memuat data mahasiswa dari Spreadsheet...</div>`;
  if (materiEl) materiEl.innerHTML = `<div class="empty-state-box">Memuat daftar materi rilis...</div>`;

  try {
    const res = await apiGetDosenData();
    if (res.status === "success") {
      renderDosenMateriList(res.materiList, notify);
      renderDosenTugasList(res.tugasList, notify);
      renderDosenGameTable(res.scoreList);
    } else if (notify) {
      notify(`✕ ${res.message || "Gagal memuat data dosen."}`);
    }
  } catch (err) {
    if (notify) notify(`✕ ${err.message || "Gagal sinkron data Spreadsheet."}`);
  }
}

export async function loadDashboardContent(user, notify) {
  if (user.role === "dosen") {
    await loadDosenContent(notify);
    return;
  }

  renderTujuanPembelajaran();

  const materiGrid = document.getElementById("lms-materi-grid");
  const tugasHistory = document.getElementById("lms-tugas-history");
  if (materiGrid) materiGrid.innerHTML = `<div class="empty-state-box">Memuat materi dari Spreadsheet...</div>`;
  if (tugasHistory) tugasHistory.innerHTML = `<div class="empty-state-box">Memuat riwayat tugas...</div>`;

  try {
    const res = await apiGetDashboardData(user.nim);
    if (res.status === "success") {
      renderGameStats(res.gameStats);
      renderMateriList(res.materi);
      renderTugasHistory(res.tugas);
    } else if (notify) {
      notify(`✕ ${res.message || "Gagal memuat data LMS."}`);
    }
  } catch (err) {
    if (notify) notify(`✕ ${err.message || "Gagal sinkron data Spreadsheet."}`);
  }
}

export function showDashboardView(user, notify) {
  document.getElementById("lms-auth-section")?.classList.add("hidden");
  document.getElementById("lms-dashboard-section")?.classList.remove("hidden");

  const isDosen = user.role === "dosen";
  document.getElementById("dash-welcome-name").textContent = `Halo, ${user.nama}!`;
  document.getElementById("dash-user-meta").textContent = isDosen
    ? `ID Pengajar: ${user.nim}  •  Panel Kontrol Dosen`
    : `NIM: ${user.nim}  •  Kelas: ${user.kelas}`;
  document.getElementById("dash-role-badge").textContent = isDosen ? "Dosen / Pengajar" : "Mahasiswa";

  document.getElementById("lms-mahasiswa-view")?.classList.toggle("hidden", isDosen);
  document.getElementById("lms-dosen-view")?.classList.toggle("hidden", !isDosen);

  loadDashboardContent(user, notify);
}

export function initDashboardUI({ onLogout, notify }) {
  document.querySelectorAll(".horton-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTabGroup(".horton-tab-btn", ".horton-panel", "data-horton-tab", btn.getAttribute("data-horton-tab"));
    });
  });

  document.querySelectorAll(".dosen-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTabGroup(".dosen-tab-btn", ".dosen-panel", "data-dosen-tab", btn.getAttribute("data-dosen-tab"));
    });
  });

  document.getElementById("btn-refresh-lms")?.addEventListener("click", () => {
    const activeUser = getSession();
    if (!activeUser) return;
    notify("Menyinkronkan data terbaru...");
    loadDashboardContent(activeUser, notify);
  });

  document.getElementById("form-submit-tugas")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const activeUser = getSession();
    if (!activeUser) return;

    const judulTugas = document.getElementById("tugas-judul").value;
    const linkJawaban = document.getElementById("tugas-link").value.trim();
    const catatan = document.getElementById("tugas-catatan").value.trim();
    const btn = document.getElementById("btn-submit-tugas");

    btn.disabled = true;
    btn.textContent = "Mengirim Tugas...";

    try {
      const res = await apiSubmitTugas({
        nim: activeUser.nim,
        nama: activeUser.nama,
        kelas: activeUser.kelas,
        judulTugas,
        linkJawaban,
        catatan,
      });

      if (res.status === "success") {
        e.target.reset();
        notify(`✓ ${res.message}`);
        await loadDashboardContent(activeUser, notify);
      } else {
        notify(`✕ ${res.message || "Gagal mengirim tugas."}`);
      }
    } catch (err) {
      notify(`✕ ${err.message || "Gagal terhubung ke server."}`);
    } finally {
      btn.disabled = false;
      btn.textContent = "Kirim Jawaban Tugas";
    }
  });

  document.getElementById("btn-cancel-edit-materi")?.addEventListener("click", () => {
    resetMateriForm();
  });

  document.getElementById("form-add-materi")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const editRow = document.getElementById("materi-edit-row").value.trim();
    const pertemuan = document.getElementById("materi-pertemuan").value.trim();
    const judul = document.getElementById("materi-judul").value.trim();
    const tipe = document.getElementById("materi-tipe").value;
    const link = document.getElementById("materi-link").value.trim();
    const deskripsi = document.getElementById("materi-deskripsi").value.trim();
    const btn = document.getElementById("btn-add-materi");

    const isEditing = editRow !== "";
    btn.disabled = true;
    btn.textContent = isEditing ? "Menyimpan Perubahan..." : "Mempublikasikan...";

    try {
      const res = isEditing
        ? await apiUpdateMateri({ rowNumber: Number(editRow), pertemuan, judul, deskripsi, tipe, link })
        : await apiAddMateri({ pertemuan, judul, deskripsi, tipe, link });

      if (res.status === "success") {
        resetMateriForm();
        notify(`✓ ${res.message}`);
        await loadDosenContent(notify);
      } else {
        notify(`✕ ${res.message || "Gagal menyimpan materi."}`);
      }
    } catch (err) {
      notify(`✕ ${err.message || "Gagal terhubung ke server."}`);
    } finally {
      btn.disabled = false;
      btn.textContent = document.getElementById("materi-edit-row").value
        ? "Simpan Perubahan"
        : "Publikasikan Materi";
    }
  });

  document.getElementById("btn-lms-logout")?.addEventListener("click", () => {
    clearSession();
    notify("Anda telah keluar dari Kelas Digital.");
    onLogout();
  });
}