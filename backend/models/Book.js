const { promisePool } = require('../config/database');

class Book {
  // Create new book
  static async create(bookData) {
    const {
      title, author, description, category, pages,
      cover_url, cover_color, file_url, file_type,
      release_date, uploaded_by
    } = bookData;
    
    const [result] = await promisePool.execute(
      `INSERT INTO books (title, author, description, category, pages, cover_url, cover_color, file_url, file_type, release_date, uploaded_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, description, category, pages, cover_url, cover_color, file_url, file_type, release_date, uploaded_by]
    );
    
    return result.insertId;
  }

  // Find book by ID
  static async findById(id) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get all books with filters
  static async findAll(filters = {}) {
    const { page = 1, limit = 20, category, sort = 'created_at', search } = filters;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM books WHERE status = "published"';
    let countQuery = 'SELECT COUNT(*) as total FROM books WHERE status = "published"';
    const params = [];
    const countParams = [];
    
    // Category filter
    if (category) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }
    
    // Search filter
    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
      countQuery += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Sort
    const validSorts = ['created_at', 'title', 'average_rating', 'total_reads'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    query += ` ORDER BY ${sortField} DESC`;
    
    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await promisePool.execute(query, params);
    const [countRows] = await promisePool.execute(countQuery, countParams);
    
    return {
      books: rows,
      total: countRows[0].total,
      page,
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  }

  // Get popular books
  static async getPopular(limit = 6) {
    const [rows] = await promisePool.execute(
      `SELECT * FROM books 
       WHERE status = "published" 
       ORDER BY average_rating DESC, rating_count DESC 
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Get recommended books
  static async getRecommended(limit = 4) {
    const [rows] = await promisePool.execute(
      `SELECT * FROM books 
       WHERE status = "published" 
       ORDER BY RAND() 
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Update book
  static async update(id, bookData) {
    const {
      title, author, description, category,
      cover_url, cover_color, status
    } = bookData;
    
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (author !== undefined) {
      updates.push('author = ?');
      values.push(author);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (cover_url !== undefined) {
      updates.push('cover_url = ?');
      values.push(cover_url);
    }
    if (cover_color !== undefined) {
      updates.push('cover_color = ?');
      values.push(cover_color);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (updates.length === 0) {
      return false; // No fields to update
    }
    
    values.push(id);
    
    const [result] = await promisePool.execute(
      `UPDATE books SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Delete book
  static async delete(id) {
    const [result] = await promisePool.execute(
      'DELETE FROM books WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Increment total reads
  static async incrementReads(bookId) {
    await promisePool.execute(
      'UPDATE books SET total_reads = total_reads + 1 WHERE id = ?',
      [bookId]
    );
  }

  // Get all categories
  static async getCategories() {
    const [rows] = await promisePool.execute(
      'SELECT DISTINCT category FROM books WHERE status = "published" ORDER BY category'
    );
    return rows.map(row => row.category);
  }
}

module.exports = Book;

