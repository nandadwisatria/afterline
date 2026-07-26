/* ============================================================
   AFTERLINE — Portfolio Video Data (Google Drive)
   ============================================================
   Cara pakai:
   1. Upload video ke Google Drive
   2. Klik kanan video → "Bagikan" → "Anyone with the link"
   3. Copy FILE ID dari link:
      https://drive.google.com/file/d/ {FILE_ID} /view
      Contoh: 1ABCxyz123DEF456
   4. Masukkan FILE ID ke dalam array di bawah
   5. (Opsional) Ganti thumbnail dengan URL gambar custom
   ============================================================ */

window.portfolioVideos = [
  {
    id: 1,
    title: 'Short Movie — Aksi Hijau',
    description:
      'Short movie pendek dengan tema aksi hijau yang mengangkat isu lingkungan dengan gaya sinematik dan storytelling yang kuat.',
    category: 'video',
    categoryLabel: 'Video Editing',
    // FILE ID Google Drive
    videoId: '1oO_KrZTmRivispwNyjVbgGPodXneyhsu',
    // Thumbnail sementara (akan diganti dengan screenshot video nanti)
    thumbnail:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Video Dokumentasi — Komnas',
    description:
      'Video dokumentasi kegiatan Komnas dengan editing profesional, mencakup wawancara, footage lapangan, dan narasi yang informatif.',
    category: 'video',
    categoryLabel: 'Video Editing',
    videoId: '1V9cCcULP59eOyVPByqZa16fEsemHjr7K',
    thumbnail:
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Video Racap Tugas Kuliah — Kunjungan Industri Mayora',
    description:
      'Video penjelasan dan dokumentasi kunjungan industri ke Mayora, mencakup proses produksi dan wawasan dunia industri.',
    category: 'video',
    categoryLabel: 'Video Editing',
    videoId: '14dh21OcBqppDIY6TCdPCBZE44oGIXIi2',
    thumbnail:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * Helper: Mendapatkan URL thumbnail dari Google Drive video
 * (thumbnail otomatis dari Google — resolusi kecil)
 */
function getGDriveThumbnail(videoId) {
  return `https://drive.google.com/thumbnail?id=${videoId}&sz=w800-h600`;
}

/**
 * Helper: Mendapatkan URL embed/preview dari Google Drive video
 * Bisa dipakai di <iframe> atau <video> source
 */
function getGDriveEmbedUrl(videoId) {
  return `https://drive.google.com/file/d/${videoId}/preview`;
}

/**
 * Helper: Mendapatkan direct download URL (untuk <video> tag)
 * Catatan: Tidak semua video bisa diputar langsung via <video>,
 * tergantung format dan size. Alternatif: pakai embed iframe.
 */
function getGDriveDirectUrl(videoId) {
  return `https://drive.google.com/uc?export=download&id=${videoId}`;
}
