const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/authMiddleware');

// @desc Create ticket
// @route POST /api/tickets
router.post('/', protect, async (req, res) => {
  try {
    const { subject, message, orderId, priority } = req.body;
    const ticket = new Ticket({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      orderId: orderId || '',
      subject,
      message,
      priority: priority || 'Medium'
    });
    const createdTicket = await ticket.save();
    res.status(201).json(createdTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Get user tickets
// @route GET /api/tickets/mytickets
router.get('/mytickets', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
