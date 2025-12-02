import api from './api';

export const noteService = {
  // Get book notes
  getBookNotes: async (userId, bookId) => {
    const response = await api.get(`/notes/book/${bookId}`, {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Get all user notes
  getUserNotes: async (userId) => {
    const response = await api.get('/notes/user', {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Create note
  createNote: async (userId, bookId, noteText, pageNumber = null) => {
    const response = await api.post('/notes', {
      user_id: userId,
      bookId,
      noteText,
      pageNumber
    });
    return response.data;
  },

  // Update note
  updateNote: async (userId, noteId, noteText) => {
    const response = await api.put(`/notes/${noteId}`, {
      user_id: userId,
      noteText
    });
    return response.data;
  },

  // Delete note
  deleteNote: async (userId, noteId) => {
    const response = await api.delete(`/notes/${noteId}`, {
      data: { user_id: userId }
    });
    return response.data;
  }
};

