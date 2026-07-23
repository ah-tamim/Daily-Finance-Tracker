// Basic Service Worker for Daily Finance Tracker PWA
const CACHE_NAME = 'daily-finance-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle requests dynamically
  return;
});
