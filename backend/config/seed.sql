-- Seed Data untuk MindPub Database
-- File ini berisi data awal untuk testing: Admin dan User contoh

USE mindpub_db;

-- Hapus data lama jika ada (optional, untuk reset)
-- DELETE FROM quick_notes;
-- DELETE FROM reading_progress;
-- DELETE FROM bookmarks;
-- DELETE FROM book_ratings;
-- DELETE FROM tickets;
-- DELETE FROM users WHERE id IN (1, 2);

-- Insert Admin Account
-- Password: Nj0Kx827
-- Hash generated dengan bcrypt (salt rounds: 10)
INSERT INTO users (id, username, email, password_hash, role, bio, total_pages_read, books_finished, created_at, updated_at)
VALUES (
  1,
  'AdminKeren',
  'admin@mindpub.com',
  '$2a$10$WrUl0w49KDzBhmcSq6CUR.rrLCUMMh5jYWovXzcO6loqUhcEqsMnq',
  'admin',
  'Administrator MindPub Platform',
  0,
  0,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  bio = VALUES(bio);

-- Insert User Contoh untuk Testing
-- Password: user123
-- Hash generated dengan bcrypt (salt rounds: 10)
INSERT INTO users (id, username, email, password_hash, role, bio, total_pages_read, books_finished, created_at, updated_at)
VALUES (
  2,
  'testuser',
  'testuser@mindpub.com',
  '$2a$10$Z5TgMr/4BvnWeh4C5PqISeh5BXSvaxFDuu1aY0efNfjZRoFxQfn2a',
  'user',
  'Test User untuk development dan testing',
  150,
  2,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  bio = VALUES(bio);

-- Verifikasi data yang di-insert
SELECT 
  id,
  username,
  email,
  role,
  bio,
  total_pages_read,
  books_finished,
  created_at
FROM users
WHERE id IN (1, 2)
ORDER BY id;

-- Catatan:
-- Admin Login:
--   Email: admin@mindpub.com
--   Password: Nj0Kx827
--   Role: admin
--
-- User Login:
--   Email: testuser@mindpub.com
--   Password: user123
--   Role: user

