# Soraban Questionnaire Template Builder

A React-based UI for building and managing questionnaire templates, built with TypeScript, Tailwind CSS, and Express.js backend.

## Features

- **Template Management**: Create, edit, and manage questionnaire templates
- **Section Organization**: Organize questions into expandable sections
- **Interactive UI**: Modern, responsive design with Tailwind CSS
- **TypeScript**: Full type safety and better development experience
- **Real-time Updates**: Interactive components with state management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the React frontend:
```bash
npm run build-ui
```

3. Start the development server:
```bash
npm run dev
```

### Development

For frontend development with hot reloading:
```bash
npm run dev-ui
```

This will start the webpack dev server on `http://localhost:3000` with hot reloading enabled.

### Production

1. Build the frontend:
```bash
npm run build-ui
```

2. Build the backend:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

## Project Structure

```
src/
├── components/
│   └── QuestionnaireTemplateBuilder.tsx  # Main React component
├── index.tsx                             # React app entry point
├── index.css                             # Tailwind CSS imports
└── index.html                            # HTML template

dist/
└── public/                               # Built frontend assets
    ├── index.html
    └── bundle.js

server.ts                                 # Express backend server
webpack.config.js                         # Webpack configuration
tailwind.config.js                        # Tailwind CSS configuration
```

## Features Overview

### Template Builder Interface
- Clean, professional header with user profile
- Template selection tabs
- Search functionality
- Section-based questionnaire organization
- Expandable sections with question counts
- Action buttons for template management

### Interactive Elements
- Expandable/collapsible sections
- Add new sections dynamically
- Template switching
- Responsive design
- Floating chat button

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Build Tools**: Webpack, ts-loader
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with PostCSS

## API Endpoints

- `POST /api/search` - Perplexity AI search integration
- `GET /` - Serve the main application
- `GET /*` - Catch-all route for React Router

## Environment Variables

Create a `.env` file in the root directory:

```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PORT=3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Soraban hackathon.
