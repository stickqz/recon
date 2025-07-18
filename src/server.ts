import express from 'express';
import dotenv from 'dotenv';
import { IdentityService } from './identityService';
import { IdentifyRequest } from './types';
import { initializeDatabase } from './initDb';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const identityService = new IdentityService();

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Database initialization endpoint for Render
app.post('/init-db', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ status: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ 
      error: 'Database initialization failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Database connection test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const { pool } = await import('./database');
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ status: 'Database connected', time: result.rows[0].current_time });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// System debug endpoint
app.get('/debug', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check file system
    const schemaExists = fs.existsSync(path.join(__dirname, '..', 'schema.sql'));
    const schemaContent = schemaExists ? fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8').substring(0, 200) : 'File not found';
    
    // Check environment
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
      PORT: process.env.PORT,
      __dirname: __dirname,
      cwd: process.cwd()
    };
    
    // Check database table existence
    let tableInfo = {};
    try {
      const { pool } = await import('./database');
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      tableInfo = { tables: tables.rows.map(r => r.table_name) };
    } catch (dbError) {
      tableInfo = { error: dbError instanceof Error ? dbError.message : 'Unknown DB error' };
    }
    
    res.json({
      status: 'Debug info',
      environment: envInfo,
      files: {
        schemaExists,
        schemaPreview: schemaContent
      },
      database: tableInfo
    });
  } catch (error) {
    res.status(500).json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/identify', async (req, res) => {
  try {
    const identifyRequest: IdentifyRequest = req.body;

    if (!identifyRequest.email && !identifyRequest.phoneNumber) {
      return res.status(400).json({
        error: 'Either email or phoneNumber must be provided',
      });
    }

    // Basic email validation
    if (identifyRequest.email && !isValidEmail(identifyRequest.email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Basic phone validation (commented out for demo)
    // if (identifyRequest.phoneNumber && !isValidPhoneNumber(identifyRequest.phoneNumber)) {
    //   return res.status(400).json({
    //     error: 'Invalid phone number format',
    //   });
    // }

    const result = await identityService.identify(identifyRequest);
    res.json(result);
  } catch (error) {
    console.error('Error in /identify endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phoneNumber: string): boolean {
  // More flexible phone number validation to match requirements
  const phoneRegex = /^[\+\-\d\s\(\)]+$/;
  return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 6;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
