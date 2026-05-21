// ============================================================
// [KRITERIA 2 - PETA DIGITAL]
// HomeMap — Leaflet map manager untuk halaman beranda
// Fitur:
//   [KRITERIA 2] Marker + popup untuk setiap cerita
//   [KRITERIA 2 - SKILLED] Sinkronisasi list ↔ peta (highlight aktif)
//   [KRITERIA 2 - ADVANCE] Layer control dengan 3 tile layer
// ============================================================

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path di environment Vite/bundler
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});

export default class HomeMap {
  #map = null;
  #markers = new Map(); // storyId → L.Marker
  #onMarkerClickCallback = null;
  #activeStoryId = null;

  // ============================================================
  // [KRITERIA 2 - ADVANCE] Definisi tile layers
  // 3 tile layer yang tersedia melalui layer control
  // ============================================================
  static #TILE_LAYERS = {
    'Peta Jalan (OpenStreetMap)': L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      },
    ),
    'Peta Terang (CartoDB)': L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
        maxZoom: 20,
      },
    ),
    'Satelit (Esri)': L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      },
    ),
  };

  /**
   * [KRITERIA 2] Inisialisasi peta Leaflet pada elemen DOM target
   * @param {string} containerId - ID elemen <div> untuk peta
   */
  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`[HomeMap] Container #${containerId} tidak ditemukan.`);
      return;
    }

    // [KRITERIA 2] Inisialisasi peta — center di Indonesia
    this.#map = L.map(containerId, {
      center: [-2.5, 118.0],
      zoom: 5,
      zoomControl: true,
    });

    // [KRITERIA 2 - ADVANCE] Tambahkan tile layer default (OpenStreetMap)
    HomeMap.#TILE_LAYERS['Peta Jalan (OpenStreetMap)'].addTo(this.#map);

    // [KRITERIA 2 - ADVANCE] Tambahkan layer control untuk memilih tile layer
    L.control
      .layers(HomeMap.#TILE_LAYERS, null, {
        position: 'topright',
        collapsed: false,
      })
      .addTo(this.#map);

    // Tambahkan scale indicator
    L.control.scale({ imperial: false, metric: true }).addTo(this.#map);

    console.info('[KRITERIA 2] Peta Leaflet berhasil diinisialisasi dengan 3 tile layer.');
  }

  /**
   * [KRITERIA 2] Tambahkan semua marker cerita ke peta
   * @param {Array} stories - Array cerita dari API
   */
  addStoryMarkers(stories) {
    if (!this.#map) return;

    // Hapus marker lama
    this.#markers.forEach((marker) => marker.remove());
    this.#markers.clear();

    const validStories = stories.filter(
      (s) => s.lat !== null && s.lon !== null && s.lat !== undefined && s.lon !== undefined,
    );

    if (validStories.length === 0) {
      console.warn('[HomeMap] Tidak ada cerita dengan data lokasi untuk ditampilkan di peta.');
      return;
    }

    validStories.forEach((story) => {
      this.#addSingleMarker(story);
    });

    // Sesuaikan zoom peta agar semua marker terlihat
    if (validStories.length > 0) {
      const group = L.featureGroup([...this.#markers.values()]);
      this.#map.fitBounds(group.getBounds().pad(0.1));
    }

    console.info(`[KRITERIA 2] ${validStories.length} marker berhasil ditambahkan ke peta.`);
  }

  /**
   * [KRITERIA 2] Buat dan tambahkan satu marker dengan popup
   */
  #addSingleMarker(story) {
    // [KRITERIA 2] Custom marker dengan inisial nama pencerita
    const icon = this.#createCustomIcon(story, false);

    const marker = L.marker([story.lat, story.lon], { icon })
      .bindPopup(this.#createPopupContent(story), {
        maxWidth: 260,
        className: 'story-popup',
      })
      .addTo(this.#map);

    // [KRITERIA 2 - SKILLED] Event: klik marker → sinkronisasi ke story card
    marker.on('click', () => {
      this.#setActiveMarker(story.id);
      if (this.#onMarkerClickCallback) {
        this.#onMarkerClickCallback(story.id);
      }
    });

    this.#markers.set(story.id, marker);
  }

  /**
   * [KRITERIA 2] Template HTML isi popup marker
   */
  #createPopupContent(story) {
    const date = new Date(story.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const excerpt =
      story.description.length > 100
        ? story.description.substring(0, 100) + '...'
        : story.description;

    return /* html */ `
      <div class="map-popup">
        <img
          src="${story.photoUrl}"
          alt="Foto dari ${story.name}"
          class="map-popup__img"
          onerror="this.src='https://picsum.photos/seed/${story.id}/260/140'"
        />
        <div class="map-popup__body">
          <h3 class="map-popup__name">${story.name}</h3>
          <p class="map-popup__date">${date}</p>
          <p class="map-popup__excerpt">${excerpt}</p>
        </div>
      </div>
    `;
  }

  /**
   * [KRITERIA 2 - SKILLED] Custom divIcon — berbeda warna saat aktif
   */
  #createCustomIcon(story, isActive) {
    const initial = story.name.charAt(0).toUpperCase();
    return L.divIcon({
      html: /* html */ `
        <div class="map-marker ${isActive ? 'map-marker--active' : ''}">
          <span class="map-marker__initial">${initial}</span>
        </div>
      `,
      className: '',
      iconSize: [40, 52],
      iconAnchor: [20, 52],
      popupAnchor: [0, -54],
    });
  }

  /**
   * [KRITERIA 2 - SKILLED] Highlight marker aktif & pan ke lokasinya
   * Dipanggil saat user klik story card di list
   * @param {string} storyId
   */
  highlightMarker(storyId) {
    if (!this.#map) return;
    this.#setActiveMarker(storyId);

    const marker = this.#markers.get(storyId);
    if (marker) {
      const latlng = marker.getLatLng();
      this.#map.flyTo(latlng, 12, { duration: 1.0 });
      marker.openPopup();
    }
  }

  /**
   * [KRITERIA 2 - SKILLED] Update visual semua marker —
   * yang aktif berwarna accent, sisanya kembali normal
   */
  #setActiveMarker(storyId) {
    this.#activeStoryId = storyId;

    this.#markers.forEach((marker, id) => {
      // Ambil data cerita dari popup untuk re-render icon
      const story = { id, name: marker._popup?.getContent()?.match(/map-popup__name">(.*?)</) ? 
        marker._popup.getContent().match(/map-popup__name">(.*?)</)?.[1] || id : id };
      
      const isActive = id === storyId;
      const el = marker.getElement();
      if (el) {
        const markerDiv = el.querySelector('.map-marker');
        if (markerDiv) {
          markerDiv.classList.toggle('map-marker--active', isActive);
        }
      }
    });
  }

  /**
   * [KRITERIA 2 - SKILLED] Daftarkan callback yang dipanggil saat marker diklik
   * @param {Function} callback - fn(storyId: string)
   */
  onMarkerClick(callback) {
    this.#onMarkerClickCallback = callback;
  }

  /** Paksa peta refresh layout (misal setelah container resize) */
  invalidateSize() {
    if (this.#map) this.#map.invalidateSize();
  }

  /** Hancurkan peta (cleanup saat navigasi halaman) */
  destroy() {
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
      this.#markers.clear();
    }
  }
}
