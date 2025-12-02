const { promisePool } = require('../config/database');

class Bookmark {
  // Create bookmark
  static async create(userId, bookId) {
    try {
      const [result] = await promisePool.execute(
        'INSERT INTO bookmarks (user_id, book_id) VALUES (?, ?)',
        [userId, bookId]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Bookmark already exists');
      }
      throw error;
    }
  }

  // Delete bookmark
  static async delete(userId, bookId) {
    const [result] = await promisePool.execute(
      'DELETE FROM bookmarks WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    return result.affectedRows > 0;
  }

  // Check if bookmark exists
  static async exists(userId, bookId) {
    const [rows] = await promisePool.execute(
      'SELECT id FROM bookmarks WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    return rows.length > 0;
  }

  // Get user's bookmarks
  static async getUserBookmarks(userId) {
    const [rows] = await promisePool.execute(
      `SELECT b.*, bk.created_at as bookmarked_at 
       FROM bookmarks bk
       JOIN books b ON bk.book_id = b.id
       WHERE bk.user_id = ? AND b.status = 'published'
       ORDER BY bk.created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = Bookmark;

