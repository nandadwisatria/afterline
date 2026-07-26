# TODO - Fitur Hubungi Kami (WhatsApp Integration)

## Steps:

- [x] 0. Analisis kode existing (index.html, style.css, script.js)
- [x] 1. Rencana edit disetujui
- [x] 2. Tambah elemen HTML untuk animasi pesawat & toast notifikasi di index.html
- [x] 3. Tambah CSS untuk pesawat terbang & toast notifikasi di style.css
- [x] 4. Update script.js: form submit → kirim ke WhatsApp + animasi + toast
- [x] 5. Selesai — semua file telah diupdate

## ✅ Update Blog Modal:

### Masalah:

- Bagian Blog (section `#blog`) belum terisi — link "Baca Selengkapnya" masih `#`
- Tidak punya halaman/blog terpisah karena ribet hosting

### Solusi:

- ✅ **Blog Modal** — seperti Portfolio Modal, artikel dibaca di popup tanpa pindah halaman
- ✅ **Data artikel** disimpan langsung di JavaScript (array `blogArticles`) — tidak perlu database/server
- ✅ 3 artikel dengan konten lengkap: tips website, branding, data scraping
- ✅ Format konten rich: heading, paragraf, bullet list, blockquote, highlight box
- ✅ Styling khusus untuk blog modal: `blog-quote`, `blog-highlight`, list styling
- ✅ Dark mode support
- ✅ Tanggal artikel ditampilkan dengan icon calendar

### File yang Diubah:

1. **index.html** — menambahkan Blog Modal (struktur HTML)
2. **style.css** — styling blog modal, quote, highlight, list, dark mode
3. **script.js** — data 3 artikel + handler click + render konten

### Validasi Form Kontak:

- ✅ **Email** — wajib diisi, format harus valid (`nama@email.com`), jika salah muncul pesan merah di bawah field + border merah
- ✅ **Nomor Telepon** — optional, tapi jika diisi format harus nomor HP Indonesia (08xx / +62xx), salah ada peringatan
- ✅ **Nama Lengkap** — wajib diisi
- ✅ **Layanan** — wajib dipilih
- ✅ **Pesan** — wajib diisi
- ✅ Animasi fadeInUp pada pesan error

### Newsletter (Footer):

- ✅ **Input email** — kirim email ke Telegram bot (sama dengan form kontak)
- ✅ **Validasi format email** — jika salah/kosong muncul pesan merah di bawah
- ✅ **Sukses** — pesan hijau "✅ Email berhasil didaftarkan!"
- ✅ **Loading spinner** saat proses

## ⚠️ PENTING SEBELUM TEST:

1. Buka https://t.me/AfterlineBot → klik **START** (cukup sekali)
2. Buka `index.html` di browser
3. Coba isi form kontak / newsletter

## Ringkasan Perubahan:

### index.html

- Button submit diberi `id="sendMessageBtn"` dan icon plane diberi `id="planeIcon"`
- Ditambahkan elemen `.paper-plane-wrapper` berisi:
  - `.paper-plane` — icon pesawat kertas untuk animasi
  - `.plane-trail` — jejak garis di belakang pesawat
- Ditambahkan elemen `.success-toast` — notifikasi sukses glassmorphism dengan:
  - Icon centang hijau
  - Teks "Pesan Berhasil Terkirim! ✓"
  - Deskripsi singkat
  - Tombol close

### style.css

- Animasi pesawat terbang dengan keyframe `planeFly`:
  - Mulai dari bawah form, scale kecil, rotate -30°
  - Bergerak melengkung ke kanan atas
  - Scale membesar, rotate jadi 15°
  - Duration 1.8s dengan easing cubic-bezier
- Animasi trail/jejak pesawat dengan keyframe `trailFade`
- Toast notifikasi style glassmorphism modern:
  - Muncul dari kanan dengan spring animation
  - Icon gradient hijau + shadow
  - Auto-hide setelah 6 detik
  - Dark mode support
  - Mobile responsive

### script.js

- Form submit VALIDASI: cek required fields (nama, email, layanan, pesan)
- **Kirim OTOMATIS ke Telegram** via Bot API — tanpa buka halaman lain
  - Bot: @AfterlineBot ✅ (token & chat ID sudah terisi)
  - Format pesan rapi dengan emoji + timestamp
  - Fallback ke WhatsApp jika Telegram gagal
- Animasi paper plane dipicu saat submit
- Toast notifikasi sukses (hijau) muncul dengan animasi slide-in
- Toast notifikasi error (merah) jika gagal
- Button berubah jadi spinner "Mengirim..." lalu kembali normal
- Form di-reset setelah submit
- Toast bisa ditutup manual via tombol X

## ⚠️ PENTING SEBELUM TEST:

1. Buka https://t.me/AfterlineBot di Telegram
2. Klik tombol **START / Mulai**
3. Baru coba isi form di web

---

## ✅ Update Portofolio Video — Google Drive Integration

### Masalah:

- Portofolio video masih pakai data dummy (videoId kosong)
- Iframe Google Drive diblokir oleh X-Frame-Options (tidak bisa di-embed langsung)

### Solusi:

- ✅ **Data video** — 3 video dari Google Drive dengan FILE ID masing-masing:
  1. Short Movie — Aksi Hijau (`1oO_KrZTmRivispwNyjVbgGPodXneyhsu`)
  2. Video Dokumentasi — Komnas (`1V9cCcULP59eOyVPByqZa16fEsemHjr7K`)
  3. Video Racap Tugas Kuliah — Kunjungan Industri Mayora (`14dh21OcBqppDIY6TCdPCBZE44oGIXIi2`)
- ✅ **HTML5 `<video>` tag** — menggantikan iframe yang diblokir Google Drive
- ✅ **Direct download URL** — menggunakan `getGDriveDirectUrl()` untuk streaming
- ✅ **Fallback link** — jika video gagal dimuat, muncul tombol "Buka di Google Drive"
- ✅ **Loading spinner** — animasi spinner saat video sedang dimuat
- ✅ **Error handling** — `onerror` event pada video menampilkan fallback
- ✅ **Cleanup** — video di-pause dan di-unload saat modal ditutup
- ✅ **Thumbnail sementara** — tetap pakai Unsplash (belum ada screenshot video)

### File yang Diubah:

1. **portfolio-video-data.js** — videoId diisi, judul & deskripsi diperbarui
2. **index.html** — iframe diganti `<video>` tag + loading spinner + fallback link
3. **style.css** — styling video player, spinner, fallback link
4. **script.js** — modal handler diubah dari iframe ke HTML5 video + error handling

---

## ✅ Final Responsive Bug Fixes

### Perubahan pada `responsive.css`:

1. **🔴 Hero mini-cards** — `display: none` di breakpoint 767.98px (tablet/mobile). 12 floating absolute cards menyebabkan overflow dan overlap.
2. **🔴 Hero visual height** — Ditambahkan `height: 260px` di breakpoint 575.98px agar proporsional di layar kecil.
3. **🟡 Dark mode navbar collapse** — Ditambahkan `[data-theme='dark'] .af-nav-links` dengan `background: rgba(15, 23, 42, 0.95)`.
4. **🟡 Pricing card highlight scale** — `transform: scale(1)` dan `translateY` ditambahkan `!important` agar override inline CSS.
5. **🟡 FAQ splash decorations** — Semua `.faq-header-decor::before, ::after, .faq-splash-pink, .faq-splash-dot` di-`display: none` di mobile.
6. **🟢 Portfolio item margin-bottom** — Dikurangi menjadi `16px` di mobile.
7. **🟢 Why-stats gap** — Dikurangi menjadi `15px` di mobile.
8. **🟢 Process step** — Tambahan padding lebih kecil, dan breakpoint 400px untuk single column.

### Perubahan pada `script.js`:

9. **🟡 escapeMarkdown fix** — Dihapus `.replace(/\./g, '\\.')` karena titik tidak perlu di-escape di Markdown Telegram dan bisa merusak URL/email.
