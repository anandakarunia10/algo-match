import { loadProgress } from "./utils/storage.js";
import { initAudioToggle, initBacksound } from "./utils/audio.js";
import { initNavigation } from "./modules/navigation.js";
import { initMateriTabs, renderPanduan, renderLevelCards } from "./modules/renderPages.js";

document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  initAudioToggle();
  initBacksound();
  initNavigation();
  initMateriTabs();
  renderPanduan();
  renderLevelCards();
});