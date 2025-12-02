const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await promisePool.execute(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    
    return result.insertId;
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await promisePool.execute(
      'SELECT id, username, email, role, bio, avatar_url, total_pages_read, books_finished, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  static async update(id, userData) {
    const { username, bio, avatar_url } = userData;
    const [result] = await promisePool.execute(
      'UPDATE users SET username = ?, bio = ?, avatar_url = ? WHERE id = ?',
      [username, bio, avatar_url, id]
    );
    return result.affectedRows > 0;
  }

  // Update pages read
  static async updatePagesRead(userId, pagesIncrement) {
    const [result] = await promisePool.execute(
      'UPDATE users SET total_pages_read = total_pages_read + ? WHERE id = ?',
      [pagesIncrement, userId]
    );
    return result.affectedRows > 0;
  }

  // Update books finished
  static async incrementBooksFinished(userId) {
    const [result] = await promisePool.execute(
      'UPDATE users SET books_finished = books_finished + 1 WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  // Get user statistics
  static async getStats(userId) {
    const [rows] = await promisePool.execute(`
      SELECT 
        u.total_pages_read,
        u.books_finished,
        COUNT(DISTINCT b.id) as bookmarks_count,
        COUNT(DISTINCT rp.id) as reading_count
      FROM users u
      LEFT JOIN bookmarks b ON u.id = b.user_id
      LEFT JOIN reading_progress rp ON u.id = rp.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);
    return rows[0];
  }

  // Get all users (admin)
  static async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await promisePool.execute(
      `SELECT id, username, email, role, total_pages_read, books_finished, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    const [countRows] = await promisePool.execute('SELECT COUNT(*) as total FROM users');
    
    return {
      users: rows,
      total: countRows[0].total,
      page,
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  }
}

module.exports = User;

