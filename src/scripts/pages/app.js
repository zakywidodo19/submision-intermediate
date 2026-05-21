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
}

export default App;
