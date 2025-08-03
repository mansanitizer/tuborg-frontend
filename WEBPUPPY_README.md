# WebPuppy Frontend

A React TypeScript application for the WebPuppy AI-powered dataset builder.

## Features

- **Ask Phase**: Simple query input interface with plan selection
- **Answer Phase**: Results display with structured tables, sources, and CSV download
- **Real-time polling**: Automatic updates during dataset generation
- **Responsive design**: Desktop-first with mobile support
- **Error handling**: Comprehensive error states and user feedback

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Backend Integration

The frontend is configured to connect to the FastAPI backend on `http://localhost:8000`. Make sure the backend is running before testing the full functionality.

### API Endpoints Used

- `POST /api/datasets/generate` - Generate dataset from query
- `GET /api/datasets/{job_id}/results` - Get dataset results
- `GET /api/datasets/{job_id}/download` - Download CSV file
- `GET /api/health` - Health check

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx
│   ├── QueryForm.tsx
│   ├── LoadingIndicator.tsx
│   ├── ResultsTable.tsx
│   ├── SourcesList.tsx
│   └── DownloadButton.tsx
├── context/            # React context for state management
│   └── AppContext.tsx
├── services/           # API client
│   └── apiClient.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── styles/
    └── App.css         # Application styles
```

## Component Architecture

### Ask Phase
- Query input form with validation
- Plan selector (Standard/One Shot)
- Usage information display
- Submit and loading states

### Answer Phase
- Results table with structured data
- Data sources with clickable links
- CSV download functionality
- Query summary with "New Query" option

## State Management

Uses React Context API with useReducer for:
- Query state
- Job tracking
- Dataset results
- Loading and error states
- Phase transitions (ask ↔ answer)

## Styling

- Modern CSS with flexbox and grid layouts
- Responsive design for mobile and desktop
- Loading animations and hover effects
- Color scheme matching the design specifications

## Build

```bash
npm run build
```

## Linting

```bash
npm run lint
```