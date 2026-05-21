// ============================================================
// [KRITERIA 2 - MVP: MODEL]
// LoginModel — autentikasi ke Story API Dicoding (real API)
// ============================================================

import { loginUser } from '../../../data/api';

export default class LoginModel {
  /**
   * [KRITERIA 2] Login via Story API — POST /login
   */
  static async login({ email, password }) {
    return loginUser({ email, password });
  }
}
