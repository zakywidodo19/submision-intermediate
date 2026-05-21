// ============================================================
// [KRITERIA 1 - CUSTOM VIEW TRANSITION]
// Helper navigasi halaman menggunakan View Transitions API
// Fallback tersedia untuk browser yang belum mendukung API ini
// ============================================================

/**
 * [KRITERIA 1] Menjalankan callback dengan View Transition jika browser mendukung.
 * Custom animasi slide didefinisikan di CSS (::view-transition-old/new).
 *
 * @param {Function} updateCallback - Fungsi async yang memperbarui konten DOM
 * @returns {Promise<void>}
 */
export async function navigateWithTransition(updateCallback) {
  // [KRITERIA 1] Cek dukungan View Transitions API di browser
  if (!document.startViewTransition) {
    // Fallback: langsung render tanpa animasi transisi
    console.info('[ViewTransition] API tidak didukung browser ini, fallback tanpa animasi.');
    await updateCallback();
    return;
  }

  // [KRITERIA 1] Jalankan View Transition dengan custom animation dari styles.css
  const transition = document.startViewTransition(async () => {
    await updateCallback();
  });

  // Tunggu sampai transisi selesai sepenuhnya
  try {
    await transition.finished;
  } catch (error) {
    // Transisi bisa di-interrupt jika user navigasi sangat cepat — ini normal
    console.warn('[ViewTransition] Transisi di-interrupt:', error.message);
  }
}
