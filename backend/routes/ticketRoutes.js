const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');

// GET /api/tickets - Get user's tickets
router.get('/', TicketController.getUserTickets);

// GET /api/tickets/admin/all - Get all tickets (admin)
router.get('/admin/all', TicketController.getAllTickets);

// GET /api/tickets/:id - Get ticket by ID
router.get('/:id', TicketController.getTicketById);

// POST /api/tickets - Create ticket
router.post('/', TicketController.createTicket);

// PUT /api/tickets/:id - Update ticket (admin response)
router.put('/:id', TicketController.updateTicket);

// DELETE /api/tickets/:id - Delete ticket
router.delete('/:id', TicketController.deleteTicket);

module.exports = router;

