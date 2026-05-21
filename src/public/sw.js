// ============================================================
// [PUSH NOTIFICATION] Service Worker — CeritaKita
// Menangani:
//   - push event: tampilkan notifikasi dengan action button
//   - notificationclick: navigasi ke halaman beranda / story detail
// ============================================================

const SW_VERSION = 'cerITAKITA-sw-v3';
const CACHE_NAME = `ceritakita-app-shell-${SW_VERSION}`;

// Aset yang akan disimpan di cache saat SW diinstall (App Shell)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './app.webmanifest',
];

// ============================================================
// Install & Activate
// ============================================================
self.addEventListener('install', (event) => {
  console.info(`[SW] ${SW_VERSION} installing... precaching assets.`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.info(`[SW] ${SW_VERSION} activated. Cleaning up old caches.`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('ceritakita-app-shell-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// ============================================================
// [PWA] Fetch Event — Offline Support
// ============================================================
self.addEventListener('fetch', (event) => {
  // Hanya tangani GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Jangan cache permintaan ke API
  if (url.origin.includes('dicoding.dev')) {
    return; // Biarkan browser yang menanganinya
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Jika ada di cache, kembalikan segera (dan perbarui di background)
      if (cachedResponse) {
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {
            // Abaikan error background fetch saat offline
          })
        );
        return cachedResponse;
      }

      // 2. Jika tidak ada di cache, coba fetch dari network
      return fetch(event.request).then((networkResponse) => {
        // Simpan ke cache untuk penggunaan berikutnya
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        // 3. Jika offline dan gagal fetch, cek apakah ini navigasi halaman (HTML)
        // Jika ya, berikan index.html dari cache sebagai fallback SPA
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        
        console.warn(`[SW] Offline fetch failed for: ${event.request.url}`);
        throw error;
      });
    })
  );
});

// ============================================================
// [PUSH NOTIFICATION] Push Event
// Menerima data dari server dan menampilkan notifikasi
// ============================================================
self.addEventListener('push', (event) => {
  console.info('[SW] Push event received.');

  let payload = {
    title: 'CeritaKita 📖',
    body: 'Ada cerita baru yang menunggu kamu!',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'cerITAKITA-notif',
    storyId: null,
  };

  // Parse data dari server jika ada
  if (event.data) {
    try {
      const data = event.data.json();
      payload = {
        title: data.title || payload.title,
        body: data.options?.body || data.body || payload.body,
        icon: data.options?.icon || data.icon || payload.icon,
        badge: data.options?.badge || data.badge || payload.badge,
        tag: data.options?.tag || data.tag || payload.tag,
        storyId: data.storyId || data.options?.data?.storyId || null,
      };
    } catch {
      // Coba parse sebagai teks biasa
      const text = event.data.text();
      payload.body = text || payload.body;
    }
  }

  // [ADVANCE] Tambahkan action button "Lihat Cerita" untuk navigasi
  const notificationOptions = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      storyId: payload.storyId,
      url: payload.storyId ? `/#/stories/${payload.storyId}` : '/#/',
      timestamp: Date.now(),
    },
    // [ADVANCE] Action buttons pada notifikasi
    actions: [
      {
        action: 'view-story',
        title: '📖 Lihat Cerita',
      },
      {
        action: 'dismiss',
        title: '✕ Tutup',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions),
  );
});

// ============================================================
// [ADVANCE] Notification Click — Navigasi ke halaman terkait
// ============================================================
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  // Jika user klik tombol "Tutup" — tidak perlu navigasi
  if (action === 'dismiss') {
    console.info('[SW] Notifikasi ditutup oleh user.');
    return;
  }

  // action === 'view-story' ATAU klik badan notifikasi langsung
  // → navigasi ke URL yang sesuai (story detail jika ada storyId)
  const targetUrl = data.url || '/#/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Cek apakah sudah ada tab yang terbuka
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          // Jika ada tab CeritaKita yang terbuka, fokus dan navigasi
          if (clientUrl.origin === self.location.origin && 'focus' in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // Tidak ada tab terbuka → buka tab baru
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});

// ============================================================
// Notification Close (opsional — logging)
// ============================================================
self.addEventListener('notificationclose', (event) => {
  console.info('[SW] Notifikasi ditutup:', event.notification.tag);
});
