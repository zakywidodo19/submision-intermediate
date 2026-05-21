// ============================================================
// [KRITERIA 3 - MVP: PRESENTER]
// AddStoryPresenter — logika bisnis halaman tambah cerita
// [KRITERIA 3 - BASIC]   Form submit + HTTP Request async
// [KRITERIA 3 - SKILLED] Validasi input + pesan error/sukses
// [KRITERIA 3 - ADVANCE] Kontrol kamera (media stream)
// ============================================================

import AddStoryModel from './add-story-model';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet icon di Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
});

export default class AddStoryPresenter {
  #view;

  // [KRITERIA 3 - BASIC] Data lokasi dari klik peta
  #selectedLat = null;
  #selectedLon = null;

  // [KRITERIA 3 - ADVANCE] Referensi media stream kamera
  #cameraStream = null;

  // Foto yang akan disubmit (dari file ATAU dari kamera)
  #selectedPhoto = null;

  // Leaflet map untuk pemilihan lokasi
  #map = null;
  #locationMarker = null;

  constructor(view) {
    this.#view = view;
  }

  /** Inisialisasi semua komponen form */
  init() {
    this.#setupLocationMap();
    this.#setupFileInput();
    this.#setupCameraControls();
    this.#setupFormSubmit();
  }

  // ============================================================
  // [KRITERIA 3 - BASIC] Peta untuk memilih lokasi dengan klik
  // ============================================================

  #setupLocationMap() {
    const mapEl = document.getElementById('location-map');
    if (!mapEl) return;

    // Inisialisasi peta — center Indonesia
    this.#map = L.map('location-map', {
      center: [-2.5, 118.0],
      zoom: 5,
    });

    // Tile layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);

    // [KRITERIA 3 - BASIC] Event klik peta → simpan lat/lon yang dipilih
    this.#map.on('click', (e) => {
      this.#selectedLat = e.latlng.lat;
      this.#selectedLon = e.latlng.lng;

      // Pindahkan / buat marker lokasi yang dipilih
      if (this.#locationMarker) {
        this.#locationMarker.setLatLng(e.latlng);
      } else {
        this.#locationMarker = L.marker(e.latlng).addTo(this.#map);
      }

      // Update tampilan koordinat di View
      this.#view.showSelectedLocation(
        this.#selectedLat.toFixed(6),
        this.#selectedLon.toFixed(6),
      );
    });
  }

  // ============================================================
  // [KRITERIA 3 - BASIC] Upload foto dari file
  // ============================================================

  #setupFileInput() {
    const fileInput = document.getElementById('photo-file');
    const previewImg = document.getElementById('photo-preview');
    if (!fileInput) return;

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;

      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        this.#view.showFieldError('photo', 'File harus berupa gambar (JPG, PNG, dll.)');
        return;
      }
      // Validasi ukuran file (maks 1MB sesuai API)
      if (file.size > 1024 * 1024) {
        this.#view.showFieldError('photo', 'Ukuran gambar maksimal 1MB.');
        return;
      }

      this.#view.clearFieldError('photo');
      this.#selectedPhoto = file;

      // Tampilkan preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (previewImg) {
          previewImg.src = e.target.result;
          previewImg.hidden = false;
        }
        // Jika kamera aktif, matikan dulu
        this.#stopCamera();
        this.#view.setActivePhotoSource('file');
      };
      reader.readAsDataURL(file);
    });
  }

  // ============================================================
  // [KRITERIA 3 - ADVANCE] Kamera: ambil gambar dari media stream
  // ============================================================

  #setupCameraControls() {
    const btnOpenCamera = document.getElementById('btn-open-camera');
    const btnCapture = document.getElementById('btn-capture');
    const btnCloseCamera = document.getElementById('btn-close-camera');

    btnOpenCamera?.addEventListener('click', () => this.#startCamera());
    btnCapture?.addEventListener('click', () => this.#capturePhoto());
    btnCloseCamera?.addEventListener('click', () => this.#stopCamera());
  }

  /**
   * [KRITERIA 3 - ADVANCE] Mulai stream kamera via getUserMedia
   */
  async #startCamera() {
    // Hentikan stream sebelumnya jika ada
    this.#stopCamera();

    try {
      // [KRITERIA 3 - ADVANCE] Akses kamera perangkat
      this.#cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      const videoEl = document.getElementById('camera-video');
      if (videoEl) {
        videoEl.srcObject = this.#cameraStream;
        await videoEl.play();
      }

      this.#view.showCameraUI(true);
      this.#view.clearFieldError('photo');
    } catch (error) {
      console.error('[KRITERIA 3 - ADVANCE] Gagal membuka kamera:', error);
      const msg = error.name === 'NotAllowedError'
        ? 'Akses kamera ditolak. Izinkan akses kamera di pengaturan browser.'
        : 'Kamera tidak tersedia di perangkat ini.';
      this.#view.showFieldError('photo', msg);
    }
  }

  /**
   * [KRITERIA 3 - ADVANCE] Ambil foto dari frame video ke canvas
   */
  #capturePhoto() {
    const videoEl = document.getElementById('camera-video');
    const canvasEl = document.getElementById('camera-canvas');
    const previewImg = document.getElementById('photo-preview');

    if (!videoEl || !canvasEl) return;

    // Gambar frame video ke canvas
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    canvasEl.getContext('2d').drawImage(videoEl, 0, 0);

    // Konversi canvas → Blob (sebagai File untuk dikirim ke API)
    canvasEl.toBlob(
      (blob) => {
        this.#selectedPhoto = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });

        // Tampilkan hasil foto di preview
        if (previewImg) {
          previewImg.src = canvasEl.toDataURL('image/jpeg');
          previewImg.hidden = false;
        }

        // [KRITERIA 3 - ADVANCE] Tutup stream kamera setelah foto diambil
        this.#stopCamera();
        this.#view.setActivePhotoSource('camera');
      },
      'image/jpeg',
      0.85,
    );
  }

  /**
   * [KRITERIA 3 - ADVANCE] Hentikan semua track media stream (wajib ditutup)
   */
  #stopCamera() {
    if (this.#cameraStream) {
      // [KRITERIA 3 - ADVANCE] Tutup setiap track kamera agar kamera tidak terus aktif
      this.#cameraStream.getTracks().forEach((track) => track.stop());
      this.#cameraStream = null;
    }

    const videoEl = document.getElementById('camera-video');
    if (videoEl) videoEl.srcObject = null;

    this.#view.showCameraUI(false);
  }

  // ============================================================
  // [KRITERIA 3 - SKILLED] Validasi form + submit ke API
  // ============================================================

  #setupFormSubmit() {
    const form = document.getElementById('add-story-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.#handleSubmit();
    });
  }

  async #handleSubmit() {
    const description = document.getElementById('description')?.value?.trim();

    // [KRITERIA 3 - SKILLED] Validasi semua field sebelum submit
    const validationError = this.#validate(description, this.#selectedPhoto);
    if (validationError) {
      this.#view.showError(validationError);
      return;
    }

    try {
      this.#view.showLoading(true);
      this.#view.clearError();

      // [KRITERIA 3 - BASIC] Kirim data ke API secara asynchronous
      const response = await AddStoryModel.submitStory({
        description,
        photo: this.#selectedPhoto,
        lat: this.#selectedLat,
        lon: this.#selectedLon,
      });

      if (response.error) {
        this.#view.showError(response.message || 'Gagal menambahkan cerita.');
        return;
      }

      // [KRITERIA 3 - SKILLED] Tampilkan pesan sukses yang jelas
      this.#view.showSuccess('Cerita berhasil ditambahkan! 🎉 Mengalihkan ke beranda...');

      // Pastikan kamera sudah ditutup
      this.#stopCamera();

      // Redirect ke beranda setelah 1.5 detik
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
    } catch (error) {
      console.error('[AddStoryPresenter] Error submit:', error);
      this.#view.showError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      this.#view.showLoading(false);
    }
  }

  /**
   * [KRITERIA 3 - SKILLED] Validasi input sebelum dikirim ke Model
   */
  #validate(description, photo) {
    if (!description || description.length < 10) {
      return 'Deskripsi cerita minimal 10 karakter.';
    }
    if (description.length > 1000) {
      return 'Deskripsi cerita maksimal 1000 karakter.';
    }
    if (!photo) {
      return 'Foto cerita wajib diisi (upload file atau ambil dari kamera).';
    }
    // Lokasi opsional — tidak wajib
    return null;
  }

  /** Cleanup saat meninggalkan halaman — pastikan kamera dimatikan */
  destroy() {
    this.#stopCamera();
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }
  }
}
