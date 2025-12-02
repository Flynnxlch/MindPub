const { promisePool } = require('../config/database');

class Ticket {
  // Create ticket
  static async create(userId, ticketData) {
    const { subject, category, message } = ticketData;
    
    const [result] = await promisePool.execute(
      'INSERT INTO tickets (user_id, subject, category, message) VALUES (?, ?, ?, ?)',
      [userId, subject, category, message]
    );
    
    return result.insertId;
  }

  // Get ticket by ID
  static async findById(id) {
    const [rows] = await promisePool.execute(
      `SELECT t.*, u.username as user_name, u.email as user_email,
              a.username as responded_by_name
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.responded_by = a.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get user's tickets
  static async getUserTickets(userId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  // Get all tickets (admin)
  static async getAll(status = null) {
    let query = `
      SELECT t.*, u.username as user_name, u.email as user_email
      FROM tickets t
      JOIN users u ON t.user_id = u.id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const [rows] = await promisePool.execute(query, params);
    return rows;
  }

  // Update ticket (admin response)
  static async update(id, updateData, adminId) {
    const { status, adminResponse } = updateData;
    
    const [result] = await promisePool.execute(
      'UPDATE tickets SET status = ?, admin_response = ?, responded_by = ? WHERE id = ?',
      [status, adminResponse, adminId, id]
    );
    
    return result.affectedRows > 0;
  }

  // Delete ticket
  static async delete(id) {
    const [result] = await promisePool.execute(
      'DELETE FROM tickets WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Ticket;

