"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const perplexity_ai_1 = require("@perplexity-ai/perplexity_ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Initialize Perplexity client
const client = new perplexity_ai_1.Perplexity({
    apiKey: process.env.PERPLEXITY_API_KEY || 'your-api-key-here'
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
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
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: 'Failed to perform search',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Serve all other routes to the React app
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
app.listen(PORT, () => {
    console.log(`🚀 Perplexity Agent UI running at http://localhost:${PORT}`);
    console.log(`📝 Make sure to set your PERPLEXITY_API_KEY in .env file`);
});
//# sourceMappingURL=server.js.map