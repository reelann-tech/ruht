
const CACHE = "ruht-photos-20260922-v1";

const CORE = [
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.all(
        CORE.map(u =>
          fetch(u, { cache: "reload" })
            .then(r => {
              if (r.ok) return c.put(u, r);
            })
            .catch(() => {})
        )
      )
    )
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k !== CACHE)
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r.ok) {
            const copy = r.clone();
            caches.open(CACHE)
              .then(c => c.put("./index.html", copy));
          }
          return r;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE)
            .then(c => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
