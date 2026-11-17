import { LMS_CONFIG } from "./lms-config.js";

const REQUEST_TIMEOUT_MS = 12000;

async function postToWebhook(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(LMS_CONFIG.WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const rawText = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error(
        "Respon server tidak valid. Pastikan deployment Apps Script berstatus 'Siapa saja'."
      );
    }
    return parsed;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Waktu verifikasi habis (timeout). Periksa koneksi internet lalu coba lagi.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiRegisterUser({ nama, nim, kelas, passwordHash }) {
  return postToWebhook({ action: "register", nama, nim, kelas, passwordHash });
}

export async function apiLoginUser({ nim, passwordHash }) {
  return postToWebhook({ action: "login", nim, passwordHash });
}

export async function apiGetDashboardData(nim) {
  return postToWebhook({ action: "get_dashboard", nim });
}

export async function apiSubmitTugas({ nim, nama, kelas, judulTugas, linkJawaban, catatan }) {
  return postToWebhook({
    action: "submit_tugas",
    nim,
    nama,
    kelas,
    judulTugas,
    linkJawaban,
    catatan,
  });
}

export async function apiGetDosenData() {
  return postToWebhook({ action: "get_dosen_data" });
}

export async function apiAddMateri({ pertemuan, judul, deskripsi, tipe, link }) {
  return postToWebhook({
    action: "add_materi",
    pertemuan,
    judul,
    deskripsi,
    tipe,
    link,
  });
}

export async function apiUpdateMateri({ rowNumber, pertemuan, judul, deskripsi, tipe, link }) {
  return postToWebhook({
    action: "update_materi",
    rowNumber,
    pertemuan,
    judul,
    deskripsi,
    tipe,
    link,
  });
}

export async function apiDeleteMateri(rowNumber) {
  return postToWebhook({
    action: "delete_materi",
    rowNumber,
  });
}

export async function apiGradeTugas({ rowNumber, nilai }) {
  return postToWebhook({
    action: "grade_tugas",
    rowNumber,
    nilai,
  });
}