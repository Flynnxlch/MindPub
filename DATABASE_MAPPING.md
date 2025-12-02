# Database Mapping Documentation - MindPub

## 📋 Table of Contents
1. [Database Connection Structure](#database-connection-structure)
2. [Folder Structure](#folder-structure)
3. [Database Schema](#database-schema)
4. [Component to Database Mapping](#component-to-database-mapping)
5. [API Endpoints](#api-endpoints)
6. [Data Manipulation Operations](#data-manipulation-operations)

---

## 🔌 Database Connection Structure

### Backend Folder Structure
```
backend/
├── config/
│   └── database.js          # Database connection configuration
├── models/                  # Database models (ORM/ODM)
│   ├── User.js
│   ├── Book.js
│   ├── BookRating.js
│   ├── Bookmark.js
│   ├── ReadingProgress.js
│   ├── ReadingSession.js
│   ├── QuickNote.js
│   └── Ticket.js
├── controllers/             # Business logic
│   ├── authController.js
│   ├── bookController.js
│   ├── userController.js
│   ├── readingController.js
│   └── ticketController.js
├── routes/                  # API routes
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── userRoutes.js
│   ├── readingRoutes.js
│   └── ticketRoutes.js
├── middleware/              # Authentication, validation, etc.
│   ├── auth.js
│   └── validation.js
├── services/                # External services (EPUB/PDF parser)
│   └── fileParser.js
└── utils/                   # Helper functions
    └── helpers.js
```

### Database Connection
- **Database Type**: PostgreSQL / MySQL / MongoDB (recommended: PostgreSQL)
- **ORM/ODM**: Sequelize (SQL) / Mongoose (MongoDB)
- **Connection Pool**: Configured in `config/database.js`

---

## 📁 Folder Structure

### Folders Connected to Database

#### 1. **`src/components/`** - Frontend Components
- **AuthOverlay.jsx** → `users` table (authentication)
- **UserDashboard.jsx** → `users`, `bookmarks`, `reading_progress` tables
- **AdminDashboard.jsx** → `books`, `users`, `tickets` tables
- **AllBooks.jsx** → `books` table
- **PopularBooks.jsx** → `books` table (with popularity calculation)
- **RecommendedBook.jsx** → `books` table
- **BookDetailOverlay.jsx** → `books`, `book_ratings`, `bookmarks` tables
- **Leaderboard.jsx** → `books`, `users` tables (aggregated data)
- **RecentReadBooks.jsx** → `reading_progress` table
- **QuickNotes.jsx** → `quick_notes` table
- **SubmitTicket.jsx** → `tickets` table
- **StarRating.jsx** → `book_ratings` table

#### 2. **`src/pages/`** - Page Components
- **ReadPage.jsx** → `reading_progress`, `reading_sessions`, `quick_notes` tables
- **BooksPage.jsx** → `books` table (via child components)
- **LandingPage.jsx** → `books` table (via RecommendedBook component)

#### 3. **`src/App.jsx`** - Main App Component
- Manages global state for `users` (authentication)
- Routes to different pages based on user state

---

## 🗄️ Database Schema

### 1. **users** Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin'
    bio TEXT,
    avatar_url VARCHAR(500),
    total_pages_read INTEGER DEFAULT 0,
    books_finished INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Manipulated in:**
- `AuthOverlay.jsx` (CREATE - registration)
- `UserDashboard.jsx` (READ, UPDATE - profile)
- `AdminDashboard.jsx` (READ - user list)

---

### 2. **books** Table
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'Biologi', 'Fisika', 'Kimia', etc.
    pages INTEGER NOT NULL,
    cover_url VARCHAR(500), -- URL to cover image
    cover_color VARCHAR(100), -- Gradient color class
    file_url VARCHAR(500), -- URL to EPUB/PDF file
    release_date DATE,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    total_reads INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published', -- 'published', 'draft', 'archived'
    uploaded_by INTEGER REFERENCES users(id), -- Admin who uploaded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Manipulated in:**
- `AllBooks.jsx` (READ - list all books)
- `PopularBooks.jsx` (READ - popular books)
- `RecommendedBook.jsx` (READ - recommended books)
- `BookDetailOverlay.jsx` (READ - book details)
- `AdminDashboard.jsx` (CREATE, READ, UPDATE, DELETE - book management)
- `Leaderboard.jsx` (READ - top rated books)

---

### 3. **book_ratings** Table
```sql
CREATE TABLE book_ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0), -- 0.5, 1.0, 1.5, ..., 5.0
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id) -- One rating per user per book
);
```

**Manipulated in:**
- `BookDetailOverlay.jsx` (CREATE, UPDATE - user rating)
- `StarRating.jsx` (CREATE, UPDATE - rating input)
- `books` table (UPDATE - average_rating, rating_count via trigger/aggregation)

---

### 4. **bookmarks** Table
```sql
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id) -- One bookmark per user per book
);
```

**Manipulated in:**
- `AllBooks.jsx` (CREATE, DELETE - toggle bookmark)
- `PopularBooks.jsx` (CREATE, DELETE - toggle bookmark)
- `RecommendedBook.jsx` (CREATE, DELETE - toggle bookmark)
- `BookDetailOverlay.jsx` (CREATE, DELETE - toggle bookmark)
- `ReadPage.jsx` (CREATE, DELETE - toggle bookmark)
- `UserDashboard.jsx` (READ - list bookmarks)

---

### 5. **reading_progress** Table
```sql
CREATE TABLE reading_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    current_page INTEGER DEFAULT 1,
    furthest_page INTEGER DEFAULT 1, -- Highest page reached
    total_pages INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_finished BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id) -- One progress record per user per book
);
```

**Manipulated in:**
- `ReadPage.jsx` (CREATE, UPDATE - update progress)
- `ReadingProgress.jsx` (READ, UPDATE - display and update progress)
- `RecentReadBooks.jsx` (READ - recent reading history)
- `UserDashboard.jsx` (READ - dashboard stats)

---

### 6. **reading_sessions** Table
**NOTE: Reading time is tracked in frontend only and NOT saved to database**
- Reading timer runs only in the frontend component
- No database operations needed
- Timer resets when user closes the reader

---

### 7. **quick_notes** Table
```sql
CREATE TABLE quick_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    reading_progress_id INTEGER REFERENCES reading_progress(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Manipulated in:**
- `QuickNotes.jsx` (CREATE, READ, UPDATE, DELETE - all note operations)
- `ReadPage.jsx` (READ - display notes for current book)

---

### 8. **tickets** Table
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'technical', 'book', 'account', 'feature', 'other'
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    admin_response TEXT,
    responded_by INTEGER REFERENCES users(id), -- Admin who responded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Manipulated in:**
- `SubmitTicket.jsx` (CREATE - submit new ticket)
- `AdminDashboard.jsx` (READ, UPDATE - view and respond to tickets)

---

## 🔄 Component to Database Mapping

### Authentication & User Management

| Component | Database Table | Operations | Description |
|-----------|---------------|------------|-------------|
| `AuthOverlay.jsx` | `users` | CREATE | User registration |
| `AuthOverlay.jsx` | `users` | READ | User login (authentication) |
| `UserDashboard.jsx` | `users` | READ, UPDATE | View and edit user profile |
| `UserDashboard.jsx` | `bookmarks` | READ | List user bookmarks |
| `UserDashboard.jsx` | `reading_progress` | READ | User statistics (pages read, books finished) |
| `UserDashboard.jsx` | `reading_progress` | READ | Recently read books |

### Book Management

| Component | Database Table | Operations | Description |
|-----------|---------------|------------|-------------|
| `AllBooks.jsx` | `books` | READ | List all books with pagination |
| `AllBooks.jsx` | `bookmarks` | CREATE, DELETE | Toggle bookmark |
| `PopularBooks.jsx` | `books` | READ | Popular books (sorted by rating/reads) |
| `PopularBooks.jsx` | `bookmarks` | CREATE, DELETE | Toggle bookmark |
| `RecommendedBook.jsx` | `books` | READ | Recommended books |
| `RecommendedBook.jsx` | `bookmarks` | CREATE, DELETE | Toggle bookmark |
| `BookDetailOverlay.jsx` | `books` | READ | Book details |
| `BookDetailOverlay.jsx` | `book_ratings` | CREATE, UPDATE | User rating |
| `BookDetailOverlay.jsx` | `bookmarks` | CREATE, DELETE | Toggle bookmark |
| `AdminDashboard.jsx` | `books` | CREATE, READ, UPDATE, DELETE | Full CRUD for books |
| `AdminDashboard.jsx` | `books` | CREATE | Upload EPUB/PDF (parse and extract metadata) |

### Reading & Progress

| Component | Database Table | Operations | Description |
|-----------|---------------|------------|-------------|
| `ReadPage.jsx` | `reading_progress` | CREATE, UPDATE | Update current/furthest page |
| `ReadPage.jsx` | `reading_sessions` | CREATE, UPDATE | Track reading session |
| `ReadPage.jsx` | `bookmarks` | CREATE, DELETE | Toggle bookmark |
| `ReadingProgress.jsx` | `reading_progress` | READ | Display progress |
| `ReadingTime.jsx` | `reading_sessions` | CREATE, UPDATE | Track reading time |
| `QuickNotes.jsx` | `quick_notes` | CREATE, READ, UPDATE, DELETE | All note operations |
| `RecentReadBooks.jsx` | `reading_progress` | READ | Recent reading history |

### Leaderboard & Statistics

| Component | Database Table | Operations | Description |
|-----------|---------------|------------|-------------|
| `Leaderboard.jsx` | `books` | READ | Top rated books (aggregated) |
| `Leaderboard.jsx` | `users` | READ | Top users by pages read (aggregated) |
| `UserDashboard.jsx` | `users` | READ | User statistics |
| `AdminDashboard.jsx` | `books`, `users` | READ | Platform statistics |

### Support & Tickets

| Component | Database Table | Operations | Description |
|-----------|---------------|------------|-------------|
| `SubmitTicket.jsx` | `tickets` | CREATE | Submit support ticket |
| `AdminDashboard.jsx` | `tickets` | READ, UPDATE | View and respond to tickets |

---

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/register` | User registration | `{username, email, password}` | `{user, token}` |
| POST | `/login` | User login | `{email, password}` | `{user, token}` |
| POST | `/logout` | User logout | `{token}` | `{message}` |
| GET | `/me` | Get current user | Headers: `Authorization` | `{user}` |

### Book Routes (`/api/books`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | Get all books | Query: `?page=1&limit=20&category=&sort=` | `{books, total, page}` |
| GET | `/popular` | Get popular books | Query: `?limit=6` | `{books}` |
| GET | `/recommended` | Get recommended books | Query: `?limit=4` | `{books}` |
| GET | `/:id` | Get book by ID | - | `{book}` |
| POST | `/` | Create book (Admin) | `{title, author, description, category, file, cover}` | `{book}` |
| PUT | `/:id` | Update book (Admin) | `{title, author, description, category, cover}` | `{book}` |
| DELETE | `/:id` | Delete book (Admin) | - | `{message}` |
| POST | `/:id/upload` | Upload EPUB/PDF (Admin) | FormData: `{file}` | `{book, parsedData}` |

### Rating Routes (`/api/ratings`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/` | Create/Update rating | `{bookId, rating}` | `{rating}` |
| GET | `/:bookId` | Get user rating for book | - | `{rating}` |
| DELETE | `/:bookId` | Delete rating | - | `{message}` |

### Bookmark Routes (`/api/bookmarks`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | Get user bookmarks | - | `{bookmarks}` |
| POST | `/` | Create bookmark | `{bookId}` | `{bookmark}` |
| DELETE | `/:bookId` | Remove bookmark | - | `{message}` |

### Reading Progress Routes (`/api/reading`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/progress/:bookId` | Get reading progress | - | `{progress}` |
| PUT | `/progress/:bookId` | Update progress | `{currentPage, furthestPage}` | `{progress}` |
| GET | `/recent` | Get recent reads | Query: `?limit=6` | `{books}` |
| POST | `/session/start` | Start reading session | `{bookId}` | `{session}` |
| PUT | `/session/:id/end` | End reading session | `{duration}` | `{session}` |

### Notes Routes (`/api/notes`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/:bookId` | Get notes for book | - | `{notes}` |
| POST | `/` | Create note | `{bookId, noteText}` | `{note}` |
| PUT | `/:id` | Update note | `{noteText}` | `{note}` |
| DELETE | `/:id` | Delete note | - | `{message}` |

### Leaderboard Routes (`/api/leaderboard`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/books` | Get top books | Query: `?limit=20` | `{books}` |
| GET | `/users` | Get top users | Query: `?limit=20` | `{users}` |

### Ticket Routes (`/api/tickets`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/` | Submit ticket | `{subject, category, message}` | `{ticket}` |
| GET | `/` | Get user tickets | - | `{tickets}` |
| GET | `/admin` | Get all tickets (Admin) | Query: `?status=` | `{tickets}` |
| PUT | `/:id` | Update ticket (Admin) | `{status, adminResponse}` | `{ticket}` |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/profile` | Get user profile | - | `{user}` |
| PUT | `/profile` | Update profile | `{username, bio, avatar}` | `{user}` |
| GET | `/stats` | Get user statistics | - | `{stats}` |
| GET | `/admin` | Get all users (Admin) | Query: `?page=&limit=` | `{users, total}` |

---

## 🔧 Data Manipulation Operations

### CREATE Operations

#### 1. **User Registration** (`AuthOverlay.jsx`)
```javascript
POST /api/auth/register
Body: {
  username: string,
  email: string,
  password: string
}
→ Creates: users record
```

#### 2. **Book Upload** (`AdminDashboard.jsx`)
```javascript
POST /api/books/
Body: FormData {
  file: File (EPUB/PDF),
  cover: File (Image),
  title: string (editable),
  author: string (editable),
  description: string (editable),
  category: string (editable)
}
→ Creates: books record
→ Parses: EPUB/PDF to extract pages, metadata
```

#### 3. **Book Rating** (`BookDetailOverlay.jsx`, `StarRating.jsx`)
```javascript
POST /api/ratings/
Body: {
  bookId: number,
  rating: number (0.5-5.0)
}
→ Creates: book_ratings record
→ Updates: books.average_rating, books.rating_count
```

#### 4. **Bookmark** (Multiple components)
```javascript
POST /api/bookmarks/
Body: {
  bookId: number
}
→ Creates: bookmarks record
```

#### 5. **Reading Progress** (`ReadPage.jsx`)
```javascript
POST /api/reading/progress/:bookId
Body: {
  currentPage: number,
  furthestPage: number,
  totalPages: number
}
→ Creates: reading_progress record (if new)
→ Updates: users.total_pages_read
```

#### 6. **Reading Session** (`ReadPage.jsx`)
```javascript
POST /api/reading/session/start
Body: {
  bookId: number
}
→ Creates: reading_sessions record
```

#### 7. **Quick Note** (`QuickNotes.jsx`)
```javascript
POST /api/notes/
Body: {
  bookId: number,
  noteText: string
}
→ Creates: quick_notes record
```

#### 8. **Support Ticket** (`SubmitTicket.jsx`)
```javascript
POST /api/tickets/
Body: {
  subject: string,
  category: string,
  message: string
}
→ Creates: tickets record
```

---

### READ Operations

#### 1. **Get All Books** (`AllBooks.jsx`)
```javascript
GET /api/books/?page=1&limit=20&category=biologi&sort=rating
→ Reads: books table
→ Filters: by category, sorts by criteria
→ Paginates: 20 books per page
```

#### 2. **Get Popular Books** (`PopularBooks.jsx`)
```javascript
GET /api/books/popular?limit=6
→ Reads: books table
→ Sorts: by rating and rating_count
→ Limits: 6 books
```

#### 3. **Get Book Details** (`BookDetailOverlay.jsx`)
```javascript
GET /api/books/:id
→ Reads: books table
→ Includes: average_rating, rating_count
```

#### 4. **Get User Bookmarks** (`UserDashboard.jsx`)
```javascript
GET /api/bookmarks/
→ Reads: bookmarks table
→ Joins: with books table
```

#### 5. **Get Reading Progress** (`ReadPage.jsx`, `ReadingProgress.jsx`)
```javascript
GET /api/reading/progress/:bookId
→ Reads: reading_progress table
```

#### 6. **Get Recent Reads** (`RecentReadBooks.jsx`)
```javascript
GET /api/reading/recent?limit=6
→ Reads: reading_progress table
→ Sorts: by last_read_at DESC
→ Limits: 6 books
```

#### 7. **Get Quick Notes** (`QuickNotes.jsx`)
```javascript
GET /api/notes/:bookId
→ Reads: quick_notes table
→ Filters: by bookId and userId
→ Sorts: by created_at DESC
```

#### 8. **Get Leaderboard** (`Leaderboard.jsx`)
```javascript
GET /api/leaderboard/books?limit=20
→ Reads: books table
→ Aggregates: average_rating, rating_count
→ Sorts: by rating DESC, rating_count DESC

GET /api/leaderboard/users?limit=20
→ Reads: users table
→ Sorts: by total_pages_read DESC
```

#### 9. **Get User Statistics** (`UserDashboard.jsx`)
```javascript
GET /api/users/stats
→ Reads: users table (total_pages_read, books_finished)
→ Reads: bookmarks table (count)
→ Reads: reading_progress table (recent books)
```

---

### UPDATE Operations

#### 1. **Update User Profile** (`UserDashboard.jsx`)
```javascript
PUT /api/users/profile
Body: {
  username: string,
  bio: string,
  avatar: File (optional)
}
→ Updates: users table
```

#### 2. **Update Book** (`AdminDashboard.jsx`)
```javascript
PUT /api/books/:id
Body: {
  title: string,
  author: string,
  description: string,
  category: string,
  cover: File (optional)
}
→ Updates: books table
```

#### 3. **Update Reading Progress** (`ReadPage.jsx`)
```javascript
PUT /api/reading/progress/:bookId
Body: {
  currentPage: number,
  furthestPage: number
}
→ Updates: reading_progress table
→ Updates: users.total_pages_read (if furthestPage increased)
```

#### 4. **End Reading Session** (`ReadPage.jsx`)
```javascript
PUT /api/reading/session/:id/end
Body: {
  duration: number (seconds)
}
→ Updates: reading_sessions table
```

#### 5. **Update Quick Note** (`QuickNotes.jsx`)
```javascript
PUT /api/notes/:id
Body: {
  noteText: string
}
→ Updates: quick_notes table
```

#### 6. **Update Ticket** (`AdminDashboard.jsx`)
```javascript
PUT /api/tickets/:id
Body: {
  status: string,
  adminResponse: string
}
→ Updates: tickets table
```

---

### DELETE Operations

#### 1. **Delete Book** (`AdminDashboard.jsx`)
```javascript
DELETE /api/books/:id
→ Deletes: books record
→ Cascades: book_ratings, bookmarks, reading_progress, quick_notes
```

#### 2. **Remove Bookmark** (Multiple components)
```javascript
DELETE /api/bookmarks/:bookId
→ Deletes: bookmarks record
```

#### 3. **Delete Rating** (`BookDetailOverlay.jsx`)
```javascript
DELETE /api/ratings/:bookId
→ Deletes: book_ratings record
→ Updates: books.average_rating, books.rating_count
```

#### 4. **Delete Quick Note** (`QuickNotes.jsx`)
```javascript
DELETE /api/notes/:id
→ Deletes: quick_notes record
```

---

## 📊 Data Aggregations & Calculations

### 1. **Book Average Rating**
- **Calculated from**: `book_ratings` table
- **Formula**: `AVG(rating) WHERE book_id = ?`
- **Updated**: Automatically via trigger or application logic when rating is created/updated/deleted
- **Used in**: `books.average_rating`, `books.rating_count`

### 2. **User Total Pages Read**
- **Calculated from**: `reading_progress.furthest_page` (MAX per book)
- **Formula**: `SUM(MAX(furthest_page) GROUP BY book_id)`
- **Updated**: When `reading_progress.furthest_page` increases
- **Used in**: `users.total_pages_read`, Leaderboard

### 3. **User Books Finished**
- **Calculated from**: `reading_progress` table
- **Formula**: `COUNT(*) WHERE user_id = ? AND is_finished = true`
- **Updated**: When `reading_progress.is_finished` changes to `true`
- **Used in**: `users.books_finished`, User Dashboard

### 4. **Reading Session Duration**
- **Calculated from**: `reading_sessions` table
- **Formula**: `EXTRACT(EPOCH FROM (end_time - start_time))`
- **Updated**: When session ends
- **Used in**: `reading_sessions.duration_seconds`, Reading Time component

---

## 🔐 Authentication & Authorization

### Protected Routes
- All routes except `/api/auth/register` and `/api/auth/login` require authentication
- Admin-only routes:
  - `POST /api/books/` (Create book)
  - `PUT /api/books/:id` (Update book)
  - `DELETE /api/books/:id` (Delete book)
  - `GET /api/tickets/admin` (View all tickets)
  - `PUT /api/tickets/:id` (Respond to ticket)
  - `GET /api/users/admin` (View all users)

### JWT Token
- Token stored in: `localStorage` or `httpOnly cookie`
- Token sent in: `Authorization: Bearer <token>` header
- Token expires: 24 hours (configurable)

---

## 📝 Notes

1. **File Storage**: EPUB/PDF files and cover images should be stored in cloud storage (AWS S3, Cloudinary) or local file system with proper path management.

2. **EPUB/PDF Parsing**: Use libraries like:
   - **EPUB**: `epubjs`, `epub-parser`
   - **PDF**: `pdfjs-dist`, `pdf-parse`
   - Extract: pages, title, author, description, metadata

3. **Real-time Updates**: Consider WebSocket for:
   - Reading progress updates
   - Live leaderboard updates
   - Real-time notifications

4. **Caching**: Implement caching for:
   - Popular books list
   - Leaderboard data
   - Book details

5. **Pagination**: All list endpoints should support pagination with `page` and `limit` query parameters.

6. **Search**: Implement full-text search for books (title, author, description) using database search features or Elasticsearch.

---

## 🚀 Implementation Priority

### Phase 1: Core Features
1. User authentication (register, login)
2. Book CRUD (Admin)
3. Book listing and details
4. Bookmark functionality

### Phase 2: Reading Features
1. Reading progress tracking
2. Reading sessions
3. Quick notes

### Phase 3: Social Features
1. Book ratings
2. Leaderboard
3. User statistics

### Phase 4: Support
1. Support tickets
2. Admin ticket management

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

