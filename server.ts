import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Check for API key
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY environment variable is required');
  process.exit(1);
}

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Perplexity Agent Client - mimics Python SDK interface
class PerplexityAgent {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.perplexity.ai/chat/completions';
  }

  async chatCompletionsCreate(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    max_tokens?: number;
    temperature?: number;
    web_search_options?: {
      search_domain_filter?: string[];
      search_recency_filter?: string;
    };
  }) {
    const requestBody: any = {
      model: params.model,
      messages: params.messages,
      max_tokens: params.max_tokens || 500,
      temperature: params.temperature || 0.2,
      return_citations: true,
      return_related_questions: false,
    };

    // Add web search options if provided
    if (params.web_search_options) {
      requestBody.web_search_options = params.web_search_options;
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }
}

// Initialize Perplexity Agent
const perplexityAgent = new PerplexityAgent(PERPLEXITY_API_KEY);

// API Routes
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const completion = await perplexityAgent.chatCompletionsCreate({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a concise research assistant. Provide brief, accurate answers with key facts.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 300,
      temperature: 0.1
    });

    res.json({
      success: true,
      answer: completion.choices[0].message.content,
      citations: completion.citations || []
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI Assistant endpoint for questionnaire template help
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { userInput, actionType, sectionName, sectionId } = req.body;
    
    if (!userInput && !actionType) {
      return res.status(400).json({ error: 'Either userInput or actionType is required' });
    }

    let systemPrompt = '';
    let userPrompt = '';
    let maxTokens = 600;
    let searchDomainFilter = [
      'irs.gov',
      'aicpa.org',
      'tax.thomsonreuters.com',
      'taxnotes.com'
    ];
    let searchRecencyFilter = 'year';
    let model = 'sonar';
    
    // Generate context-aware prompts based on action type
    if (actionType === 'add-questions') {
      systemPrompt = 'You are a tax questionnaire expert. Generate practical, specific questions. Be concise - list 5-7 questions only, no explanations.';
      userPrompt = `Generate 5-7 essential questions for a tax questionnaire section: "${sectionName}". Focus on:
1. Required documentation
2. Key tax-relevant details
3. Deadlines and amounts

Format: Return only a numbered list of questions, nothing else.`;
      maxTokens = 400;
      
    } else if (actionType === 'improve') {
      systemPrompt = 'You are a UX expert for tax forms. Provide 3-5 specific, actionable improvements. Be direct and concise.';
      userPrompt = `Suggest 3-5 concrete improvements for the "${sectionName}" tax questionnaire section. Focus on:
- Clarity of questions
- User experience
- Missing critical information
- Best practices

Format: Numbered list with brief explanations (1-2 sentences each).`;
      maxTokens = 500;
      
    } else if (actionType === 'suggest') {
      systemPrompt = 'You are a tax technology consultant. Provide 3-5 specific optimization recommendations. Be actionable and concise.';
      userPrompt = `Provide 3-5 optimization recommendations for "${sectionName}" questionnaire section:
- Conditional logic opportunities
- Validation rules needed
- User flow improvements
- Modern UX patterns

Format: Numbered list with brief explanations.`;
      maxTokens = 500;
      
    } else if (actionType === 'tax-law-check') {
      systemPrompt = 'You are a tax law compliance advisor. Check for recent tax law changes and provide specific updates. Be factual and cite sources.';
      userPrompt = `Check for recent tax law changes (last 12 months) affecting "${sectionName}". 
1. Identify any relevant changes
2. Explain impact on this section
3. Suggest specific template updates needed

Be specific and cite sources.`;
      maxTokens = 700;
      searchRecencyFilter = 'month';
      model = 'sonar-pro'; // Use pro model for tax law research
      
    } else if (userInput) {
      systemPrompt = 'You are a helpful tax questionnaire design assistant. Provide specific, actionable advice. Keep responses under 200 words.';
      userPrompt = `Context: User is designing a tax questionnaire template.
Question: ${userInput}

Provide a concise, practical answer with specific examples if relevant.`;
      maxTokens = 400;
    }

    // Use Perplexity Agent
    const completion = await perplexityAgent.chatCompletionsCreate({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.2,
      web_search_options: {
        search_domain_filter: searchDomainFilter,
        search_recency_filter: searchRecencyFilter
      }
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      response: response,
      actionType: actionType,
      sectionName: sectionName,
      citations: completion.citations || [],
      model_used: model
    });
    
  } catch (error) {
    console.error('AI Assistant error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI assistance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Follow-up questions endpoint
app.post('/api/ai-followup', async (req, res) => {
  try {
    const { previousResponse, followUpQuestion, context } = req.body;
    
    if (!followUpQuestion) {
      return res.status(400).json({ error: 'Follow-up question is required' });
    }

    const completion = await perplexityAgent.chatCompletionsCreate({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a tax questionnaire expert. Provide concise, specific answers building on previous context.'
        },
        {
          role: 'assistant',
          content: previousResponse || 'Previous context not available.'
        },
        {
          role: 'user',
          content: `Context: ${context || 'Tax questionnaire template design'}\n\nFollow-up: ${followUpQuestion}`
        }
      ],
      max_tokens: 400,
      temperature: 0.2,
      web_search_options: {
        search_domain_filter: [
          'irs.gov',
          'aicpa.org',
          'tax.thomsonreuters.com',
          'taxnotes.com'
        ],
        search_recency_filter: 'year'
      }
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content,
      citations: completion.citations || []
    });
    
  } catch (error) {
    console.error('Follow-up error:', error);
    res.status(500).json({ 
      error: 'Failed to process follow-up',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate template based on tax filing type
app.post('/api/generate-template', async (req, res) => {
  try {
    const { templateType, description } = req.body;
    
    if (!templateType) {
      return res.status(400).json({ error: 'Template type is required' });
    }

    console.log(`🔍 Generating template for: ${templateType}`);

    // First, research what information is needed for this tax filing type
    const researchResult = await perplexityAgent.chatCompletionsCreate({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a tax preparation expert. Research and identify the key information sections needed for specific tax filing types. Be comprehensive but organized.'
        },
        {
          role: 'user',
          content: `For a "${templateType}" tax filing${description ? ` (${description})` : ''}, identify:
1. What are the main information sections needed from the client?
2. What documents are typically required?
3. What are the key data points to collect?
4. What is the typical workflow order?

Provide a structured list of 6-10 major sections that would be needed in a questionnaire, in logical order.
For each section, briefly explain what information should be collected.

Format your response as:
Section Name: Brief description of what to collect

Example format:
Basic Information: Client's personal details, SSN, contact information
Income Sources: W-2s, 1099s, business income details
...`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      web_search_options: {
        search_domain_filter: [
          'irs.gov',           // IRS official website
          'aicpa.org',         // American Institute of CPAs
          'tax.thomsonreuters.com', // Thomson Reuters tax resources
          'taxnotes.com'       // Tax Notes - authoritative tax news
        ],
        search_recency_filter: 'year' // Use year for tax regulations (they change annually)
      }
    });

    const researchResponse = researchResult.choices[0].message.content;
    console.log('📋 Research completed, parsing sections...');

    // Now parse the research into structured sections
    const structureResult = await perplexityAgent.chatCompletionsCreate({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a data structuring assistant. Convert text into JSON format exactly as specified.'
        },
        {
          role: 'user',
          content: `Based on this research about ${templateType}:

${researchResponse}

Create a JSON structure with these fields:
{
  "templateName": "descriptive name for this template",
  "sections": [
    {
      "name": "section name",
      "description": "brief description of what this section collects",
      "estimatedQuestions": number (estimate 1-5)
    }
  ]
}

Return ONLY valid JSON, no markdown formatting, no explanations.`
        }
      ],
      max_tokens: 800,
      temperature: 0.1
    });

    interface TemplateSection {
      id: number;
      name: string;
      description: string;
      questionCount: number;
      questions: string[];
    }

    interface ParsedTemplate {
      templateName: string;
      sections: TemplateSection[];
    }

    let parsedTemplate: ParsedTemplate;
    try {
      const jsonText = structureResult.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedTemplate = JSON.parse(jsonText) as ParsedTemplate;
      
      // Add IDs to sections
      if (parsedTemplate.sections) {
        parsedTemplate.sections = parsedTemplate.sections.map((section: any, index: number) => ({
          id: index + 1,
          name: section.name,
          description: section.description,
          questionCount: section.estimatedQuestions || 0,
          questions: []
        }));
      }
      
      // Add standard first and last sections
      parsedTemplate.sections.unshift({
        id: 0,
        name: 'Introduction',
        description: 'Welcome message and instructions',
        questionCount: 0,
        questions: []
      });
      
      parsedTemplate.sections.push({
        id: parsedTemplate.sections.length,
        name: 'Review & Submit',
        description: 'Final review and submission',
        questionCount: 0,
        questions: []
      });
      
      // Renumber IDs
      parsedTemplate.sections = parsedTemplate.sections.map((section: any, index: number) => ({
        ...section,
        id: index + 1
      }));

    } catch (parseError) {
      console.error('Failed to parse JSON, using fallback structure:', parseError);
      
      // Fallback: Create basic structure from research text
      const sectionMatches = researchResponse.match(/^[\d]+\.\s*(.+?):/gm) || [];
      parsedTemplate = {
        templateName: templateType,
        sections: [
          { id: 1, name: 'Introduction', description: 'Welcome and instructions', questionCount: 0, questions: [] }
        ]
      };
      
      sectionMatches.forEach((match: string, index: number) => {
        const name = match.replace(/^[\d]+\.\s*/, '').replace(/:$/, '').trim();
        parsedTemplate.sections.push({
          id: index + 2,
          name: name,
          description: 'Information collection',
          questionCount: 2,
          questions: []
        });
      });
      
      parsedTemplate.sections.push({
        id: parsedTemplate.sections.length + 1,
        name: 'Review & Submit',
        description: 'Final review',
        questionCount: 0,
        questions: []
      });
    }

    console.log(`✅ Generated template with ${parsedTemplate.sections.length} sections`);

    res.json({
      success: true,
      template: parsedTemplate,
      research: researchResponse,
      citations: researchResult.citations || []
    });
    
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate template',
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
  console.log(`🚀 Perplexity Template Editor running at http://localhost:${PORT}`);
  console.log(`🤖 AI Assistant powered by Perplexity Agent (Sonar models)`);
  console.log(`🔍 Web search enabled with domain filtering (IRS, AICPA, etc.)`);
  console.log(`💡 Make sure PERPLEXITY_API_KEY is set in .env file`);
});
