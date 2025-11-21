// script.js - Main website functions

let DATA = null;

// Load data.json
async function loadData() {
  try {
    const r = await fetch("data.json");
    DATA = await r.json();
  } catch (e) {
    console.error("Error loading data.json", e);
    DATA = null;
  }

  initSearch();
  initInstall();
  displayAutoUpdates();
}

loadData();

// Combine all sections for searching
function poolAll() {
  if (!DATA) return [];

  return [].concat(
    DATA.sections || [],
    DATA.materials || [],
    DATA.machinery || [],
    DATA.innovations || [],
    DATA.safety || [],
    DATA.regulations || [],
    DATA.navigation || [],
    DATA.maintenance || [],
    DATA.training || [],
    DATA.diagrams || []
  );
}

// Search function
function initSearch() {
  const input = document.getElementById("search");
  const results = document.getElementById("results");

  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    const pool = poolAll();

    const filtered = pool.filter(item => {
      if (!q) return true;
      return (
        (item.name || "").toLowerCase().includes(q) ||
        (item.content || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q)
      );
    });

    results.innerHTML = "";

    filtered.slice(0, 50).forEach(it => {
      const d = document.createElement("div");
      d.className = "result";
      d.innerHTML = `
        <div class="result-title">${it.name}</div>
        <div class="small">${it.category}</div>
        <p>${it.content}</p>
      `;
      results.appendChild(d);
    });

    if (filtered.length === 0) {
      results.innerHTML = '<div class="small card">No results found.</div>';
    }
  });
}

// PWA install button
let deferredPrompt;

function initInstall() {
  const btn = document.getElementById("installBtn");
  if (!btn) return;

  btn.style.display = "none";

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    btn.style.display = "inline-block";

    btn.addEventListener("click", async () => {
      btn.style.display = "none";
      deferredPrompt.prompt();
      deferredPrompt = null;
    });
  });
}

// Display auto-update data
function displayAutoUpdates() {
  const el = document.getElementById("autoUpdates");
  if (!DATA || !DATA.latest_updates) return;

  el.innerHTML = DATA.latest_updates
    .slice(0, 6)
    .map(u => `<div class="small">• ${u.title}</div>`)
    .join("");
}

// Dark mode
document.addEventListener("click", e => {
  if (e.target.id === "darkToggle") {
    document.body.classList.toggle("dark");
  }
});

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .catch(() => console.log("Service worker failed"));
}
