// ============================================================
// [KRITERIA 1 - MVP: VIEW]
// LoginPage - Tampilan halaman login (View layer dalam MVP)
// Bertanggung jawab: render HTML form & expose metode untuk Presenter
// ============================================================

import LoginPresenter from './login-presenter';

export default class LoginPage {
  // [KRITERIA 1] Presenter disimpan sebagai private field
  #presenter = null;

  /**
   * [KRITERIA 1 - MVP: VIEW] Render template HTML form login
   * View hanya bertanggung jawab pada tampilan, bukan logika validasi/bisnis
   */
  async render() {
    return /* html */ `
      <!-- ======================================================
           [KRITERIA 1 - MVP: VIEW] Template Halaman Login
           ====================================================== -->
      <section class="auth-section" aria-labelledby="login-heading">
        <div class="auth-container">

          <div class="auth-brand">
            <a href="#/" class="brand-name auth-brand__logo" aria-label="Kembali ke beranda CeritaKita">
              <span aria-hidden="true">📖</span> CeritaKita
            </a>
          </div>

          <div class="auth-card">
            <div class="auth-card__header">
              <h1 id="login-heading" class="auth-title">Selamat Datang Kembali</h1>
              <p class="auth-subtitle">Masuk dan lanjutkan berbagi ceritamu</p>
            </div>

            <!-- Alert: Error -->
            <div
              id="login-alert"
              class="auth-alert"
              role="alert"
              aria-live="assertive"
              hidden
            ></div>

            <!-- Alert: Success -->
            <div
              id="login-success"
              class="auth-alert auth-alert--success"
              role="status"
              aria-live="polite"
              hidden
            ></div>

            <form id="login-form" class="auth-form" novalidate aria-label="Form masuk akun">
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
                  aria-describedby="email-hint"
                />
                <span id="email-hint" class="form-hint">Gunakan email yang terdaftar</span>
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
                    autocomplete="current-password"
                    required
                    aria-required="true"
                    minlength="8"
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    class="input-toggle-btn"
                    aria-label="Tampilkan password"
                  >
                    👁️
                  </button>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                id="login-submit"
                class="btn btn-primary btn-block"
              >
                <span id="login-btn-text">Masuk</span>
                <span id="login-btn-spinner" class="btn-spinner" hidden aria-hidden="true"></span>
              </button>
            </form>

            <div class="auth-footer">
              <p>
                Belum punya akun?
                <a href="#/register" class="auth-link" id="link-to-register">Daftar sekarang</a>
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
    this.#presenter = new LoginPresenter(this);
    this.#presenter.setupLoginForm();
  }

  // ============================================================
  // [KRITERIA 1 - MVP: VIEW] Metode antarmuka untuk Presenter
  // ============================================================

  /** Tampilkan/sembunyikan state loading pada tombol submit */
  showLoading(isLoading) {
    const submitBtn = document.getElementById('login-submit');
    const btnText = document.getElementById('login-btn-text');
    const btnSpinner = document.getElementById('login-btn-spinner');

    if (submitBtn) submitBtn.disabled = isLoading;
    if (btnText) btnText.textContent = isLoading ? 'Memproses...' : 'Masuk';
    if (btnSpinner) btnSpinner.hidden = !isLoading;
  }

  /** Tampilkan pesan error */
  showError(message) {
    const alertEl = document.getElementById('login-alert');
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.innerHTML = `<span aria-hidden="true">❌</span> ${message}`;
    }
  }

  /** Tampilkan pesan sukses */
  showSuccess(message) {
    const successEl = document.getElementById('login-success');
    const alertEl = document.getElementById('login-alert');
    if (alertEl) alertEl.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.innerHTML = `<span aria-hidden="true">✅</span> ${message}`;
    }
  }

  /** Bersihkan pesan error */
  clearError() {
    const alertEl = document.getElementById('login-alert');
    if (alertEl) {
      alertEl.hidden = true;
      alertEl.innerHTML = '';
    }
  }
}
