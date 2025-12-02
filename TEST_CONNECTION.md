# 🔍 Test Backend Connection

## ✅ Backend Status

Backend server sudah running di: **http://localhost:5000**

## 🧪 Test Koneksi

### 1. Test Backend Health (dari terminal)
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "MindPub API is running",
  "timestamp": "..."
}
```

### 2. Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@mindpub.com\",\"password\":\"Nj0Kx827\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "AdminKeren",
    "email": "admin@mindpub.com",
    "role": "admin"
  }
}
```

### 3. Test dari Browser
Buka: http://localhost:5000/api/health

## 🔧 Troubleshooting

### Backend tidak running?
1. Cek apakah ada proses di port 5000:
   ```bash
   netstat -ano | findstr :5000
   ```

2. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

### CORS Error?
- CORS sudah dikonfigurasi untuk allow:
  - `http://localhost:3000` (frontend port)
  - `http://localhost:5173` (Vite default)
  - Semua localhost origins di development mode

### Database Error?
- Pastikan XAMPP MySQL running
- Pastikan database `mindpub_db` exists
- Import `backend/config/database.sql`
- Import `backend/config/seed.sql`

## 📝 Next Steps

1. ✅ Backend running
2. ✅ CORS configured
3. ⏭️ Test login dari frontend
4. ⏭️ Test register dari frontend

