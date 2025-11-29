# Panduan Sistem Authentication & Dashboard

## 📋 Fitur yang Telah Dibuat

### 1. **AuthOverlay (Login & Register)**
Overlay page untuk autentikasi dengan fitur:
- Toggle antara mode Login dan Register
- Form input yang responsif
- Validasi form
- Animasi transisi yang smooth

**Cara Mengakses:**
- Klik tombol "Login / Register" di Navbar

### 2. **SuccessPopup**
Pop-up kecil yang muncul setelah registrasi berhasil dengan pilihan:
- Langsung ke Dashboard
- Ke Halaman Login

### 3. **UserDashboard**
Dashboard untuk user biasa dengan fitur:
- **Customize Profile**: Edit nama, email, dan bio
- **Bookmarked Books**: Daftar buku yang telah ditandai
- Tombol Logout
- Desain overlay pop-up dengan tombol close (X)

### 4. **AdminDashboard**
Dashboard untuk admin dengan fitur lengkap (mirip dengan gambar contoh):
- **Dashboard**: Menampilkan daftar artikel dengan tabel
  - Kolom: Judul, Tanggal, Status, Kategori
  - Aksi: Edit dan Hapus artikel
  - Tombol "+ Artikel Baru" untuk upload buku
- **Modal Upload Buku**: Form untuk menambahkan buku baru
  - Input: Judul, Deskripsi, Kategori, Cover URL
- **Kategori**: Halaman kelola kategori
- **Profil**: Pengaturan profil admin
- **Kontak**: Management kontak dan pesan
- **Activity Logs**: Log aktivitas sistem
- **Main Page**: Pengaturan halaman utama
- **Logout**: Keluar dari sistem

## 🎨 Desain & Styling

- Menggunakan Tailwind CSS untuk styling
- Desain modern dengan gradient background (pink-purple-blue)
- Animasi transisi yang smooth
- Responsive untuk semua ukuran layar
- Overlay dengan backdrop blur effect

## 🔐 Sistem Login

### Login sebagai User Biasa:
```
Email: user@example.com
Password: (apapun)
```
Akan membuka **UserDashboard**

### Login sebagai Admin:
```
Email: admin@example.com (atau email yang mengandung 'admin')
Password: (apapun)
```
Akan membuka **AdminDashboard**

## 🚀 Cara Menggunakan

1. **Register:**
   - Klik "Login / Register" di Navbar
   - Pilih tab "Register"
   - Isi form: Username, Email, Password, Konfirmasi Password
   - Klik "Daftar"
   - Pilih "Langsung ke Dashboard" atau "Ke Halaman Login"

2. **Login:**
   - Klik "Login / Register" di Navbar
   - Pilih tab "Login"
   - Isi Email dan Password
   - Klik "Masuk"
   - Dashboard akan terbuka sesuai role (User/Admin)

3. **Akses Dashboard:**
   - Setelah login, nama user akan muncul di Navbar
   - Klik nama user untuk membuka dashboard

4. **Logout:**
   - Buka Dashboard
   - Klik tombol "Logout" di sidebar

## 📁 Struktur File

```
src/
├── components/
│   ├── AuthOverlay.jsx       # Overlay Login/Register
│   ├── SuccessPopup.jsx      # Pop-up setelah register
│   ├── UserDashboard.jsx     # Dashboard untuk user
│   ├── AdminDashboard.jsx    # Dashboard untuk admin
│   └── Navbar.jsx            # Updated dengan auth buttons
├── pages/
│   └── LandingPage.jsx       # Updated dengan props
└── App.jsx                   # State management utama
```

## ⚙️ State Management

State management dilakukan di `App.jsx` dengan useState:
- `showAuth`: Kontrol tampilan AuthOverlay
- `showSuccess`: Kontrol tampilan SuccessPopup
- `showUserDashboard`: Kontrol tampilan UserDashboard
- `showAdminDashboard`: Kontrol tampilan AdminDashboard
- `user`: Data user yang sedang login

## 🎯 Fitur Khusus

### UserDashboard:
- Avatar dengan initial nama user
- Edit profile dengan form yang user-friendly
- Daftar bookmarks dengan aksi Baca dan Hapus
- Sidebar navigasi dengan icon

### AdminDashboard:
- Tabel artikel dengan sorting dan filtering (ready untuk implementasi)
- Modal upload buku yang lengkap
- Sidebar dengan banyak menu
- Gradient background yang eye-catching
- Status badge (Published/Draft) dengan warna berbeda
- Aksi Edit dan Hapus untuk setiap artikel

## 📝 Catatan Penting

**Frontend Only:**
- Semua data disimpan di state (tidak persistent)
- Validasi password dilakukan di frontend
- Role admin ditentukan dari email (jika mengandung 'admin')
- Data artikel dan bookmarks adalah dummy data

**Untuk Backend Integration:**
Ketika backend siap, Anda perlu:
1. Ganti function `handleLogin` dan `handleRegister` dengan API calls
2. Simpan token di localStorage atau cookie
3. Fetch data artikel dan bookmarks dari database
4. Implementasi upload file untuk cover buku
5. Tambahkan authentication middleware

## 🎨 Customization

Anda bisa mengubah:
- Warna theme di Tailwind config
- Gradient background di AdminDashboard
- Dummy data di setiap komponen
- Menambah field di form upload buku
- Menambah menu di sidebar

## 🔧 Testing

Untuk testing aplikasi:
1. Start development server: `npm run dev`
2. Buka browser dan akses aplikasi
3. Test flow: Register → Success Popup → Dashboard
4. Test flow: Login → Dashboard
5. Test fitur di UserDashboard dan AdminDashboard
6. Test responsive design di berbagai ukuran layar

---

**Dibuat dengan ❤️ untuk MindPub Platform**

