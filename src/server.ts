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
    res.status(500).json({ error: 'Database initialization failed' });
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
