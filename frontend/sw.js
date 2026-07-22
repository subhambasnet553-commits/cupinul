// Minimal service worker just to satisfy PWA installability requirements.
// Doesn't cache anything aggressively since your data changes constantly.
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());
self.addEventListener("fetch", (e) => {
  // Just pass everything straight through to the network as normal.
});