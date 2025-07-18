import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
