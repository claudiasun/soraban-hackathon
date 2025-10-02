import express from 'express';
import cors from 'cors';
import path from 'path';
import { Perplexity } from '@perplexity-ai/perplexity_ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Perplexity client
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY environment variable is required');
  process.exit(1);
}

const client = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Convert single query to array format expected by Perplexity
    const queries = Array.isArray(query) ? query : [query];
    
    const search = await client.search.create({
      query: queries
    });

    res.json({
      success: true,
      results: search.results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve all other routes to the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Perplexity Agent UI running at http://localhost:${PORT}`);
  console.log(`📝 Make sure to set your PERPLEXITY_API_KEY in .env file`);
});
