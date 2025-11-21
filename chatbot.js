// chatbot.js — Offline Marine Assistant

let DB = null;

// Load data.json
async function loadDB() {
  try {
    const r = await fetch("data.json");
    DB = await r.json();
  } catch (e) {
    console.error("Could not load data.json", e);
    DB = null;
  }

  initSuggestions();
}

loadDB();

// Pool all data for searching
function poolAll() {
  if (!DB) return [];
  return [].concat(
    DB.sections || [],
    DB.materials || [],
    DB.machinery || [],
    DB.steering_thrusters || [],
    DB.equipment || [],
    DB.cargo || [],
    DB.maintenance || [],
    DB.safety || [],
    DB.regulations || [],
    DB.navigation || [],
    DB.innovations || [],
    DB.training || [],
    DB.diagrams || []
  );
}

// Add message to chatbox
function addMessage(text, who = "bot") {
  const box = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "msg " + (who === "user" ? "user" : "bot");
  div.innerText = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// Score search by relevance
function scoreQuery(q) {
  const pool = poolAll();
  if (!pool.length) return [];

  const tokens = q.toLowerCase().split(/\W+/).filter(Boolean);

  const scored = pool
    .map(item => {
      const text =
        ((item.name || "") +
          " " +
          (item.content || "") +
          " " +
          (item.category || "")).toLowerCase();

      let score = 0;
      tokens.forEach(t => {
        if (text.includes(t)) score += 1;
      });

      if ((item.name || "").toLowerCase() === q.toLowerCase()) score += 3;

      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored;
}

// Answer queries
function answerQuery(q, mode = "concise") {
  if (!DB) {
    addMessage("Database not loaded.");
    return;
  }

  const scored = scoreQuery(q);

  if (scored.length) {
    const top = scored.slice(0, 5).map(s => {
      if (mode === "concise")
        return `• ${s.item.name} — ${s.item.content}`;
      else
        return `• ${s.item.name} (${s.item.category}) — ${s.item.content}\nTip: Search for "${s.item.name}" on the site.`;
    });

    addMessage(top.join("\n\n"));
    return;
  }

  const flash = DB.flashcards || [];
  for (const f of flash) {
    if (q.toLowerCase().includes(f.q.split(" ")[0].toLowerCase())) {
      addMessage(f.q + " — " + f.a);
      return;
    }
  }

  if (q.includes("update") || q.includes("news")) {
    addMessage("Enable GitHub Actions to auto-update live news in data.json.");
    return;
  }

  addMessage("No match found. Try using simpler keywords like 'keel', 'EEXI', 'purifier', etc.");
}

// On "Ask" click
document.addEventListener("click", e => {
  if (e.target.id === "sendBtn") {
    const q = document.getElementById("userInput").value.trim();
    if (!q) return;

    addMessage(q, "user");

    const mode = document.getElementById("mode").value;
    answerQuery(q, mode);

    document.getElementById("userInput").value = "";
  }
});

// Suggested questions
function initSuggestions() {
  const suggestions = [
    "What is a bulkhead?",
    "Explain hydrogen propulsion",
    "What is EEXI?",
    "How does air lubrication work?",
    "Predictive maintenance",
    "PMS checklist for main engine"
  ];

  const container = document.getElementById("suggestions");
  container.innerHTML = "";

  suggestions.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "suggestion";
    btn.innerText = s;
    btn.onclick = () => {
      document.getElementById("userInput").value = s;
      document.getElementById("sendBtn").click();
    };
    container.appendChild(btn);
  });
}

// Greeting
setTimeout(() => {
  addMessage("Hello! I’m your offline Marine Assistant. Ask about ship parts, machinery, safety, or innovations.");
}, 500);

// Dark mode
document.addEventListener("click", e => {
  if (e.target.id === "darkToggle") {
    document.body.classList.toggle("dark");
  }
});
