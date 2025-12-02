const { promisePool } = require('../config/database');

class BookPage {
  // Save parsed pages
  static async savePages(bookId, pages) {
    const values = pages.map(page => [bookId, page.pageNumber, page.content]);
    
    if (values.length === 0) {
      console.warn('No pages to save for book:', bookId);
      return;
    }
    
    console.log(`Saving ${values.length} pages to database for book ${bookId}...`);
    
    // Batch insert dalam chunks untuk menghindari query terlalu besar
    // MySQL memiliki limit ~65,535 placeholders, jadi kita gunakan 1000 per batch
    const batchSize = 1000;
    
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      const placeholders = batch.map(() => '(?, ?, ?)').join(', ');
      const flatValues = batch.flat();
      
      try {
        await promisePool.execute(
          `INSERT INTO book_pages (book_id, page_number, content) VALUES ${placeholders}
           ON DUPLICATE KEY UPDATE content = VALUES(content)`,
          flatValues
        );
        console.log(`Saved batch ${Math.floor(i / batchSize) + 1}: pages ${i + 1} to ${Math.min(i + batchSize, values.length)}`);
      } catch (error) {
        console.error(`Error saving pages batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
    }
    
    console.log(`Successfully saved all ${values.length} pages for book ${bookId}`);
  }

  // Get single page
  static async getPage(bookId, pageNumber) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM book_pages WHERE book_id = ? AND page_number = ?',
      [bookId, pageNumber]
    );
    return rows[0];
  }

  // Get page range
  static async getPageRange(bookId, startPage, endPage) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM book_pages WHERE book_id = ? AND page_number BETWEEN ? AND ? ORDER BY page_number',
      [bookId, startPage, endPage]
    );
    return rows;
  }

  // Get total pages for a book
  static async getTotalPages(bookId) {
    const [rows] = await promisePool.execute(
      'SELECT COUNT(*) as total FROM book_pages WHERE book_id = ?',
      [bookId]
    );
    return rows[0].total;
  }

  // Delete all pages for a book
  static async deleteByBookId(bookId) {
    await promisePool.execute(
      'DELETE FROM book_pages WHERE book_id = ?',
      [bookId]
    );
  }
}

module.exports = BookPage;

