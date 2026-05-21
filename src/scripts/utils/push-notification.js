// ============================================================
// [PUSH NOTIFICATION] Push Notification Manager
// Mengelola: registrasi SW, subscribe, unsubscribe, toggle
// ============================================================

import CONFIG from '../config';

// ============================================================
// Helper: konversi VAPID key dari base64url ke Uint8Array
// (diperlukan oleh PushManager.subscribe)
// ============================================================
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// ============================================================
// Service Worker Registration
// ============================================================

/**
 * Daftarkan Service Worker.
 * Dipanggil sekali saat aplikasi pertama kali dimuat.
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PushNotif] Service Worker tidak didukung browser ini.');
    return null;
  }

  try {
    // Gunakan BASE_URL Vite agar path SW sesuai di semua environment
    // - Dev  : /sw.js
    // - Prod (GitHub Pages): /submision-intermediate/sw.js
    const swPath = import.meta.env.BASE_URL + 'sw.js';
    const swScope = import.meta.env.BASE_URL;

    const registration = await navigator.serviceWorker.register(swPath, {
      scope: swScope,
    });
    console.info('[PushNotif] Service Worker berhasil didaftarkan:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[PushNotif] Gagal mendaftarkan Service Worker:', error);
    return null;
  }
}

// ============================================================
// Push Notification: Subscribe
// ============================================================

/**
 * Minta izin notifikasi dari user, lalu buat PushSubscription baru.
 * @returns {Promise<PushSubscription|null>}
 */
export async function subscribePushNotification() {
  if (!('PushManager' in window)) {
    console.warn('[PushNotif] Push API tidak didukung browser ini.');
    return null;
  }

  // Minta izin notifikasi
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[PushNotif] Izin notifikasi ditolak user.');
    return null;
  }

  // Ambil SW registration yang aktif
  const registration = await navigator.serviceWorker.ready;

  // Cek jika sudah ada subscription aktif
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    console.info('[PushNotif] Subscription sudah aktif, gunakan yang ada.');
    return existingSubscription;
  }

  // Buat subscription baru dengan VAPID key
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  });

  console.info('[PushNotif] PushSubscription baru berhasil dibuat.');
  return subscription;
}

// ============================================================
// Push Notification: Unsubscribe
// ============================================================

/**
 * Hapus subscription push notification dari browser.
 * @returns {Promise<boolean>} true jika berhasil
 */
export async function unsubscribePushNotification() {
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    console.info('[PushNotif] Tidak ada subscription aktif untuk dihapus.');
    return true;
  }

  const result = await subscription.unsubscribe();
  console.info('[PushNotif] Unsubscribe berhasil:', result);
  return result;
}

// ============================================================
// Cek status subscription saat ini
// ============================================================

export async function isCurrentlySubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  try {
    // Beri timeout 3 detik agar tidak hang jika SW gagal install
    const swReady = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('SW ready timeout')), 3000);
      navigator.serviceWorker.ready.then((reg) => {
        clearTimeout(timer);
        resolve(reg);
      });
    });

    const registration = await swReady;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

/**
 * Cek apakah browser mendukung push notification.
 */
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
