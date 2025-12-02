const { promisePool } = require('../config/database');

class Note {
  // Create note
  static async create(userId, bookId, noteText, pageNumber = null) {
    // Get reading progress id
    const [progressRows] = await promisePool.execute(
      'SELECT id FROM reading_progress WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );
    
    const readingProgressId = progressRows[0]?.id || null;
    
    const [result] = await promisePool.execute(
      'INSERT INTO quick_notes (user_id, book_id, reading_progress_id, note_text, page_number) VALUES (?, ?, ?, ?, ?)',
      [userId, bookId, readingProgressId, noteText, pageNumber]
    );
    
    return result.insertId;
  }

  // Get note by ID
  static async findById(id) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM quick_notes WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get notes for a book
  static async getBookNotes(userId, bookId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM quick_notes WHERE user_id = ? AND book_id = ? ORDER BY created_at DESC',
      [userId, bookId]
    );
    return rows;
  }

  // Get all user notes
  static async getUserNotes(userId) {
    const [rows] = await promisePool.execute(
      `SELECT qn.*, b.title as book_title, b.author as book_author
       FROM quick_notes qn
       JOIN books b ON qn.book_id = b.id
       WHERE qn.user_id = ?
       ORDER BY qn.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Update note
  static async update(id, userId, noteText) {
    const [result] = await promisePool.execute(
      'UPDATE quick_notes SET note_text = ? WHERE id = ? AND user_id = ?',
      [noteText, id, userId]
    );
    return result.affectedRows > 0;
  }

  // Delete note
  static async delete(id, userId) {
    const [result] = await promisePool.execute(
      'DELETE FROM quick_notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Note;

