# 🔌 Backend-Frontend Connection Guide

## ✅ Yang Sudah Dibuat

### 1. **API Service Files** (Frontend)
- ✅ `src/services/api.js` - Axios instance dengan base URL
- ✅ `src/services/authService.js` - Auth endpoints
- ✅ `src/services/bookService.js` - Book endpoints
- ✅ `src/services/index.js` - Export semua services

### 2. **App.jsx Updated**
- ✅ Login menggunakan `authService.login()`
- ✅ Register menggunakan `authService.register()`
- ✅ Logout menggunakan `authService.logout()`
- ✅ Save user ke localStorage
- ✅ Load user dari localStorage on mount

### 3. **CORS Configuration**
- ✅ Backend allow: `http://localhost:3000` dan `http://localhost:5173`
- ✅ Frontend port: `3000` (vite.config.js)

## 🚀 Cara Menjalankan

### Step 1: Jalankan Backend
```bash
cd backend
npm run dev
```

Backend akan jalan di: **http://localhost:5000**

**Pastikan:**
- ✅ MySQL di XAMPP running
- ✅ Database `mindpub_db` sudah dibuat
- ✅ SQL schema sudah di-import
- ✅ Seed data sudah di-import (admin & user)

### Step 2: Jalankan Frontend
```bash
# Di root folder (terminal baru)
npm run dev
```

Frontend akan jalan di: **http://localhost:3000**

## 🧪 Test Koneksi

### 1. Test Backend Health
Buka browser: http://localhost:5000/api/health

Expected response:
```json
{
  "success": true,
  "message": "MindPub API is running"
}
```

### 2. Test Login dari Frontend
1. Buka http://localhost:3000
2. Klik "Login" atau "Sign In"
3. Masukkan:
   - **Email:** `admin@mindpub.com`
   - **Password:** `Nj0Kx827`
4. Klik Login

**Expected:**
- ✅ Login berhasil
- ✅ Redirect ke Admin Dashboard
- ✅ User data tersimpan di localStorage

### 3. Test Register dari Frontend
1. Klik "Register" atau "Sign Up"
2. Isi form:
   - Username: `newuser`
   - Email: `newuser@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Klik Register

**Expected:**
- ✅ Register berhasil
- ✅ Redirect ke User Dashboard
- ✅ User data tersimpan di localStorage

## 🔍 Troubleshooting

### ❌ Backend tidak connect

**Cek:**
1. Backend server sudah running? (lihat terminal)
2. Database connected? (cek log backend)
3. Port 5000 tidak digunakan aplikasi lain?

**Test:**
```bash
curl http://localhost:5000/api/health
```

### ❌ CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solusi:**
- Cek `backend/server.js` line 17-20
- Pastikan CORS allow port frontend (3000 atau 5173)
- Restart backend server

### ❌ Network Error

**Error:** `Network error. Please check if backend server is running.`

**Solusi:**
1. Pastikan backend running di port 5000
2. Cek `src/services/api.js` - base URL: `http://localhost:5000/api`
3. Test backend: http://localhost:5000/api/health

### ❌ Login/Register Failed

**Cek:**
1. Database sudah ada data? (import seed.sql)
2. Email/password benar?
3. Backend log untuk error details
4. Browser console untuk error details

## 📡 API Endpoints yang Tersedia

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me?user_id=1` - Get user
- `POST /api/auth/logout` - Logout

### Books
- `GET /api/books` - Get all books
- `GET /api/books/popular` - Popular books
- `GET /api/books/:id` - Book detail
- `GET /api/books/:id/pages/:page` - Get page content
- `POST /api/books` - Upload book (admin)

## 📝 Next Steps

1. ✅ Backend & Frontend sudah connect
2. ⏭️ Update components lain untuk pakai API:
   - `PopularBooks.jsx` → `bookService.getPopularBooks()`
   - `AllBooks.jsx` → `bookService.getAllBooks()`
   - `AdminDashboard.jsx` → `bookService.uploadBook()`
   - dll

## 🎯 Checklist

- [x] Backend server running
- [x] Frontend server running
- [x] API service files created
- [x] App.jsx updated untuk pakai API
- [x] CORS configured
- [ ] Test login berhasil
- [ ] Test register berhasil
- [ ] Test logout berhasil

---

**Happy Coding! 🚀**

