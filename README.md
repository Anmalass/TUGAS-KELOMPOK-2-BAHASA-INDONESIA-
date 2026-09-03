# Template Presentasi — Desain "Buku Resep"

Website presentasi reusable. **Desain (HTML/CSS/JS) dan isi (content.json)
terpisah total** — untuk mengganti tema tugas, kamu hanya perlu mengedit
`content/content.json` dan mengganti gambar di folder `assets/`. Tidak perlu
menyentuh `index.html`, `css/style.css`, atau `js/app.js`.

"Wedang Jahe" yang ada di `content.json` saat ini hanyalah **contoh isi**,
bukan judul yang terkunci. Ganti sesuai tugasmu (Seblak, Es Cendol, kerajinan
tangan, percobaan sains — apa pun yang formatnya: anggota → bahan/alat →
langkah-langkah → hasil).

## Struktur folder

```
project/
├── index.html          ← kerangka halaman (JANGAN diedit)
├── css/
│   └── style.css        ← semua tampilan visual (JANGAN diedit)
├── js/
│   └── app.js            ← logika membaca content.json & render slide (JANGAN diedit)
├── content/
│   └── content.json      ← SEMUA ISI PRESENTASI ADA DI SINI (edit file ini)
├── assets/                ← semua foto/gambar (ganti file di sini)
│   ├── anggota-1.jpg
│   ├── anggota-2.jpg
│   ├── bahan-1.jpg
│   ├── bahan-2.jpg
│   ├── alat-1.jpg
│   ├── langkah-1.jpg
│   ├── langkah-2.jpg
│   └── hasil.jpg
└── README.md
```

## Cara mengganti tema (misalnya jadi "Cara Membuat Seblak")

1. Buka `content/content.json` dengan text editor mana pun.
2. Ubah nilai-nilai teksnya: `title`, `subtitle`, `theme`, `group`,
   `className`, `school`, daftar `members`, `ingredients`, `tools`, `steps`,
   dan `result`.
3. Ganti file foto di folder `assets/` dengan fotomu sendiri. **Gunakan nama
   file yang sama** (misalnya tetap `bahan-1.jpg`) supaya kamu tidak perlu
   mengubah path di `content.json`. Kalau ingin nama file berbeda, cukup
   sesuaikan path-nya di `content.json` — tetap tidak perlu menyentuh HTML/CSS/JS.
4. Kalau ada video tutorial, isi `video.url` (boleh link YouTube biasa atau
   link embed).
5. Simpan, lalu `git add` → `git commit` → `git push` ke GitHub (atau upload
   ulang foldernya kalau kamu pakai GitHub Pages/hosting statis lain).

Presentasi otomatis menyesuaikan jumlah slide dengan isi `content.json` —
menambah atau mengurangi jumlah anggota, bahan, alat, atau langkah tidak
memerlukan perubahan kode apa pun. Slide akan otomatis bertambah/berkurang.

## Penjelasan tiap field di content.json

| Field | Keterangan |
|---|---|
| `title` | Judul utama di slide sampul |
| `subtitle` | Sub-judul kecil di bawah judul |
| `theme` | Nama tema singkat, tampil sebagai label kecil di atas judul |
| `group` | Nama kelompok (mis. "Kelompok 1") |
| `className` | Nama kelas (mis. "XII IPA 1") |
| `school` | Nama sekolah |
| `members[]` | Daftar anggota: `name`, `absen`, `role`, `photo` |
| `ingredients[]` | Daftar bahan: `name`, `amount`, `image` |
| `tools[]` | Daftar alat: `name`, `image` |
| `steps[]` | Daftar langkah, urut sesuai urutan di array: `title`, `description`, `image` |
| `result` | Hasil akhir: `title`, `description`, `image` |
| `video.url` | (opsional) link video tutorial. Kosongkan (`""`) kalau tidak ada — slide video otomatis disembunyikan |

Kalau salah satu bagian (`ingredients`, `tools`, `steps`, `video`, dst) tidak
relevan untuk tugasmu, cukup kosongkan array-nya (`[]`) atau hapus field-nya
— slide untuk bagian itu otomatis tidak ditampilkan.

## Menjalankan di komputer sendiri

Karena halaman ini memuat `content.json` lewat `fetch()`, buka lewat server
lokal (bukan langsung klik dua kali `index.html`), misalnya:

```bash
# Python
python3 -m http.server 8000

# lalu buka http://localhost:8000 di browser
```

Kalau di-hosting di GitHub Pages, Netlify, atau Vercel, ini otomatis bekerja
tanpa langkah tambahan.

## Yang TIDAK ada di website ini (sengaja)

Tidak ada form edit, tombol edit, dashboard admin, atau CMS di dalam website.
Website ini murni menampilkan isi dari `content.json` — semua pengeditan isi
dilakukan lewat file, bukan lewat tampilan web.
