import dotenv from 'dotenv';
import { connectDatabase, sequelize } from '../models/index.js';

dotenv.config();

async function syncDatabase() {
  try {
    await connectDatabase();
    console.log('Database sync completed successfully.');
  } catch (err) {
    console.error('Database sync failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
