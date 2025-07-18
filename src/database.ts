import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

// Railway provides DATABASE_URL, but we also support individual env vars
const getDbConfig = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'identity_reconciliation',
  };
};

export const createConnection = async (): Promise<mysql.Connection> => {
  try {
    const dbConfig = getDbConfig();
    const connection = await mysql.createConnection(dbConfig as any);
    console.log('Connected to MySQL database');
    return connection;
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    throw error;
  }
};

export const pool = mysql.createPool({
  ...(process.env.DATABASE_URL 
    ? { uri: process.env.DATABASE_URL } 
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'identity_reconciliation',
      }),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
