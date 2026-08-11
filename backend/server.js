const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Order = require('./models/Order');
const { generateInvoicePDF } = require('./utils/invoiceGenerator');
const { protect } = require('./middleware/authMiddleware');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach Socket.IO to Express app for controllers to access
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Socket.IO Connection & Room Subscriptions
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined room order_${orderId}`);
  });

  socket.on('leave_order_room', (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`Socket ${socket.id} left room order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// PDF Invoice Download Route
app.get('/api/orders/:id/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this invoice' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order._id}.pdf`);

    generateInvoicePDF(
      order,
      (chunk) => res.write(chunk),
      () => res.end()
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Naivadyam API Server Running', timestamp: new Date() });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Naivadyam Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.log(`🔄 Attempting to kill the process on port ${PORT} and restart...\n`);
    const { execSync } = require('child_process');
    try {
      // Kill whatever is holding the port (Windows)
      execSync(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT} ^| findstr LISTENING') do taskkill /F /PID %a`, { shell: 'cmd.exe', stdio: 'inherit' });
    } catch (_) { /* ignore if no process found */ }
    setTimeout(() => {
      server.close();
      server.listen(PORT, () => {
        console.log(`✅ Naivadyam Server restarted successfully on port ${PORT}`);
      });
    }, 1000);
  } else {
    throw err;
  }
});
