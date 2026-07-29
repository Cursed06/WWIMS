import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Import Route Handlers
import posRouter from './routes/pos.js';
import nasabahRouter from './routes/nasabah.js';
import pricesRouter from './routes/prices.js';
import transactionsRouter from './routes/transactions.js';
import auditRouter from './routes/audit.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Next.js frontend calls
app.use(cors());

// Parse incoming request payloads as JSON
app.use(express.json());

// Routes Bindings
app.use('/api/pos', posRouter);
app.use('/api/nasabah', nasabahRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/audit', auditRouter);

// Basic Service Health Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'WWIMS Backend Service' });
});

// Global Fallback Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Launch server listener
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 WWIMS Backend Server active on port ${PORT}`);
  console.log(`====================================================`);
});
