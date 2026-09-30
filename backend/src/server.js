require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

const normalizeOrigin = (value) => {
  if (!value) return value;
  try {
    const url = new URL(value.trim());
    return url.origin;
  } catch {
    return value.trim().replace(/\/$/, '');
  }
};

const configuredOrigins = [
  ...(process.env.CLIENT_URL || '').split(','),
  ...(process.env.FRONTEND_URL || '').split(',')
]
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  ...configuredOrigins
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Ledger API' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use((err, req, res, next) => {
  if (err.message === 'CORS origin not allowed') {
    return res.status(403).json({ message: err.message });
  }
  return res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
});