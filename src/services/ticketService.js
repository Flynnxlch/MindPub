import api from './api';

export const ticketService = {
  // Get user tickets
  getUserTickets: async (userId) => {
    const response = await api.get('/tickets', {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Get all tickets (admin)
  getAllTickets: async (status = null) => {
    const response = await api.get('/tickets/admin/all', {
      params: { status }
    });
    return response.data;
  },

  // Create ticket
  createTicket: async (userId, ticketData) => {
    const response = await api.post('/tickets', {
      user_id: userId,
      ...ticketData
    });
    return response.data;
  },

  // Update ticket (admin)
  updateTicket: async (adminId, ticketId, updateData) => {
    const response = await api.put(`/tickets/${ticketId}`, {
      admin_id: adminId,
      ...updateData
    });
    return response.data;
  },

  // Delete ticket (admin)
  deleteTicket: async (ticketId) => {
    const response = await api.delete(`/tickets/${ticketId}`);
    return response.data;
  }
};

