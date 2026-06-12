import express from 'express';
import cors from 'cors';
import { connectDatabase } from './models/index.js';
import { connectRedis, getRedisClient } from './config/redis.js';
import authRouter from './routes/auth.js';
import accountsRouter from './routes/accounts.js';
import transactionsRouter from './routes/transactions.js';
import transfersRouter from './routes/transfers.js';
import budgetsRouter from './routes/budgets.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Expense Tracker API is running',
    redis: getRedisClient() ? 'connected' : 'disabled',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/dashboard', dashboardRouter);

async function startServer() {
  try {
    await connectDatabase();
    await connectRedis();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    console.error('Check your database connection settings in Backend/.env');
    process.exit(1);
  }
}

startServer();
