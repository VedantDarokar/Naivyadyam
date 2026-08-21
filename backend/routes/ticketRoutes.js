const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/authMiddleware');

const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');
const { sendTicketCreatedNotification } = require('../utils/otpService');

const isDbReady = () => mongoose.connection.readyState === 1;

// @desc Create ticket
// @route POST /api/tickets
router.post('/', protect, async (req, res) => {
  try {
    const { subject, message, orderId, priority } = req.body;
    let createdTicket;

    if (isDbReady()) {
      const ticket = new Ticket({
        user: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        orderId: orderId || '',
        subject,
        message,
        priority: priority || 'Medium'
      });
      createdTicket = await ticket.save();
    } else {
      createdTicket = {
        _id: 'tk_' + Date.now(),
        user: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        orderId: orderId || '',
        subject,
        message,
        priority: priority || 'Medium',
        status: 'Open',
        response: '',
        createdAt: new Date()
      };
      if (!memoryStore.tickets) memoryStore.tickets = [];
      memoryStore.tickets.unshift(createdTicket);
    }

    // Trigger async email notifications to admin & customer
    sendTicketCreatedNotification(createdTicket).catch(err => {
      console.error('Ticket creation notification email error:', err.message);
    });

    res.status(201).json(createdTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc Get user tickets
// @route GET /api/tickets/mytickets or /api/tickets/my
const getUserTickets = async (req, res) => {
  try {
    if (isDbReady()) {
      const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(tickets);
    } else {
      const userTickets = (memoryStore.tickets || []).filter(
        t => t.user.toString() === req.user._id.toString() || t.userEmail === req.user.email
      );
      res.json(userTickets);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get('/mytickets', protect, getUserTickets);
router.get('/my', protect, getUserTickets);

module.exports = router;
