// ============================================================
// [KRITERIA 1 - MVP: PRESENTER]
// LoginPresenter - Jembatan antara LoginModel dan LoginPage (View)
// Bertanggung jawab: validasi form, logika login, komunikasi Model ↔ View
// ============================================================

import LoginModel from './login-model';

export default class LoginPresenter {
  // [KRITERIA 1] Referensi ke View (LoginPage)
  #view;

  /**
   * [KRITERIA 1 - MVP: PRESENTER] Constructor menerima referensi View
   * @param {LoginPage} view - Instance dari LoginPage
   */
  constructor(view) {
    this.#view = view;
  }

  /**
   * [KRITERIA 1] Setup event listener form login — Presenter yang menangani logika,
   * bukan View
   */
  setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await this.#handleLogin(form);
    });

    // Toggle visibility password
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        toggleBtn.textContent = isHidden ? '🙈' : '👁️';
        toggleBtn.setAttribute('aria-label', isHidden ? 'Sembunyikan password' : 'Tampilkan password');
      });
    }
  }

  /**
   * [KRITERIA 1] Menangani proses login: validasi → panggil Model → update View
   */
  async #handleLogin(form) {
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;

    // Validasi input di sisi Presenter
    const validationError = this.#validateInputs(email, password);
    if (validationError) {
      this.#view.showError(validationError);
      return;
    }

    try {
      this.#view.showLoading(true);
      this.#view.clearError();

      const response = await LoginModel.login({ email, password });

      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      // Simpan token ke localStorage
      localStorage.setItem('authToken', response.loginResult.token);
      localStorage.setItem('userName', response.loginResult.name);

      // Navigasi ke beranda setelah login berhasil
      this.#view.showSuccess(`Selamat datang kembali, ${response.loginResult.name}! 👋`);
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1200);
    } catch (error) {
      console.error('[LoginPresenter] Error saat login:', error);
      this.#view.showError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      this.#view.showLoading(false);
    }
  }

  /** [KRITERIA 1] Validasi input form sebelum dikirim ke Model */
  #validateInputs(email, password) {
    if (!email) return 'Email tidak boleh kosong.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid.';
    if (!password) return 'Password tidak boleh kosong.';
    if (password.length < 8) return 'Password minimal 8 karakter.';
    return null; // valid
  }
}
