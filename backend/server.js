import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { generateFeedback } from './api/generate-feedback/route.js';
import { updateOverallRating } from './api/update-overall-rating/route.js';

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));


// Define a basic GET route for the root
app.get('/', (req, res) => {
  res.send('Backend is working');
});

// API Routes
app.post('/api/generate-feedback', generateFeedback);
app.post('/api/update-overall-rating', updateOverallRating);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});