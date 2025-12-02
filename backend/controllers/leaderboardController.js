const { promisePool } = require('../config/database');

class LeaderboardController {
  // Get top rated books
  static async getTopBooks(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      
      const [books] = await promisePool.execute(
        `SELECT * FROM books 
         WHERE status = 'published' AND rating_count > 0
         ORDER BY average_rating DESC, rating_count DESC 
         LIMIT ?`,
        [limit]
      );
      
      res.json({
        success: true,
        books
      });
      
    } catch (error) {
      console.error('Get top books error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching top books',
        error: error.message
      });
    }
  }

  // Get top users (by pages read)
  static async getTopUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      
      const [users] = await promisePool.execute(
        `SELECT id, username, avatar_url, total_pages_read, books_finished
         FROM users 
         WHERE total_pages_read > 0
         ORDER BY total_pages_read DESC, books_finished DESC 
         LIMIT ?`,
        [limit]
      );
      
      res.json({
        success: true,
        users
      });
      
    } catch (error) {
      console.error('Get top users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching top users',
        error: error.message
      });
    }
  }

  // Get platform statistics
  static async getPlatformStats(req, res) {
    try {
      // Total books
      const [bookCount] = await promisePool.execute(
        'SELECT COUNT(*) as total FROM books WHERE status = "published"'
      );
      
      // Total users
      const [userCount] = await promisePool.execute(
        'SELECT COUNT(*) as total FROM users'
      );
      
      // Total pages read
      const [pagesRead] = await promisePool.execute(
        'SELECT SUM(total_pages_read) as total FROM users'
      );
      
      // Total ratings
      const [ratingCount] = await promisePool.execute(
        'SELECT COUNT(*) as total FROM book_ratings'
      );
      
      res.json({
        success: true,
        stats: {
          totalBooks: bookCount[0].total,
          totalUsers: userCount[0].total,
          totalPagesRead: pagesRead[0].total || 0,
          totalRatings: ratingCount[0].total
        }
      });
      
    } catch (error) {
      console.error('Get platform stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching platform statistics',
        error: error.message
      });
    }
  }
}

module.exports = LeaderboardController;

