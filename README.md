
```markdown
# Web Salon 💇‍♀️💅

Sistem manajemen usaha salon kecantikan berbasis web, lengkap dengan fitur layanan, reservasi, antrean, kasir, laporan, dan notifikasi WhatsApp. Dibangun menggunakan **PHP, MySQL, Bootstrap, dan JavaScript**.

## ✨ Fitur Utama
- ✅ Manajemen layanan & harga
- ✅ Data karyawan & jadwal kerja
- ✅ Sistem reservasi & antrean
- ✅ Kasir & transaksi penjualan
- ✅ Laporan pendapatan & layanan terlaris
- ✅ Notifikasi WhatsApp otomatis
- ✅ Pengaturan informasi usaha
- ✅ Hak akses admin & staf

## 📋 Persyaratan Sistem
- PHP ≥ 7.4
- MySQL / MariaDB
- Web Server (Apache / Nginx)
- Composer
- Ekstensi PHP: `mysqli`, `curl`, `gd`, `mbstring`

---

## 🚀 Cara Instalasi

### 1. Unduh / Clone Proyek
```bash
git clone https://github.com/heruhendri/web-salon.git
cd web-salon
```

### 2. Instal Dependensi
```bash
composer install
```

### 3. Pengaturan Basis Data
1. Buat database baru di MySQL (misal: `db_salon`)
2. Impor file `database/db_salon.sql` ke database tersebut

### 4. Konfigurasi Aplikasi
Buka file `config/config.php`, sesuaikan pengaturan berikut:
```php
$db_host = 'localhost';
$db_user = 'nama_user_database';
$db_pass = 'password_database';
$db_name = 'db_salon';

// Pengaturan WhatsApp
$wa_admin = '628xxxxxxx'; // nomor admin
$wa_session = 'session_salon';
```

### 5. Pengaturan Izin Folder
Pastikan folder berikut bisa ditulis:
```bash
chmod -R 777 assets/cache
chmod -R 777 config/whatsapp
```

### 6. Akses Aplikasi
Buka di browser:
```
http://localhost/web-salon/
```

**Akun Default:**
- Username: `admin`
- Password: `admin123`

> ⚠️ Segera ubah kata sandi setelah masuk pertama kali!

---

## ⚙️ Konfigurasi Tambahan

### 📲 Pengaturan WhatsApp Bot
1. Pastikan nomor admin sudah benar di `config.php`
2. Jalankan pemindaian QR Code:
```bash
php lib/whatsapp/start.php
```
3. Scan kode QR menggunakan WhatsApp di HP kamu

### 🔄 Update Aplikasi
```bash
git pull origin main
composer update
```

---

## 🐛 Laporan Masalah
Jika ada kendala atau fitur baru, silakan buka *Issue* di repositori ini.

## 📄 Lisensi
Proyek ini bersifat terbuka dan bebas digunakan untuk keperluan pribadi maupun usaha.
```

---

### 📌 Cara Pasang ke GitHub
1. Buat file baru bernama `README.md` di folder utama proyek
2. Salin semua teks di atas ke dalamnya
3. Simpan, lalu kirim ke GitHub:
```bash
git add README.md
git commit -m "Update README & panduan instalasi"
git push origin main
```

