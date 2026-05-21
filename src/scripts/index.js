// ============================================================
// [KRITERIA 1 - SPA: ENTRY POINT]
// Entry point aplikasi — menginisialisasi SPA dan hash routing
// ============================================================

// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import {
  registerServiceWorker,
  subscribePushNotification,
  unsubscribePushNotification,
  isCurrentlySubscribed,
  isPushSupported,
} from './utils/push-notification';
import {
  subscribeNotification,
  unsubscribeNotification,
} from './data/api';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  // [KRITERIA 1 - SPA] Render halaman awal berdasarkan hash saat ini
  await app.renderPage();

  // [KRITERIA 1 - SPA: HASH ROUTING] Dengarkan perubahan hash URL
  // Setiap kali hash berubah, render halaman yang sesuai TANPA reload
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // ============================================================
  // [PUSH NOTIFICATION] Daftarkan Service Worker
  // ============================================================
  await registerServiceWorker();

  // ============================================================
  // [PUSH NOTIFICATION] Inisialisasi tombol toggle notifikasi
  // ============================================================
  await initNotificationToggle();

  // ============================================================
  // [PWA] Inisialisasi tombol Install App
  // ============================================================
  initPwaInstall();
});

// ============================================================
// [PWA] Setup tombol install
// ============================================================
let deferredPrompt;

function initPwaInstall() {
  const installBtn = document.getElementById('btn-install-app');
  if (!installBtn) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah prompt mini-infobar muncul secara otomatis di mobile
    e.preventDefault();
    // Simpan event sehingga dapat dipicu nanti
    deferredPrompt = e;
    // Tampilkan tombol install (hilangkan class/atribut hidden)
    installBtn.hidden = false;
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }
    // Tampilkan prompt instalasi PWA
    deferredPrompt.prompt();
    // Tunggu pilihan pengguna
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // Karena event ini hanya dapat digunakan satu kali, hapus referensinya
    deferredPrompt = null;
    // Sembunyikan kembali tombol
    installBtn.hidden = true;
  });

  // Jika aplikasi sudah berhasil diinstall, kita bisa menyembunyikan tombol
  window.addEventListener('appinstalled', () => {
    installBtn.hidden = true;
    deferredPrompt = null;
    console.log('PWA was installed');
  });
}

// ============================================================
// [PUSH NOTIFICATION] Setup tombol toggle enable/disable notifikasi
// ============================================================
async function initNotificationToggle() {
  const toggleBtn = document.getElementById('btn-notif-toggle');
  if (!toggleBtn) return;

  // Sembunyikan tombol jika browser tidak support push
  if (!isPushSupported()) {
    toggleBtn.hidden = true;
    return;
  }

  // Set state awal tombol berdasarkan status subscription saat ini
  await updateToggleButtonState(toggleBtn);

  // Event: klik tombol toggle
  toggleBtn.addEventListener('click', async () => {
    toggleBtn.disabled = true;
    toggleBtn.setAttribute('aria-busy', 'true');

    try {
      // ── CEK PERMISSION DULU ──────────────────────────────────
      // Jika permission belum diberikan ('default'), minta izin terlebih dahulu
      // SEBELUM menunggu serviceWorker.ready (agar dialog pasti muncul)
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showNotifToast('⚠️ Izin notifikasi ditolak.', 'warn');
          await updateToggleButtonState(toggleBtn);
          return;
        }
      }

      if (Notification.permission === 'denied') {
        showNotifToast('🚫 Notifikasi diblokir oleh browser. Ubah izin di pengaturan situs.', 'warn');
        await updateToggleButtonState(toggleBtn);
        return;
      }

      // Pastikan SW sudah siap (dengan timeout 10 detik)
      let registration = null;
      try {
        const swReady = new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('SW timeout')), 10000);
          navigator.serviceWorker.ready.then((reg) => {
            clearTimeout(timer);
            resolve(reg);
          });
        });
        registration = await swReady;
      } catch {
        showNotifToast('❌ Service Worker belum siap. Muat ulang halaman.', 'error');
        return;
      }

      // Cek status subscription saat ini langsung dari registration
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        // ── UNSUBSCRIBE ──────────────────────────────────────
        try {
          const token = localStorage.getItem('authToken');
          if (token) await unsubscribeNotification(existingSubscription);
        } catch (err) {
          console.warn('[Notif] Gagal unsubscribe di server:', err);
        }
        await unsubscribePushNotification();
        showNotifToast('🔕 Notifikasi dinonaktifkan.');
      } else {
        // ── SUBSCRIBE ────────────────────────────────────────
        const subscription = await subscribePushNotification();
        if (!subscription) {
          showNotifToast('⚠️ Gagal membuat subscription notifikasi.', 'warn');
          return;
        }

        // Kirim subscription ke server Dicoding
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            const result = await subscribeNotification(subscription);
            console.info('[Notif] Subscribe ke server:', result);
          } else {
            console.warn('[Notif] User belum login, subscription hanya tersimpan di browser.');
          }
        } catch (err) {
          console.warn('[Notif] Gagal subscribe di server:', err);
        }

        showNotifToast('🔔 Notifikasi berhasil diaktifkan!');
      }

      // Perbarui tampilan tombol
      await updateToggleButtonState(toggleBtn);
    } catch (error) {
      console.error('[Notif] Error saat toggle notifikasi:', error);
      showNotifToast('❌ Terjadi kesalahan. Coba lagi.', 'error');
    } finally {
      toggleBtn.disabled = false;
      toggleBtn.removeAttribute('aria-busy');
    }
  });
}

/**
 * Perbarui ikon, teks, dan aria-label tombol sesuai status subscription
 */
async function updateToggleButtonState(btn) {
  const subscribed = await isCurrentlySubscribed();
  const permissionBlocked = Notification.permission === 'denied';

  if (permissionBlocked) {
    btn.innerHTML = `<span aria-hidden="true">🚫</span><span class="notif-btn-label">Notifikasi Diblokir</span>`;
    btn.setAttribute('aria-label', 'Notifikasi diblokir oleh browser');
    btn.disabled = true;
    btn.classList.add('notif-btn--blocked');
    btn.classList.remove('notif-btn--on', 'notif-btn--off');
    return;
  }

  if (subscribed) {
    btn.innerHTML = `<span aria-hidden="true">🔔</span><span class="notif-btn-label">Notifikasi Aktif</span>`;
    btn.setAttribute('aria-label', 'Nonaktifkan push notification');
    btn.setAttribute('aria-pressed', 'true');
    btn.classList.add('notif-btn--on');
    btn.classList.remove('notif-btn--off', 'notif-btn--blocked');
  } else {
    btn.innerHTML = `<span aria-hidden="true">🔕</span><span class="notif-btn-label">Aktifkan Notifikasi</span>`;
    btn.setAttribute('aria-label', 'Aktifkan push notification');
    btn.setAttribute('aria-pressed', 'false');
    btn.classList.add('notif-btn--off');
    btn.classList.remove('notif-btn--on', 'notif-btn--blocked');
  }
}

/**
 * Tampilkan toast message singkat di sudut layar
 */
function showNotifToast(message, type = 'success') {
  // Hapus toast lama jika masih ada
  const old = document.getElementById('notif-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'notif-toast';
  toast.className = `notif-toast notif-toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animasi masuk
  requestAnimationFrame(() => toast.classList.add('notif-toast--visible'));

  // Hilang otomatis setelah 3 detik
  setTimeout(() => {
    toast.classList.remove('notif-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}
