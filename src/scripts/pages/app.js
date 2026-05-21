// ============================================================
// [KRITERIA 1 - SPA + CUSTOM VIEW TRANSITION]
// App - Kelas utama yang mengorkestrasi SPA
// Mengelola drawer navigasi dan render halaman dengan View Transition
// ============================================================

import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
// [KRITERIA 1] Import helper custom view transition
import { navigateWithTransition } from '../utils/view-transition';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      // [AKSESIBILITAS] Update aria-expanded sesuai state drawer
      this.#drawerButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      // Tutup drawer saat link navigasi diklik
      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /**
   * [KRITERIA 1 - CUSTOM VIEW TRANSITION]
   * Render halaman aktif dibungkus dengan View Transitions API
   * untuk menghasilkan animasi slide yang mulus antar halaman
   */
  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    // Fallback jika rute tidak ditemukan — redirect ke beranda
    if (!page) {
      window.location.hash = '#/';
      return;
    }

    // [KRITERIA 1] Bungkus render dengan custom view transition
    await navigateWithTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    });

    // Set focus ke konten utama setelah navigasi (aksesibilitas)
    this.#content.focus();

    // [KRITERIA 1] Update tampilan navigasi aktif
    this.#updateActiveNavLink();
    
    // Perbarui navigasi Auth (Login/Register vs Logout)
    this.#updateAuthNav();
  }

  /**
   * [KRITERIA 1 - SPA] Tandai link navigasi yang sedang aktif
   * agar user tahu mereka sedang berada di halaman mana
   */
  #updateActiveNavLink() {
    const currentHash = window.location.hash || '#/';
    document.querySelectorAll('.nav-link').forEach((link) => {
      if (link.getAttribute('href') === currentHash) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Mengubah tampilan auth-nav bergantung pada status login
   */
  #updateAuthNav() {
    const authNav = document.getElementById('auth-nav');
    if (!authNav) return;

    const isLoggedIn = !!localStorage.getItem('authToken');

    if (isLoggedIn) {
      authNav.innerHTML = `
        <button type="button" class="btn-nav btn-nav--logout" id="nav-logout">Logout</button>
      `;

      document.getElementById('nav-logout').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.hash = '#/login';
        this.renderPage(); // Paksa render ulang agar header terupdate
      });
    } else {
      authNav.innerHTML = `
        <a href="#/login" class="btn-nav btn-nav--login" id="nav-login">Masuk</a>
        <a href="#/register" class="btn-nav btn-nav--register" id="nav-register">Daftar</a>
      `;
    }
  }
}

export default App;
