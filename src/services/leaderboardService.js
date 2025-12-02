import api from './api';

export const leaderboardService = {
  // Get top books
  getTopBooks: async (limit = 20) => {
    const response = await api.get('/leaderboard/books', {
      params: { limit }
    });
    return response.data;
  },

  // Get top users
  getTopUsers: async (limit = 20) => {
    const response = await api.get('/leaderboard/users', {
      params: { limit }
    });
    return response.data;
  },

  // Get platform statistics
  getPlatformStats: async () => {
    const response = await api.get('/leaderboard/stats');
    return response.data;
  }
};

