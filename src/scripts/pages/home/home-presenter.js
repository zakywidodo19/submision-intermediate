// ============================================================
// [KRITERIA 2 - MVP: PRESENTER]
// HomePresenter — logika bisnis beranda: load stories + inisialisasi peta
// [KRITERIA 2 - SKILLED] Sinkronisasi list ↔ peta
// ============================================================

import HomeModel from './home-model';
import HomeMap from './home-map';

export default class HomePresenter {
  #view;
  // [KRITERIA 2] Instance peta Leaflet
  #map = new HomeMap();

  constructor(view) {
    this.#view = view;
  }

  /**
   * [KRITERIA 2] Load cerita dari API lalu tampilkan di list dan peta
   */
  async loadStories() {
    const token = localStorage.getItem('authToken');

    // Jika belum login, tampilkan prompt login
    if (!token) {
      this.#view.showLoginPrompt();
      return;
    }

    try {
      this.#view.showLoading();

      // [KRITERIA 2] Ambil data dari Story API (termasuk lat/lon untuk peta)
      const response = await HomeModel.getStoriesWithLocation();

      if (response.error) {
        // Token expired / unauthorized → redirect ke login
        if (response.message?.toLowerCase().includes('unauthorized') || response.message?.toLowerCase().includes('missing')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userName');
          this.#view.showLoginPrompt();
          return;
        }
        this.#view.showError(response.message);
        return;
      }

      const stories = response.listStory || [];
      this.#view.showStories(stories);

      // [KRITERIA 2] Inisialisasi peta dan tambahkan marker setelah list ter-render
      this.#initMap(stories);
    } catch (error) {
      console.error('[HomePresenter] Error:', error);
      this.#view.showError('Gagal memuat cerita. Periksa koneksi internet Anda.');
    }
  }

  /**
   * [KRITERIA 2] Inisialisasi peta Leaflet dan tambahkan marker semua cerita
   */
  #initMap(stories) {
    this.#map.init('story-map');

    // [KRITERIA 2] Tambahkan marker untuk setiap cerita yang punya lokasi
    this.#map.addStoryMarkers(stories);

    // [KRITERIA 2 - SKILLED] Sinkronisasi: klik marker → scroll & highlight story card
    this.#map.onMarkerClick((storyId) => {
      this.#view.highlightStoryCard(storyId);
    });

    // [KRITERIA 2 - SKILLED] Sinkronisasi: klik story card → highlight & pan ke marker
    this.#view.onStoryCardClick((storyId) => {
      this.#map.highlightMarker(storyId);
    });

    // Refresh ukuran peta setelah DOM fully rendered
    setTimeout(() => this.#map.invalidateSize(), 100);
  }

  /** Cleanup peta saat meninggalkan halaman */
  destroy() {
    this.#map.destroy();
  }
}
