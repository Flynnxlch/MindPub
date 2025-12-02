import api from './api';

export const bookService = {
  // Get all books
  getAllBooks: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
  },

  // Get popular books
  getPopularBooks: async (limit = 6) => {
    const response = await api.get('/books/popular', { params: { limit } });
    return response.data;
  },

  // Get recommended books
  getRecommendedBooks: async (limit = 4) => {
    const response = await api.get('/books/recommended', { params: { limit } });
    return response.data;
  },

  // Get book by ID
  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  // Get book page content
  getBookPage: async (bookId, pageNumber) => {
    const response = await api.get(`/books/${bookId}/pages/${pageNumber}`);
    return response.data;
  },

  // Get page range
  getPageRange: async (bookId, start, end) => {
    const response = await api.get(`/books/${bookId}/pages`, {
      params: { start, end }
    });
    return response.data;
  },

  // Upload book (Admin)
  uploadBook: async (formData) => {
    const response = await api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update book
  updateBook: async (id, formData) => {
    const response = await api.put(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete book
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/books/categories');
    return response.data;
  },

  // Preview file metadata (before upload)
  previewFile: async (formData) => {
    const response = await api.post('/books/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

