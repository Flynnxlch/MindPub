import api from './api';

export const bookmarkService = {
  // Get user bookmarks
  getUserBookmarks: async (userId) => {
    const response = await api.get('/bookmarks', {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Toggle bookmark
  toggleBookmark: async (userId, bookId) => {
    const response = await api.post('/bookmarks/toggle', {
      user_id: userId,
      bookId
    });
    return response.data;
  },

  // Add bookmark
  addBookmark: async (userId, bookId) => {
    const response = await api.post('/bookmarks', {
      user_id: userId,
      bookId
    });
    return response.data;
  },

  // Remove bookmark
  removeBookmark: async (userId, bookId) => {
    const response = await api.delete(`/bookmarks/${bookId}`, {
      data: { user_id: userId }
    });
    return response.data;
  }
};

