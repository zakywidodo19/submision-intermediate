// ============================================================
// [KRITERIA BASIC & SKILLED]
// FavoritePage — Halaman untuk menampilkan daftar cerita favorit
// Menyediakan fitur interaktivitas: Pencarian (searching),
// Pengurutan (sorting), dan Filter.
// ============================================================

import FavoriteStoryIdb from '../../data/favorite-story-idb';
import { showFormattedDate } from '../../utils/index';

export default class FavoritePage {
  #stories = [];
  #filteredStories = [];
  
  async render() {
    return /* html */ `
      <section class="stories-section" aria-labelledby="favorite-heading">
        <div class="container">
          <div class="stories-header">
            <div>
              <h2 id="favorite-heading" class="section-title">Cerita Favorit Saya</h2>
              <p class="section-subtitle">Daftar cerita perjalanan yang telah Anda simpan</p>
            </div>
          </div>

          <!-- [KRITERIA SKILLED] Interaktivitas: Search dan Sort -->
          <div class="filter-controls" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px;">
              <input 
                type="text" 
                id="search-favorite" 
                class="form-input" 
                placeholder="Cari berdasarkan nama atau deskripsi..." 
                aria-label="Cari cerita favorit"
              />
            </div>
            <div>
              <select id="sort-favorite" class="form-input" aria-label="Urutkan cerita favorit">
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="a-z">Nama (A-Z)</option>
                <option value="z-a">Nama (Z-A)</option>
              </select>
            </div>
          </div>

          <div id="favorites-list" class="stories-grid" aria-label="Daftar cerita favorit">
            <!-- Cerita akan di-render di sini -->
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.#loadFavorites();
    this.#setupInteractivity();
  }

  async #loadFavorites() {
    const listEl = document.getElementById('favorites-list');
    listEl.innerHTML = '<p>Memuat cerita favorit...</p>';

    try {
      this.#stories = await FavoriteStoryIdb.getAllStories();
      this.#filteredStories = [...this.#stories];
      
      // Default sort (newest)
      this.#sortStories('newest');
      this.#renderStories();
    } catch (error) {
      console.error('Failed to load favorites', error);
      listEl.innerHTML = '<p class="error-text">Gagal memuat daftar favorit.</p>';
    }
  }

  #setupInteractivity() {
    const searchInput = document.getElementById('search-favorite');
    const sortSelect = document.getElementById('sort-favorite');

    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      this.#filterStories(query);
      const currentSort = sortSelect.value;
      this.#sortStories(currentSort);
      this.#renderStories();
    });

    sortSelect?.addEventListener('change', (e) => {
      this.#sortStories(e.target.value);
      this.#renderStories();
    });
  }

  #filterStories(query) {
    if (!query) {
      this.#filteredStories = [...this.#stories];
      return;
    }
    
    this.#filteredStories = this.#stories.filter(story => {
      return story.name.toLowerCase().includes(query) || 
             story.description.toLowerCase().includes(query);
    });
  }

  #sortStories(sortBy) {
    this.#filteredStories.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'a-z') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'z-a') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });
  }

  #renderStories() {
    const listEl = document.getElementById('favorites-list');
    
    if (this.#filteredStories.length === 0) {
      listEl.innerHTML = /* html */ `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <span class="empty-icon" aria-hidden="true">📭</span>
          <p>Tidak ada cerita favorit yang sesuai.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.#filteredStories.map(story => this.#createStoryCard(story)).join('');

    // Tambahkan event listener untuk tombol hapus dari favorit
    listEl.querySelectorAll('.btn-remove-favorite').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const storyId = btn.dataset.id;
        await FavoriteStoryIdb.deleteStory(storyId);
        // Hapus dari data internal dan re-render
        this.#stories = this.#stories.filter(s => s.id !== storyId);
        this.#filteredStories = this.#filteredStories.filter(s => s.id !== storyId);
        this.#renderStories();
      });
    });
  }

  #createStoryCard(story) {
    const date = showFormattedDate(story.createdAt, 'id-ID');
    const excerpt = story.description.length > 100
      ? story.description.substring(0, 100) + '...'
      : story.description;

    return /* html */ `
      <article class="story-item" tabindex="0">
        <img src="${story.photoUrl}" alt="Foto dari ${story.name}" class="story-item__img" loading="lazy" />
        <div class="story-item__body">
          <div class="story-item__author">
            <span class="author-avatar-sm" aria-hidden="true">${story.name.charAt(0)}</span>
            <strong>${story.name}</strong>
          </div>
          <time class="story-item__date" datetime="${story.createdAt}">${date}</time>
          <p class="story-item__excerpt">${excerpt}</p>
          <div style="margin-top: 12px; z-index: 10; display: flex; justify-content: flex-end;">
            <button class="btn btn-outline btn-sm btn-remove-favorite" data-id="${story.id}" aria-label="Hapus dari favorit">
              Hapus Favorit 💔
            </button>
          </div>
        </div>
      </article>
    `;
  }
}
