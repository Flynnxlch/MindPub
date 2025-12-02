import api from './api';

export const userService = {
  // Get user profile
  getProfile: async (userId) => {
    const response = await api.get('/users/profile', {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.avatar) formData.append('avatar', profileData.avatar);

    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get user statistics
  getStats: async (userId) => {
    const response = await api.get('/users/stats', {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Get all users (admin)
  getAllUsers: async (page = 1, limit = 20) => {
    const response = await api.get('/users/admin/all', {
      params: { page, limit }
    });
    return response.data;
  }
};

