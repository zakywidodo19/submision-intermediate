// ============================================================
// [KRITERIA 2 - MVP: VIEW]
// HomePage — Template halaman beranda dengan daftar cerita + peta digital
// [KRITERIA 2] Menampilkan data API: gambar + nama + deskripsi + tanggal + lokasi
// [KRITERIA 2 - SKILLED] Sinkronisasi list ↔ peta
// [KRITERIA 2 - ADVANCE] Layer control 3 tile layer (di HomeMap)
// ============================================================

import HomePresenter from './home-presenter';
import { showFormattedDate } from '../../utils/index';
import FavoriteStoryIdb from '../../data/favorite-story-idb';

export default class HomePage {
  #presenter = null;
  #storyCardClickCallback = null;

  async render() {
    return /* html */ `
      <!-- ======================================================
           [KRITERIA 2 - MVP: VIEW] Template Halaman Beranda
           Menampilkan data API + Peta Digital
           ====================================================== -->

      <!-- Hero Section -->
      <section class="hero-section" aria-labelledby="hero-heading">
        <div class="hero-bg-decoration" aria-hidden="true">
          <span class="hero-orb hero-orb--1"></span>
          <span class="hero-orb hero-orb--2"></span>
          <span class="hero-orb hero-orb--3"></span>
        </div>
        <div class="container">
          <div class="hero-content">
            <span class="hero-badge">✨ Platform Cerita Indonesia</span>
            <h1 id="hero-heading" class="hero-title">
              Bagikan Ceritamu,<br />
              <span class="hero-title--accent">Inspirasi Dunia</span>
            </h1>
            <p class="hero-subtitle">
              Temukan cerita perjalanan dan pengalaman hidup dari seluruh Nusantara,
              divisualisasikan langsung di peta digital.
            </p>
            <div class="hero-actions">
              <a href="#/register" class="btn btn-primary" id="hero-cta-register">Mulai Berbagi</a>
              <a href="#/login" class="btn btn-ghost" id="hero-cta-login">Sudah Punya Akun?</a>
            </div>
            <div class="hero-stats" aria-label="Statistik platform">
              <div class="hero-stat"><strong>10K+</strong><span>Cerita</span></div>
              <div class="hero-stat-divider" aria-hidden="true"></div>
              <div class="hero-stat"><strong>50K+</strong><span>Pembaca</span></div>
              <div class="hero-stat-divider" aria-hidden="true"></div>
              <div class="hero-stat"><strong>500+</strong><span>Kota</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================
           [KRITERIA 2] Section utama: Daftar cerita + Peta Digital
           ====================================================== -->
      <section class="content-section" aria-labelledby="stories-map-heading">
        <div class="container">
          <div class="content-header">
            <div>
              <h2 id="stories-map-heading" class="section-title">Cerita & Peta Persebaran</h2>
              <p class="section-subtitle">
                Klik cerita untuk melihat lokasinya di peta, atau klik marker untuk melihat ceritanya
              </p>
            </div>
            <a href="#/add-story" class="btn btn-outline btn-sm" id="btn-add-story">+ Tulis Cerita</a>
          </div>

          <!-- Loading State -->
          <div id="stories-loading" class="loading-container" role="status" aria-live="polite">
            <div class="loading-spinner" aria-hidden="true"></div>
            <p>Mengambil cerita dari API...</p>
          </div>

          <!-- Error State -->
          <div id="stories-error" class="error-container" hidden aria-live="assertive"></div>

          <!-- Login Prompt (jika belum login) -->
          <div id="login-prompt" class="login-prompt" hidden>
            <div class="login-prompt__card">
              <span class="login-prompt__icon" aria-hidden="true">🔐</span>
              <h3>Masuk untuk Melihat Cerita</h3>
              <p>Bergabunglah dengan komunitas CeritaKita untuk membaca dan berbagi cerita dari seluruh Indonesia.</p>
              <div class="login-prompt__actions">
                <a href="#/login" class="btn btn-primary" id="prompt-login-btn">Masuk Sekarang</a>
                <a href="#/register" class="btn btn-outline" id="prompt-register-btn">Daftar Gratis</a>
              </div>
            </div>
          </div>

          <!-- ======================================================
               [KRITERIA 2] Main content: List + Map (dua kolom)
               ====================================================== -->
          <div id="main-content-area" class="stories-map-layout" hidden>

            <!-- Kiri: Daftar Cerita -->
            <div class="stories-panel">
              <div class="stories-panel__header">
                <h3 class="stories-panel__title">
                  Daftar Cerita <span id="stories-count" class="stories-count"></span>
                </h3>
              </div>
              <!-- [KRITERIA 2] Story list — setiap card menampilkan: gambar, nama, deskripsi, tanggal, lokasi -->
              <div id="stories-list" class="stories-list" aria-label="Daftar cerita"></div>
            </div>

            <!-- Kanan: Peta Digital -->
            <div class="map-panel">
              <div class="map-panel__header">
                <h3 class="map-panel__title">🗺️ Peta Persebaran</h3>
                <span class="map-panel__hint">Klik marker untuk detail</span>
              </div>
              <!-- [KRITERIA 2] Container peta Leaflet -->
              <div id="story-map" class="story-map" role="application" aria-label="Peta persebaran cerita"></div>
            </div>

          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // [KRITERIA 2 - MVP] Buat presenter dan load data dari API
    this.#presenter = new HomePresenter(this);
    await this.#presenter.loadStories();
  }

  // ============================================================
  // [KRITERIA 2 - MVP: VIEW] Metode antarmuka untuk Presenter
  // ============================================================

  showLoading() {
    document.getElementById('stories-loading').hidden = false;
    document.getElementById('stories-error').hidden = true;
    document.getElementById('login-prompt').hidden = true;
    document.getElementById('main-content-area').hidden = true;
  }

  showLoginPrompt() {
    document.getElementById('stories-loading').hidden = true;
    document.getElementById('login-prompt').hidden = false;
  }

  showError(message) {
    document.getElementById('stories-loading').hidden = true;
    const errorEl = document.getElementById('stories-error');
    errorEl.hidden = false;
    errorEl.innerHTML = /* html */ `
      <div class="error-card">
        <span class="error-icon" aria-hidden="true">⚠️</span>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn btn-outline btn-sm">Coba Lagi</button>
      </div>
    `;
  }

  /** [KRITERIA 2] Tampilkan daftar cerita dari API di story list */
  async showStories(stories) {
    document.getElementById('stories-loading').hidden = true;
    document.getElementById('main-content-area').hidden = false;

    const countEl = document.getElementById('stories-count');
    if (countEl) countEl.textContent = `(${stories.length})`;

    const listEl = document.getElementById('stories-list');
    if (!stories.length) {
      listEl.innerHTML = /* html */ `
        <div class="empty-state">
          <span class="empty-icon" aria-hidden="true">📭</span>
          <p>Belum ada cerita. Jadilah yang pertama!</p>
        </div>`;
      return;
    }

    // Ambil data favorit dari IDB
    const favorites = await FavoriteStoryIdb.getAllStories();
    const favoriteIds = new Set(favorites.map(f => f.id));

    listEl.innerHTML = stories.map((s) => this.#createStoryCard(s, favoriteIds.has(s.id))).join('');

    // [KRITERIA 2 - SKILLED] Daftarkan event klik story card → sync ke peta
    listEl.querySelectorAll('.story-item').forEach((card) => {
      card.addEventListener('click', (e) => {
        // Cegah propagasi klik jika yang diklik adalah tombol favorite
        if (e.target.closest('.btn-favorite-toggle')) return;

        const storyId = card.dataset.storyId;
        this.#storyCardClickCallback?.(storyId);
        // Highlight card yang diklik
        listEl.querySelectorAll('.story-item').forEach((c) => c.classList.remove('story-item--active'));
        card.classList.add('story-item--active');
      });

      // [KRITERIA 4 - ADVANCE] Keyboard accessibility: Enter / Space = klik
      // Elemen role="button" harus bisa dioperasikan dengan keyboard
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.btn-favorite-toggle')) return;
          e.preventDefault(); // Cegah scroll saat tekan Space
          card.click();
        }
      });
    });

    // Event listener untuk tombol favorite
    listEl.querySelectorAll('.btn-favorite-toggle').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const storyId = btn.dataset.id;
        const isFav = btn.dataset.favorited === 'true';
        const story = stories.find(s => s.id === storyId);

        if (isFav) {
          await FavoriteStoryIdb.deleteStory(storyId);
          btn.dataset.favorited = 'false';
          btn.innerHTML = '🤍 Tambah Favorit';
          btn.classList.remove('btn-favorited');
        } else {
          await FavoriteStoryIdb.putStory(story);
          btn.dataset.favorited = 'true';
          btn.innerHTML = '❤️ Favorit';
          btn.classList.add('btn-favorited');
        }
      });
    });
  }

  /**
   * [KRITERIA 2] Template card cerita
   * Menampilkan: gambar, nama pencerita, tanggal, deskripsi (excerpt), lokasi
   */
  #createStoryCard(story, isFavorited = false) {
    const date = showFormattedDate(story.createdAt, 'id-ID');
    const excerpt = story.description.length > 100
      ? story.description.substring(0, 100) + '...'
      : story.description;
    const hasLocation = story.lat !== null && story.lat !== undefined;

    return /* html */ `
      <article
        class="story-item"
        id="story-card-${story.id}"
        data-story-id="${story.id}"
        tabindex="0"
        role="button"
        aria-label="Cerita dari ${story.name} — klik untuk lihat di peta"
      >
        <!-- [KRITERIA 2] Gambar cerita dari API -->
        <img
          src="${story.photoUrl}"
          alt="Foto cerita dari ${story.name}"
          class="story-item__img"
          loading="lazy"
          onerror="this.src='https://picsum.photos/seed/${story.id}/120/120'"
        />
        <div class="story-item__body">
          <!-- [KRITERIA 2] Nama pencerita -->
          <div class="story-item__author">
            <span class="author-avatar-sm" aria-hidden="true">${story.name.charAt(0)}</span>
            <strong>${story.name}</strong>
          </div>
          <!-- [KRITERIA 2] Tanggal cerita -->
          <time class="story-item__date" datetime="${story.createdAt}">${date}</time>
          <!-- [KRITERIA 2] Deskripsi cerita -->
          <p class="story-item__excerpt">${excerpt}</p>
          <!-- [KRITERIA 2] Lokasi (lat/lon dari API) -->
          ${hasLocation
            ? `<span class="story-item__location">
                <span aria-hidden="true">📍</span>
                ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
              </span>`
            : ''}
          <div style="margin-top: 12px; z-index: 10;">
            <button class="btn btn-outline btn-sm btn-favorite-toggle ${isFavorited ? 'btn-favorited' : ''}" 
                    data-id="${story.id}" 
                    data-favorited="${isFavorited}"
                    aria-label="${isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}">
              ${isFavorited ? '❤️ Favorit' : '🤍 Tambah Favorit'}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * [KRITERIA 2 - SKILLED] Scroll ke & highlight story card yang storyId-nya diklik di peta
   */
  highlightStoryCard(storyId) {
    const allCards = document.querySelectorAll('.story-item');
    allCards.forEach((c) => c.classList.remove('story-item--active'));

    const card = document.getElementById(`story-card-${storyId}`);
    if (card) {
      card.classList.add('story-item--active');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * [KRITERIA 2 - SKILLED] Daftarkan callback saat story card diklik
   */
  onStoryCardClick(callback) {
    this.#storyCardClickCallback = callback;
  }
}
