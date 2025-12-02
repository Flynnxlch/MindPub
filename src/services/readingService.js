import api from './api';

export const readingService = {
  // Get reading progress
  getProgress: async (userId, bookId) => {
    const response = await api.get(`/reading/progress/${bookId}`, {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Update reading progress
  updateProgress: async (userId, bookId, progressData) => {
    const response = await api.put(`/reading/progress/${bookId}`, {
      user_id: userId,
      ...progressData
    });
    return response.data;
  },

  // Get recent reads
  getRecentReads: async (userId, limit = 6) => {
    const response = await api.get('/reading/recent', {
      params: { user_id: userId, limit }
    });
    return response.data;
  },

  // Get all user progress
  getUserProgress: async (userId) => {
    const response = await api.get('/reading/all', {
      params: { user_id: userId }
    });
    return response.data;
  }
};

