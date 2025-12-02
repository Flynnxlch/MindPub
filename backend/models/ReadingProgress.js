const { promisePool } = require('../config/database');

class ReadingProgress {
  // Create or update progress
  static async upsert(userId, bookId, progressData) {
    const { currentPage, furthestPage, totalPages } = progressData;
    const progressPercentage = ((furthestPage / totalPages) * 100).toFixed(2);
    const isFinished = furthestPage >= totalPages;
    
    const [result] = await promisePool.execute(
      `INSERT INTO reading_progress (user_id, book_id, current_page, furthest_page, total_pages, progress_percentage, is_finished)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         current_page = VALUES(current_page),
         furthest_page = GREATEST(furthest_page, VALUES(furthest_page)),
         progress_percentage = VALUES(progress_percentage),
         is_finished = VALUES(is_finished),
         last_read_at = CURRENT_TIMESTAMP`,
      [userId, bookId, currentPage, furthestPage, totalPages, progressPercentage, isFinished]
    );
    
    return result;
  }

  // Get progress for a book
  static async getProgress(userId, bookId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM reading_progress WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    return rows[0];
  }

  // Get recent reads
  static async getRecentReads(userId, limit = 6) {
    const [rows] = await promisePool.execute(
      `SELECT b.*, rp.current_page, rp.furthest_page, rp.progress_percentage, 
              rp.is_finished, rp.last_read_at
       FROM reading_progress rp
       JOIN books b ON rp.book_id = b.id
       WHERE rp.user_id = ? AND b.status = 'published'
       ORDER BY rp.last_read_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  // Get all user's reading progress
  static async getUserProgress(userId) {
    const [rows] = await promisePool.execute(
      `SELECT b.*, rp.current_page, rp.furthest_page, rp.progress_percentage, rp.is_finished
       FROM reading_progress rp
       JOIN books b ON rp.book_id = b.id
       WHERE rp.user_id = ? AND b.status = 'published'
       ORDER BY rp.last_read_at DESC`,
      [userId]
    );
    return rows;
  }

  // Delete progress
  static async delete(userId, bookId) {
    const [result] = await promisePool.execute(
      'DELETE FROM reading_progress WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ReadingProgress;

