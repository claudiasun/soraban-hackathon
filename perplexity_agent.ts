import { Perplexity } from '@perplexity-ai/perplexity_ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY environment variable is required');
  process.exit(1);
}

const client = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY
});

async function main() {
  try {
    const search = await client.search.create({
      query: [
        "What is Comet Browser?",
        "Perplexity AI",
        "Perplexity Changelog"
      ]
    });

    search.results.forEach(result => {
      console.log(`${result.title}: ${result.url}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
