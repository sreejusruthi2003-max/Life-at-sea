// service-worker.js — PWA offline caching

const CACHE = "mnkb-cache-v1";

const filesToCache = [
  "index.html",
  "construction.html",
  "machinery.html",
  "innovations.html",
  "safety.html",
  "regulations.html",
  "flashcards.html",
  "quiz.html",
  "diagrams.html",
  "tools.html",
  "chat.html",
  "styles.css",
  "script.js",
  "chatbot.js",
  "data.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});
