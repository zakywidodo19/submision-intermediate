// ============================================================
// [KRITERIA 1 - MVP: VIEW]
// RegisterPage - Tampilan halaman registrasi (View layer dalam MVP)
// Bertanggung jawab: render HTML form & expose metode untuk Presenter
// ============================================================

import RegisterPresenter from './register-presenter';

export default class RegisterPage {
  // [KRITERIA 1] Presenter disimpan sebagai private field
  #presenter = null;

  /**
   * [KRITERIA 1 - MVP: VIEW] Render template HTML form registrasi
   */
  async render() {
    return /* html */ `
      <!-- ======================================================
           [KRITERIA 1 - MVP: VIEW] Template Halaman Register
           ====================================================== -->
      <section class="auth-section" aria-labelledby="register-heading">
        <div class="auth-container">

          <div class="auth-brand">
            <a href="#/" class="brand-name auth-brand__logo" aria-label="Kembali ke beranda CeritaKita">
              <span aria-hidden="true">📖</span> CeritaKita
            </a>
          </div>

          <div class="auth-card">
            <div class="auth-card__header">
              <h1 id="register-heading" class="auth-title">Bergabung dengan Kami</h1>
              <p class="auth-subtitle">Buat akun gratis dan mulai berbagi ceritamu</p>
            </div>

            <!-- Alert: Error -->
            <div
              id="register-alert"
              class="auth-alert"
              role="alert"
              aria-live="assertive"
              hidden
            ></div>

            <!-- Alert: Success -->
            <div
              id="register-success"
              class="auth-alert auth-alert--success"
              role="status"
              aria-live="polite"
              hidden
            ></div>

            <form id="register-form" class="auth-form" novalidate aria-label="Form pendaftaran akun">

              <!-- Name Field -->
              <div class="form-group">
                <label for="name" class="form-label">
                  Nama Lengkap <span class="form-required" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  class="form-input"
                  placeholder="Masukkan nama lengkap Anda"
                  autocomplete="name"
                  required
                  aria-required="true"
                  minlength="2"
                />
              </div>

              <!-- Email Field -->
              <div class="form-group">
                <label for="email" class="form-label">
                  Alamat Email <span class="form-required" aria-hidden="true">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  class="form-input"
                  placeholder="nama@email.com"
                  autocomplete="email"
                  required
                  aria-required="true"
                />
              </div>

              <!-- Password Field -->
              <div class="form-group">
                <label for="password" class="form-label">
                  Password <span class="form-required" aria-hidden="true">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    class="form-input"
                    placeholder="Minimal 8 karakter"
                    autocomplete="new-password"
                    required
                    aria-required="true"
                    minlength="8"
                    aria-describedby="password-hint"
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    class="input-toggle-btn"
                    aria-label="Tampilkan password"
                  >👁️</button>
                </div>
                <span id="password-hint" class="form-hint">Gunakan minimal 8 karakter</span>
              </div>

              <!-- Confirm Password Field -->
              <div class="form-group">
                <label for="confirm-password" class="form-label">
                  Konfirmasi Password <span class="form-required" aria-hidden="true">*</span>
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  class="form-input"
                  placeholder="Ulangi password Anda"
                  autocomplete="new-password"
                  required
                  aria-required="true"
                  aria-describedby="confirm-password-error"
                />
                <span id="confirm-password-error" class="form-field-error" hidden role="alert"></span>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                id="register-submit"
                class="btn btn-primary btn-block"
              >
                <span id="register-btn-text">Buat Akun</span>
                <span id="register-btn-spinner" class="btn-spinner" hidden aria-hidden="true"></span>
              </button>
            </form>

            <div class="auth-footer">
              <p>
                Sudah punya akun?
                <a href="#/login" class="auth-link" id="link-to-login">Masuk di sini</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * [KRITERIA 1 - MVP: VIEW] Inisialisasi Presenter setelah render ke DOM
   */
  async afterRender() {
    // [KRITERIA 1 - MVP] View membuat Presenter & mengoper referensi dirinya sendiri
    this.#presenter = new RegisterPresenter(this);
    this.#presenter.setupRegisterForm();
  }

  // ============================================================
  // [KRITERIA 1 - MVP: VIEW] Metode antarmuka untuk Presenter
  // ============================================================

  /** Tampilkan/sembunyikan state loading pada tombol submit */
  showLoading(isLoading) {
    const submitBtn = document.getElementById('register-submit');
    const btnText = document.getElementById('register-btn-text');
    const btnSpinner = document.getElementById('register-btn-spinner');

    if (submitBtn) submitBtn.disabled = isLoading;
    if (btnText) btnText.textContent = isLoading ? 'Memproses...' : 'Buat Akun';
    if (btnSpinner) btnSpinner.hidden = !isLoading;
  }

  /** Tampilkan pesan error global */
  showError(message) {
    const alertEl = document.getElementById('register-alert');
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.innerHTML = `<span aria-hidden="true">❌</span> ${message}`;
    }
  }

  /** Tampilkan pesan sukses */
  showSuccess(message) {
    const successEl = document.getElementById('register-success');
    const alertEl = document.getElementById('register-alert');
    if (alertEl) alertEl.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.innerHTML = `<span aria-hidden="true">✅</span> ${message}`;
    }
  }

  /** Bersihkan pesan error global */
  clearError() {
    const alertEl = document.getElementById('register-alert');
    if (alertEl) {
      alertEl.hidden = true;
      alertEl.innerHTML = '';
    }
  }

  /** Tampilkan error pada field spesifik */
  showFieldError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = message;
    }
    if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
  }

  /** Bersihkan error pada field spesifik */
  clearFieldError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
    if (inputEl) inputEl.removeAttribute('aria-invalid');
  }
}
