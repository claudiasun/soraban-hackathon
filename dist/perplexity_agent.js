"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const perplexity_ai_1 = require("@perplexity-ai/perplexity_ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new perplexity_ai_1.Perplexity({
    apiKey: process.env.PERPLEXITY_API_KEY || 'your-api-key-here'
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
    }
    catch (error) {
        console.error('Error:', error);
    }
}
main();
//# sourceMappingURL=perplexity_agent.js.map