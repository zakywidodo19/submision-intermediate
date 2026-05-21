// ============================================================
// [KRITERIA 2 - API CLIENT]
// Story API — semua HTTP request ke Dicoding Story API
// Endpoint: https://story-api.dicoding.dev/v1
// ============================================================

import CONFIG from '../config';

/** Helper: ambil token dari localStorage */
const getToken = () => localStorage.getItem('authToken');

/** Helper: buat header Authorization */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ============================================================
// AUTH ENDPOINTS
// ============================================================

/**
 * [KRITERIA 2] Registrasi user baru
 * POST /register
 */
export async function registerUser({ name, email, password }) {
  const response = await fetch(`${CONFIG.BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
}

/**
 * [KRITERIA 2] Login user
 * POST /login
 */
export async function loginUser({ email, password }) {
  const response = await fetch(`${CONFIG.BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// ============================================================
// STORY ENDPOINTS
// ============================================================

/**
 * [KRITERIA 2] Ambil daftar cerita dengan data lokasi (lat/lon)
 * GET /stories?location=1&size=N
 * @param {number} size - Jumlah cerita yang diambil
 * @param {number} location - 1 = hanya cerita ber-lokasi, 0 = semua
 */
export async function getStories({ size = CONFIG.DEFAULT_STORY_SIZE, location = 1 } = {}) {
  const params = new URLSearchParams({ size, location });
  const response = await fetch(`${CONFIG.BASE_URL}/stories?${params}`, {
    headers: authHeaders(),
  });
  return response.json();
}

/**
 * [KRITERIA 2] Ambil detail satu cerita
 * GET /stories/:id
 */
export async function getStoryDetail(id) {
  const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
    headers: authHeaders(),
  });
  return response.json();
}

/**
 * [KRITERIA 2] Tambah cerita baru (dengan foto dan lokasi opsional)
 * POST /stories
 */
export async function addStory({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  // [FIX] Gunakan != null untuk cover kedua kasus: null DAN undefined
  // null !== undefined → true (bug lama, lat="null" terkirim ke API)
  // null != null → false (benar, tidak terkirim)
  if (lat != null) formData.append('lat', lat);
  if (lon != null) formData.append('lon', lon);

  const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  return response.json();
}

// ============================================================
// PUSH NOTIFICATION ENDPOINTS
// ============================================================

/**
 * [PUSH NOTIFICATION] Daftarkan langganan push notification ke server
 * POST /notifications/subscribe
 * @param {PushSubscription} subscription - Objek PushSubscription dari browser
 */
export async function subscribeNotification(subscription) {
  const subJson = subscription.toJSON();
  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      },
    }),
  });
  return response.json();
}

/**
 * [PUSH NOTIFICATION] Batalkan langganan push notification dari server
 * DELETE /notifications/subscribe
 * @param {PushSubscription} subscription - Objek PushSubscription yang aktif
 */
export async function unsubscribeNotification(subscription) {
  const subJson = subscription.toJSON();
  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({
      endpoint: subJson.endpoint,
    }),
  });
  return response.json();
}