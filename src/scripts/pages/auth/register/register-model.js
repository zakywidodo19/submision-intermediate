// ============================================================
// [KRITERIA 2 - MVP: MODEL]
// RegisterModel — registrasi ke Story API Dicoding (real API)
// ============================================================

import { registerUser } from '../../../data/api';

export default class RegisterModel {
  /**
   * [KRITERIA 2] Registrasi via Story API — POST /register
   */
  static async register({ name, email, password }) {
    return registerUser({ name, email, password });
  }
}
