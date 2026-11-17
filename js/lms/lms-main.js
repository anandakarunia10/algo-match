import { getSession } from "./lms-session.js";
import { initAuthUI, showAuthView } from "./lms-auth-ui.js";
import { initDashboardUI, showDashboardView } from "./lms-dashboard-ui.js";

function showToast(message) {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  initAuthUI({
    onLoginSuccess: (user) => showDashboardView(user),
    notify: showToast,
  });

  initDashboardUI({
    onLogout: () => showAuthView(),
    notify: showToast,
  });

  const activeUser = getSession();
  if (activeUser) {
    showDashboardView(activeUser);
  } else {
    showAuthView();
  }
});