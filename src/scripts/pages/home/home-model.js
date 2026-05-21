// ============================================================
// [KRITERIA 2 - MVP: MODEL]
// HomeModel — mengambil data cerita dari Story API Dicoding
// [KRITERIA 2] Sumber data wajib dari API (bukan mock)
// ============================================================

import { getStories } from '../../data/api';

export default class HomeModel {
  /**
   * [KRITERIA 2] Ambil cerita dari Story API dengan data lokasi (lat/lon)
   * Endpoint: GET /stories?location=1
   * @returns {Promise<{error: boolean, message: string, listStory: Array}>}
   */
  static async getStoriesWithLocation() {
    // [KRITERIA 2] Fetch dari API nyata — location=1 agar dapat data lat/lon untuk peta
    return getStories({ size: 20, location: 1 });
  }

  /**
   * Ambil semua cerita (dengan & tanpa lokasi) untuk daftar
   * @returns {Promise<{error: boolean, message: string, listStory: Array}>}
   */
  static async getAllStories() {
    return getStories({ size: 20, location: 0 });
  }
}
