const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Order = require('./models/Order');
const { generateInvoicePDF } = require('./utils/invoiceGenerator');
const { protect } = require('./middleware/authMiddleware');

const app = express();
const server = http.createServer(app);

// Enable trust proxy for Render / Vercel / Heroku reverse proxies
app.set('trust proxy', 1);

// Disable x-powered-by header
app.disable('x-powered-by');

// 1. HTTP Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Allows frontend asset delivery
}));

// 2. Express 5 Compatible NoSQL Query Injection Protection
const sanitizeNoSql = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeNoSql(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeNoSql(req.body);
  if (req.params) sanitizeNoSql(req.params);
  next();
});

// 3. CORS Configuration supporting Vercel and production origins
const allowedOrigins = [
  'https://naivyadyam.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow in production to prevent CORS lockouts
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));



// 4. Rate Limiting Protection (Behind Proxy)
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 auth/OTP requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification or authentication attempts. Please try again in 15 minutes.' }
});

// Apply rate limiters
app.use('/api', generalApiLimiter);
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/send-registration-otp', authRateLimiter);
app.use('/api/auth/forgot-password', authRateLimiter);
app.use('/api/auth/reset-password', authRateLimiter);
app.use('/api/auth/contact', authRateLimiter);

// Parse JSON & URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  transports: ['polling', 'websocket']
});

// Attach Socket.IO to Express app for controllers to access
app.set('socketio', io);

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
  res.json({
    status: 'OK',
    env: process.env.NODE_ENV || 'production',
    message: 'Naivadyam Secure Production API Server Running',
    timestamp: new Date()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🔒 Naivadyam Production-Secured Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.log(`🔄 Attempting to kill the process on port ${PORT} and restart...\n`);
    const { execSync } = require('child_process');
    try {
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
