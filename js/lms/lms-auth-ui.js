import { hashPassword, saveSession } from "./lms-session.js";
import { apiRegisterUser, apiLoginUser } from "./lms-api.js";

function showAlert(message, isSuccess = false) {
  const alertBox = document.getElementById("auth-alert");
  if (!alertBox) return;
  const prefix = isSuccess ? "✓ " : "✕ ";
  alertBox.textContent = prefix + message;
  alertBox.className = `alert-box ${isSuccess ? "alert-success" : "alert-error"}`;
}

function hideAlert() {
  const alertBox = document.getElementById("auth-alert");
  if (alertBox) alertBox.className = "alert-box hidden";
}

function setLoginInputError(hasError) {
  const nimInput = document.getElementById("login-nim");
  const passInput = document.getElementById("login-password");
  nimInput?.classList.toggle("input-error", hasError);
  passInput?.classList.toggle("input-error", hasError);
}

function triggerCardShake() {
  const card = document.querySelector(".auth-card");
  if (!card) return;
  card.classList.remove("auth-shake");
  void card.offsetWidth; // memicu ulang animasi CSS
  card.classList.add("auth-shake");
  setTimeout(() => card.classList.remove("auth-shake"), 450);
}

function switchAuthTab(mode) {
  hideAlert();
  setLoginInputError(false);

  const tabLogin = document.getElementById("tab-login");
  const tabReg = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formReg = document.getElementById("form-register");

  if (mode === "login") {
    tabLogin?.classList.add("active");
    tabReg?.classList.remove("active");
    formLogin?.classList.remove("hidden");
    formReg?.classList.add("hidden");
  } else {
    tabReg?.classList.add("active");
    tabLogin?.classList.remove("active");
    formReg?.classList.remove("hidden");
    formLogin?.classList.add("hidden");
  }
}

export function showAuthView() {
  document.getElementById("lms-dashboard-section")?.classList.add("hidden");
  document.getElementById("lms-auth-section")?.classList.remove("hidden");
  document.getElementById("form-login")?.reset();
  setLoginInputError(false);
  hideAlert();
}

export function initAuthUI({ onLoginSuccess, notify }) {
  document.getElementById("tab-login")?.addEventListener("click", () => switchAuthTab("login"));
  document.getElementById("tab-register")?.addEventListener("click", () => switchAuthTab("register"));

  // Hapus tanda merah saat user mulai mengetik ulang
  ["login-nim", "login-password"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => {
      setLoginInputError(false);
    });
  });

  // REGISTER
  document.getElementById("form-register")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const nama = document.getElementById("reg-nama").value.trim();
    const nim = document.getElementById("reg-nim").value.trim();
    const kelas = document.getElementById("reg-kelas").value.trim();
    const password = document.getElementById("reg-password").value;
    const btn = document.getElementById("btn-submit-register");

    if (!nama || !nim || !kelas || !password) {
      showAlert("Semua kolom pendaftaran wajib diisi.");
      triggerCardShake();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Mendaftarkan Akun...";

    try {
      const passwordHash = await hashPassword(password);
      const result = await apiRegisterUser({ nama, nim, kelas, passwordHash });

      if (result.status === "success") {
        e.target.reset();
        switchAuthTab("login");
        document.getElementById("login-nim").value = nim;
        showAlert(result.message, true);
        notify("✓ Akun berhasil terdaftar! Silakan login.");
      } else {
        const msg = result.message || "Gagal mendaftar akun.";
        showAlert(msg, false);
        notify(`✕ ${msg}`);
        triggerCardShake();
      }
    } catch (err) {
      const msg = err?.message || "Terjadi kesalahan koneksi ke server Spreadsheet.";
      showAlert(msg, false);
      notify(`✕ ${msg}`);
      triggerCardShake();
    } finally {
      btn.disabled = false;
      btn.textContent = "Daftar Akun Sekarang";
    }
  });

  // LOGIN
  document.getElementById("form-login")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();
    setLoginInputError(false);

    const nimEl = document.getElementById("login-nim");
    const passEl = document.getElementById("login-password");
    const btn = document.getElementById("btn-submit-login");

    const nim = nimEl.value.trim();
    const password = passEl.value;

    if (!nim || !password) {
      const msg = "NIM dan Password wajib diisi!";
      showAlert(msg, false);
      notify(`✕ ${msg}`);
      setLoginInputError(true);
      triggerCardShake();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Memverifikasi...";

    try {
      const passwordHash = await hashPassword(password);
      const result = await apiLoginUser({ nim, passwordHash });

      if (result.status === "success" && result.user) {
        saveSession(result.user);
        notify(`✓ Selamat datang, ${result.user.nama}!`);
        onLoginSuccess(result.user);
      } else {
        const msg = result.message || "NIM atau Password tidak sesuai!";
        showAlert(msg, false);
        notify(`✕ ${msg}`);
        setLoginInputError(true);
        triggerCardShake();
        passEl.value = "";
        passEl.focus();
      }
    } catch (err) {
      const msg = err?.message || "Gagal terhubung ke server Spreadsheet.";
      showAlert(msg, false);
      notify(`✕ ${msg}`);
      triggerCardShake();
    } finally {
      btn.disabled = false;
      btn.textContent = "Masuk ke Kelas Digital";
    }
  });
}