const Ticket = require('../models/Ticket');

class TicketController {
  // Get user's tickets
  static async getUserTickets(req, res) {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const tickets = await Ticket.getUserTickets(user_id);
      
      res.json({
        success: true,
        tickets
      });
      
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tickets',
        error: error.message
      });
    }
  }

  // Get all tickets (admin)
  static async getAllTickets(req, res) {
    try {
      const { status } = req.query;
      const tickets = await Ticket.getAll(status);
      
      res.json({
        success: true,
        tickets
      });
      
    } catch (error) {
      console.error('Get all tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tickets',
        error: error.message
      });
    }
  }

  // Get ticket by ID
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findById(id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      res.json({
        success: true,
        ticket
      });
      
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching ticket',
        error: error.message
      });
    }
  }

  // Create ticket
  static async createTicket(req, res) {
    try {
      const { user_id, subject, category, message } = req.body;
      
      if (!user_id || !subject || !category || !message) {
        return res.status(400).json({
          success: false,
          message: 'user_id, subject, category, and message are required'
        });
      }
      
      const ticketId = await Ticket.create(user_id, {
        subject,
        category,
        message
      });
      
      const ticket = await Ticket.findById(ticketId);
      
      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        ticket
      });
      
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating ticket',
        error: error.message
      });
    }
  }

  // Update ticket (admin response)
  static async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const { admin_id, status, adminResponse } = req.body;
      
      if (!admin_id) {
        return res.status(400).json({
          success: false,
          message: 'Admin ID is required'
        });
      }
      
      const success = await Ticket.update(id, {
        status,
        adminResponse
      }, admin_id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      const ticket = await Ticket.findById(id);
      
      res.json({
        success: true,
        message: 'Ticket updated successfully',
        ticket
      });
      
    } catch (error) {
      console.error('Update ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating ticket',
        error: error.message
      });
    }
  }

  // Delete ticket
  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      const success = await Ticket.delete(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Ticket deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting ticket',
        error: error.message
      });
    }
  }
}

module.exports = TicketController;

