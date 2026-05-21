// ============================================================
// [KRITERIA 3 - MVP: MODEL]
// AddStoryModel — mengirim data cerita baru ke Story API
// [KRITERIA 3 - BASIC] HTTP Request async via Fetch API
// ============================================================

import { addStory } from '../../data/api';

export default class AddStoryModel {
  /**
   * [KRITERIA 3 - BASIC] Kirim cerita baru ke API via FormData (multipart)
   * Endpoint: POST /stories
   * @param {Object} params
   * @param {string} params.description - Isi cerita
   * @param {File|Blob} params.photo - File foto cerita
   * @param {number|null} params.lat - Latitude dari klik peta
   * @param {number|null} params.lon - Longitude dari klik peta
   */
  static async submitStory({ description, photo, lat, lon }) {
    // [KRITERIA 3 - BASIC] Kirim asynchronous ke API menggunakan Fetch
    return addStory({ description, photo, lat, lon });
  }
}
