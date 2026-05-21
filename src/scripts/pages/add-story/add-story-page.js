// ============================================================
// [KRITERIA 3 - MVP: VIEW]
// AddStoryPage — Tampilan halaman tambah cerita baru
// [KRITERIA 3 - BASIC]   Form + upload foto + peta klik lokasi
// [KRITERIA 3 - SKILLED] Validasi + pesan error/sukses
// [KRITERIA 3 - ADVANCE] Opsi kamera (media stream)
// ============================================================

import AddStoryPresenter from './add-story-presenter';

export default class AddStoryPage {
  #presenter = null;

  async render() {
    return /* html */ `
      <!-- ======================================================
           [KRITERIA 3 - MVP: VIEW] Template Halaman Tambah Cerita
           ====================================================== -->
      <section class="add-story-section" aria-labelledby="add-story-heading">
        <div class="container">

          <div class="add-story-header">
            <div>
              <h1 id="add-story-heading" class="add-story-title">✍️ Tulis Cerita Baru</h1>
              <p class="add-story-subtitle">Bagikan pengalaman dan momenmu dengan komunitas CeritaKita</p>
            </div>
            <a href="#/" class="btn btn-outline btn-sm" id="btn-back-home">← Kembali</a>
          </div>

          <!-- Alert: Error global -->
          <div id="add-story-alert" class="auth-alert form-alert" role="alert" aria-live="assertive" hidden></div>

          <!-- Alert: Sukses -->
          <div id="add-story-success" class="auth-alert auth-alert--success form-alert" role="status" aria-live="polite" hidden></div>

          <form id="add-story-form" class="add-story-form" novalidate aria-label="Form tambah cerita baru">
            <div class="add-story-layout">

              <!-- ===== Kolom Kiri: Form Input ===== -->
              <div class="add-story-inputs">

                <!-- [KRITERIA 3 - BASIC] Field deskripsi cerita -->
                <div class="form-group">
                  <label for="description" class="form-label">
                    Cerita Anda <span class="form-required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    class="form-input form-textarea"
                    placeholder="Tuliskan pengalaman menarik yang ingin Anda bagikan... (minimal 10 karakter)"
                    rows="6"
                    required
                    aria-required="true"
                    aria-describedby="description-count"
                    maxlength="1000"
                  ></textarea>
                  <div class="textarea-footer">
                    <span id="description-count" class="form-hint">0 / 1000 karakter</span>
                  </div>
                </div>

                <!-- ======================================================
                     [KRITERIA 3 - BASIC & ADVANCE] Foto: Upload atau Kamera
                     ====================================================== -->
                <div class="form-group">
                  <label class="form-label">
                    Foto Cerita <span class="form-required" aria-hidden="true">*</span>
                  </label>

                  <!-- Tab pilihan sumber foto -->
                  <div class="photo-source-tabs" role="tablist" aria-label="Pilih sumber foto">
                    <button
                      type="button"
                      id="tab-file"
                      class="photo-tab photo-tab--active"
                      role="tab"
                      aria-selected="true"
                      aria-controls="panel-file"
                    >📁 Upload File</button>
                    <button
                      type="button"
                      id="tab-camera"
                      class="photo-tab"
                      role="tab"
                      aria-selected="false"
                      aria-controls="panel-camera"
                    >📷 Kamera</button>
                  </div>

                  <!-- Panel: Upload File -->
                  <div id="panel-file" class="photo-panel" role="tabpanel" aria-labelledby="tab-file">
                    <label for="photo-file" class="file-drop-zone" id="file-drop-label">
                      <span class="file-drop-icon" aria-hidden="true">📸</span>
                      <span class="file-drop-text">Klik untuk pilih foto</span>
                      <span class="file-drop-hint">JPG, PNG, WebP — Maksimal 1MB</span>
                      <input
                        type="file"
                        id="photo-file"
                        name="photo"
                        accept="image/*"
                        class="file-input-hidden"
                        aria-label="Upload foto cerita"
                      />
                    </label>
                  </div>

                  <!-- [KRITERIA 3 - ADVANCE] Panel: Kamera -->
                  <div id="panel-camera" class="photo-panel" role="tabpanel" aria-labelledby="tab-camera" hidden>
                    <div class="camera-container">
                      <video
                        id="camera-video"
                        class="camera-video"
                        autoplay
                        playsinline
                        muted
                        aria-label="Live preview kamera"
                        hidden
                      ></video>
                      <!-- Canvas tersembunyi untuk capture frame -->
                      <canvas id="camera-canvas" class="camera-canvas" hidden aria-hidden="true"></canvas>

                      <div class="camera-controls">
                        <button
                          type="button"
                          id="btn-open-camera"
                          class="btn btn-outline"
                          aria-label="Buka kamera perangkat"
                        >
                          📷 Buka Kamera
                        </button>
                        <button
                          type="button"
                          id="btn-capture"
                          class="btn btn-primary"
                          hidden
                          aria-label="Ambil foto dari kamera"
                        >
                          ⭕ Ambil Foto
                        </button>
                        <button
                          type="button"
                          id="btn-close-camera"
                          class="btn btn-outline"
                          hidden
                          aria-label="Tutup kamera"
                        >
                          ✕ Tutup Kamera
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Preview foto (dari file atau kamera) -->
                  <div class="photo-preview-wrapper" id="photo-preview-wrapper" hidden>
                    <p class="photo-preview-label">Preview:</p>
                    <img id="photo-preview" class="photo-preview-img" src="" alt="Preview foto cerita" hidden />
                    <span id="photo-source-badge" class="photo-source-badge"></span>
                  </div>

                  <!-- Error field foto -->
                  <span id="photo-error" class="form-field-error" hidden role="alert"></span>
                </div>

                <!-- Tombol Submit -->
                <button
                  type="submit"
                  id="btn-submit-story"
                  class="btn btn-primary btn-block"
                >
                  <span id="submit-btn-text">Bagikan Cerita</span>
                  <span id="submit-btn-spinner" class="btn-spinner" hidden aria-hidden="true"></span>
                </button>

              </div>

              <!-- ===== Kolom Kanan: Peta Pilih Lokasi ===== -->
              <div class="add-story-map-col">
                <div class="form-group">
                  <label class="form-label">
                    Lokasi <span class="form-hint-inline">(Opsional — klik peta untuk memilih)</span>
                  </label>

                  <!-- [KRITERIA 3 - BASIC] Peta interaktif untuk memilih lat/lon -->
                  <div id="location-map" class="location-map" role="application" aria-label="Peta pilih lokasi cerita"></div>

                  <!-- Koordinat yang dipilih -->
                  <div id="selected-location" class="selected-location" hidden>
                    <span aria-hidden="true">📍</span>
                    <span id="location-text">Belum dipilih</span>
                  </div>
                  <p class="form-hint">Klik di mana saja pada peta untuk menandai lokasi cerita Anda.</p>
                </div>
              </div>

            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Pastikan user sudah login
    if (!localStorage.getItem('authToken')) {
      window.location.hash = '#/login';
      return;
    }

    // [KRITERIA 3 - MVP] Buat presenter dan inisialisasi komponen
    this.#presenter = new AddStoryPresenter(this);
    this.#presenter.init();

    // Setup karakter counter textarea
    this.#setupCharCounter();

    // Setup tab foto (file vs kamera)
    this.#setupPhotoTabs();
  }

  // ============================================================
  // [KRITERIA 3 - MVP: VIEW] Metode antarmuka untuk Presenter
  // ============================================================

  /** [KRITERIA 3 - SKILLED] Tampilkan loading state saat submit */
  showLoading(isLoading) {
    const btn = document.getElementById('btn-submit-story');
    const text = document.getElementById('submit-btn-text');
    const spinner = document.getElementById('submit-btn-spinner');
    if (btn) btn.disabled = isLoading;
    if (text) text.textContent = isLoading ? 'Mengirim...' : 'Bagikan Cerita';
    if (spinner) spinner.hidden = !isLoading;
  }

  /** [KRITERIA 3 - SKILLED] Tampilkan pesan error global */
  showError(message) {
    const el = document.getElementById('add-story-alert');
    if (el) {
      el.hidden = false;
      el.innerHTML = `<span aria-hidden="true">❌</span> ${message}`;
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /** [KRITERIA 3 - SKILLED] Tampilkan pesan sukses */
  showSuccess(message) {
    document.getElementById('add-story-alert').hidden = true;
    const el = document.getElementById('add-story-success');
    if (el) {
      el.hidden = false;
      el.innerHTML = `<span aria-hidden="true">✅</span> ${message}`;
    }
  }

  /** Bersihkan pesan error global */
  clearError() {
    const el = document.getElementById('add-story-alert');
    if (el) { el.hidden = true; el.innerHTML = ''; }
  }

  /** [KRITERIA 3 - SKILLED] Tampilkan error pada field spesifik */
  showFieldError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (errorEl) { errorEl.hidden = false; errorEl.textContent = message; }
  }

  clearFieldError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }
  }

  /** [KRITERIA 3 - BASIC] Tampilkan koordinat lokasi yang dipilih di peta */
  showSelectedLocation(lat, lon) {
    const wrapper = document.getElementById('selected-location');
    const text = document.getElementById('location-text');
    if (wrapper) wrapper.hidden = false;
    if (text) text.textContent = `${lat}, ${lon}`;
  }

  /** [KRITERIA 3 - ADVANCE] Tampilkan/sembunyikan UI kamera */
  showCameraUI(isActive) {
    const videoEl = document.getElementById('camera-video');
    const btnCapture = document.getElementById('btn-capture');
    const btnClose = document.getElementById('btn-close-camera');
    const btnOpen = document.getElementById('btn-open-camera');

    if (videoEl) videoEl.hidden = !isActive;
    if (btnCapture) btnCapture.hidden = !isActive;
    if (btnClose) btnClose.hidden = !isActive;
    if (btnOpen) btnOpen.hidden = isActive;
  }

  /** Update badge sumber foto (file atau kamera) */
  setActivePhotoSource(source) {
    const wrapper = document.getElementById('photo-preview-wrapper');
    const badge = document.getElementById('photo-source-badge');
    const preview = document.getElementById('photo-preview');
    if (wrapper) wrapper.hidden = false;
    if (preview) preview.hidden = false;
    if (badge) {
      badge.textContent = source === 'camera' ? '📷 Dari Kamera' : '📁 Dari File';
      badge.className = `photo-source-badge photo-source-badge--${source}`;
    }
  }

  // ============================================================
  // Internal View helpers
  // ============================================================

  #setupCharCounter() {
    const textarea = document.getElementById('description');
    const counter = document.getElementById('description-count');
    if (!textarea || !counter) return;

    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / 1000 karakter`;
      counter.style.color = len > 900 ? 'var(--clr-error)' : '';
    });
  }

  #setupPhotoTabs() {
    const tabFile = document.getElementById('tab-file');
    const tabCamera = document.getElementById('tab-camera');
    const panelFile = document.getElementById('panel-file');
    const panelCamera = document.getElementById('panel-camera');

    tabFile?.addEventListener('click', () => {
      tabFile.classList.add('photo-tab--active');
      tabFile.setAttribute('aria-selected', 'true');
      tabCamera.classList.remove('photo-tab--active');
      tabCamera.setAttribute('aria-selected', 'false');
      panelFile.hidden = false;
      panelCamera.hidden = true;
    });

    tabCamera?.addEventListener('click', () => {
      tabCamera.classList.add('photo-tab--active');
      tabCamera.setAttribute('aria-selected', 'true');
      tabFile.classList.remove('photo-tab--active');
      tabFile.setAttribute('aria-selected', 'false');
      panelCamera.hidden = false;
      panelFile.hidden = true;
    });
  }
}
