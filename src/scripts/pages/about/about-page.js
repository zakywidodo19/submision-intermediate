// ============================================================
// [KRITERIA 1 - MVP: VIEW]
// AboutPage - Tampilan halaman tentang (View layer dalam MVP)
// ============================================================

export default class AboutPage {
  /**
   * [KRITERIA 1 - MVP: VIEW] Render template HTML halaman About
   */
  async render() {
    return /* html */ `
      <!-- ======================================================
           [KRITERIA 1 - MVP: VIEW] Template Halaman About
           ====================================================== -->
      <section class="about-section" aria-labelledby="about-heading">
        <div class="container">

          <div class="about-hero">
            <span class="about-icon" aria-hidden="true">📖</span>
            <h1 id="about-heading" class="about-title">Tentang CeritaKita</h1>
            <p class="about-lead">
              Platform berbagi cerita untuk seluruh masyarakat Indonesia —
              dari Sabang sampai Merauke.
            </p>
          </div>

          <div class="about-grid">
            <div class="about-card">
              <span class="about-card__icon" aria-hidden="true">🎯</span>
              <h2 class="about-card__title">Misi Kami</h2>
              <p class="about-card__text">
                Menghubungkan masyarakat Indonesia melalui cerita yang autentik,
                inspiratif, dan bermakna. Kami percaya setiap orang punya kisah
                yang layak untuk dibagikan.
              </p>
            </div>

            <div class="about-card">
              <span class="about-card__icon" aria-hidden="true">🌟</span>
              <h2 class="about-card__title">Visi Kami</h2>
              <p class="about-card__text">
                Menjadi platform cerita digital terbesar di Asia Tenggara yang
                merayakan keberagaman budaya dan pengalaman manusia dari seluruh
                penjuru Nusantara.
              </p>
            </div>

            <div class="about-card">
              <span class="about-card__icon" aria-hidden="true">🛠️</span>
              <h2 class="about-card__title">Teknologi</h2>
              <p class="about-card__text">
                Dibangun dengan standar web modern: Single Page Application (SPA),
                View Transitions API untuk navigasi mulus, aksesibilitas WCAG,
                dan dukungan GPS untuk cerita berbasis lokasi.
              </p>
            </div>

            <div class="about-card">
              <span class="about-card__icon" aria-hidden="true">🤝</span>
              <h2 class="about-card__title">Komunitas</h2>
              <p class="about-card__text">
                Bergabunglah bersama lebih dari 50.000 pencerita aktif yang
                setiap harinya berbagi pengalaman perjalanan, kuliner, budaya,
                dan momen kehidupan yang tak terlupakan.
              </p>
            </div>
          </div>

          <div class="about-cta">
            <h2 class="about-cta__title">Siap Berbagi Ceritamu?</h2>
            <p class="about-cta__text">Bergabung gratis dan mulai perjalanan ceritamu hari ini.</p>
            <div class="about-cta__actions">
              <a href="#/register" class="btn btn-primary" id="about-cta-register">Daftar Gratis</a>
              <a href="#/" class="btn btn-outline" id="about-cta-home">Jelajahi Cerita</a>
            </div>
          </div>

        </div>
      </section>
    `;
  }

  async afterRender() {
    // Tidak ada logika tambahan untuk halaman statis ini
  }
}
