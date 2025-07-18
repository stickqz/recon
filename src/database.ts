import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Render and other platforms provide DATABASE_URL, but we also support individual env vars
const getDbConfig = (): PoolConfig => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'identity_reconciliation',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};

export const pool = new Pool(getDbConfig());

export const createConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    return pool;
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    throw error;
  }
};

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('PostgreSQL pool error:', err);
});
