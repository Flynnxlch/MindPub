const { promisePool } = require('../config/database');

class Rating {
  // Create or update rating
  static async upsert(userId, bookId, rating) {
    const [result] = await promisePool.execute(
      `INSERT INTO book_ratings (user_id, book_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [userId, bookId, rating]
    );
    return result;
  }

  // Get user's rating for a book
  static async getUserRating(userId, bookId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM book_ratings WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    return rows[0];
  }

  // Delete rating
  static async delete(userId, bookId) {
    const [result] = await promisePool.execute(
      'DELETE FROM book_ratings WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    return result.affectedRows > 0;
  }

  // Get all ratings for a book
  static async getBookRatings(bookId) {
    const [rows] = await promisePool.execute(
      `SELECT br.*, u.username, u.avatar_url 
       FROM book_ratings br
       JOIN users u ON br.user_id = u.id
       WHERE br.book_id = ?
       ORDER BY br.created_at DESC`,
      [bookId]
    );
    return rows;
  }
}

module.exports = Rating;

