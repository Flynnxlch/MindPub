import api from './api';

export const ratingService = {
  // Get user rating for book
  getUserRating: async (userId, bookId) => {
    const response = await api.get(`/ratings/${bookId}`, {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Get all ratings for book
  getBookRatings: async (bookId) => {
    const response = await api.get(`/ratings/${bookId}/all`);
    return response.data;
  },

  // Add or update rating
  upsertRating: async (userId, bookId, rating) => {
    const response = await api.post('/ratings', {
      user_id: userId,
      bookId,
      rating
    });
    return response.data;
  },

  // Delete rating
  deleteRating: async (userId, bookId) => {
    const response = await api.delete(`/ratings/${bookId}`, {
      data: { user_id: userId }
    });
    return response.data;
  }
};

