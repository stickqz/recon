import express from 'express';
import { IdentityService } from './identityService';
import { IdentifyRequest } from './types';

const app = express();
const port = 3000;

app.use(express.json());

const identityService = new IdentityService();

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/identify', async (req, res) => {
  try {
    const identifyRequest: IdentifyRequest = req.body;

    if (!identifyRequest.email && !identifyRequest.phoneNumber) {
      return res.status(400).json({
        error: 'Either email or phoneNumber must be provided',
      });
    }

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
