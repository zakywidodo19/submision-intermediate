// ============================================================
// [KRITERIA 1 - MVP: PRESENTER]
// RegisterPresenter - Jembatan antara RegisterModel dan RegisterPage (View)
// Bertanggung jawab: validasi form, logika registrasi, komunikasi Model ↔ View
// ============================================================

import RegisterModel from './register-model';

export default class RegisterPresenter {
  // [KRITERIA 1] Referensi ke View (RegisterPage)
  #view;

  /**
   * [KRITERIA 1 - MVP: PRESENTER] Constructor menerima referensi View
   * @param {RegisterPage} view - Instance dari RegisterPage
   */
  constructor(view) {
    this.#view = view;
  }

  /**
   * [KRITERIA 1] Setup semua event listener form registrasi
   */
  setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await this.#handleRegister(form);
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

    // Live validation: cek kesesuaian konfirmasi password
    const confirmInput = document.getElementById('confirm-password');
    if (confirmInput && passwordInput) {
      confirmInput.addEventListener('input', () => {
        if (confirmInput.value && confirmInput.value !== passwordInput.value) {
          this.#view.showFieldError('confirm-password', 'Password tidak sama');
        } else {
          this.#view.clearFieldError('confirm-password');
        }
      });
    }
  }

  /**
   * [KRITERIA 1] Menangani proses registrasi: validasi → panggil Model → update View
   */
  async #handleRegister(form) {
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirm-password').value;

    // Validasi input di sisi Presenter
    const validationError = this.#validateInputs(name, email, password, confirmPassword);
    if (validationError) {
      this.#view.showError(validationError);
      return;
    }

    try {
      this.#view.showLoading(true);
      this.#view.clearError();

      const response = await RegisterModel.register({ name, email, password });

      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      // Tampilkan pesan sukses & arahkan ke halaman login
      this.#view.showSuccess(`Akun berhasil dibuat! Silakan masuk, ${name} 🎉`);
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 1500);
    } catch (error) {
      console.error('[RegisterPresenter] Error saat registrasi:', error);
      this.#view.showError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      this.#view.showLoading(false);
    }
  }

  /** [KRITERIA 1] Validasi semua field form sebelum dikirim ke Model */
  #validateInputs(name, email, password, confirmPassword) {
    if (!name || name.length < 2) return 'Nama minimal 2 karakter.';
    if (!email) return 'Email tidak boleh kosong.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid.';
    if (!password) return 'Password tidak boleh kosong.';
    if (password.length < 8) return 'Password minimal 8 karakter.';
    if (password !== confirmPassword) return 'Konfirmasi password tidak cocok.';
    return null; // valid
  }
}
