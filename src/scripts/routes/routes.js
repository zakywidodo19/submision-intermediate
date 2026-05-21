// ============================================================
// [KRITERIA 1 - SPA: HASH ROUTING]
// Definisi semua rute aplikasi
// ============================================================

import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
// [KRITERIA 3] Import halaman tambah cerita baru
import AddStoryPage from '../pages/add-story/add-story-page';
import FavoritePage from '../pages/favorite/favorite-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  // [KRITERIA 3] Route halaman form tambah cerita
  '/add-story': new AddStoryPage(),
  '/favorites': new FavoritePage(),
};

export default routes;
