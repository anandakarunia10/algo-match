import { clearSession } from "./lms-session.js";

export function showDashboardView(user) {
  document.getElementById("lms-auth-section")?.classList.add("hidden");
  document.getElementById("lms-dashboard-section")?.classList.remove("hidden");

  document.getElementById("dash-welcome-name").textContent = `Halo, ${user.nama}!`;
  document.getElementById("dash-user-meta").textContent = `NIM: ${user.nim}  •  Kelas: ${user.kelas}`;
  document.getElementById("dash-role-badge").textContent =
    user.role === "dosen" ? "Dosen / Pengajar" : "Mahasiswa";
}

export function initDashboardUI({ onLogout, notify }) {
  document.getElementById("btn-lms-logout")?.addEventListener("click", () => {
    clearSession();
    notify("Anda telah keluar dari Kelas Digital.");
    onLogout();
  });
}