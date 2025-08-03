# 🐕 WebPuppy Frontend

Research collaboratively, rate and find datasets with WebPuppy's intelligent platform.

## 🚀 Features

- **Natural Language Queries**: Describe your dataset needs in plain English
- **AI-Powered Generation**: Intelligent research, extraction, and validation
- **Real-time Processing**: Live status updates with polling
- **Data Export**: Download results as CSV files
- **User Feedback**: Rate dataset quality with integrated feedback system
- **Query History**: Browse previously generated datasets
- **Content Filtering**: Built-in security and validation systems
- **Professional UI**: Clean, responsive interface

## 🛠️ Technology Stack

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **ESLint** - Code quality and consistency
- **Progressive Web App** - PWA support with offline capabilities

## 📋 Prerequisites

- Node.js (v18 or later)
- npm or yarn package manager

## 🏃‍♂️ Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run linting
npm run lint

# Type checking is included in the build process
```

## 🌐 Environment Configuration

### Backend Integration

The frontend expects a backend API at `http://localhost:8000` by default. Key endpoints:

- `POST /api/datasets/generate` - Submit dataset generation requests
- `GET /api/datasets/{job_id}/results` - Poll for results
- `GET /api/datasets/{job_id}/download` - Download CSV
- `GET /api/queries/recent` - Recent query history
- `POST /api/jobs/{job_id}/rate` - Submit feedback ratings
- `GET /api/jobs/rating-stats` - Get rating statistics

### API Configuration

Update the `API_BASE` constant in `src/App.tsx` for different environments:

```typescript
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.webpuppy.ai' 
  : 'http://localhost:8000';
```

## 🎯 Core Components

### Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── CharacterCounter.tsx
│   ├── FeedbackComponent.tsx
│   ├── JobDetailsModal.tsx
│   ├── QueryValidator.tsx
│   ├── RatingStats.tsx
│   ├── RecentQueries.tsx
│   └── TermsOfUseModal.tsx
├── api/                # API integration
│   └── webpuppy.ts     # API client and types
├── utils/              # Utility functions
│   └── queryValidation.ts
├── App.tsx             # Main application
└── main.tsx           # Application entry point
```

### Key Features

#### Query Validation
- Real-time content filtering
- Character limits (3-1024 characters)
- NSFW content detection
- Prompt injection prevention
- Spam pattern detection

#### Feedback System
- Good Dog / Bad Dog ratings
- Statistical tracking
- User engagement metrics

#### Data Management
- Structured dataset display
- CSV export functionality
- Query history and reuse
- Job status tracking

## 🔒 Security Features

- **Content Filtering**: Blocks inappropriate, spam, or malicious content
- **Input Validation**: Client-side validation with server-side verification
- **CSP Headers**: Content Security Policy implementation
- **XSS Protection**: Built-in cross-site scripting prevention

## 📱 Progressive Web App

The application includes PWA features:

- **Offline Support**: Service worker for caching
- **App Installation**: Can be installed on mobile/desktop
- **Native Feel**: Optimized for mobile experiences
- **Push Notifications**: Ready for notification integration

## 🎨 Customization

### Theming

The application uses a dark theme with customizable colors:

```css
:root {
  --primary-bg: #050816;
  --secondary-bg: #1a1a1a;
  --accent-color: #60a5fa;
  --success-color: #22c55e;
  --error-color: #dc2626;
}
```

### Branding

Update branding elements in:
- `index.html` - Meta tags and SEO
- `public/manifest.json` - PWA configuration
- `src/App.tsx` - Application title and description

## 🚀 Deployment

### Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider:
   - Vercel: `vercel --prod`
   - Netlify: Drag and drop `dist/` folder
   - AWS S3: Upload to S3 bucket with static hosting
   - GitHub Pages: Use GitHub Actions

### Environment Variables

For production deployments, consider these environment variables:

```bash
VITE_API_BASE_URL=https://api.webpuppy.ai
VITE_APP_VERSION=1.0.0
VITE_ANALYTICS_ID=your-analytics-id
```

## 📊 Analytics & Monitoring

The application is ready for analytics integration:

- **Google Analytics**: Add tracking ID to index.html
- **Error Monitoring**: Sentry integration ready
- **Performance**: Web Vitals tracking available
- **User Behavior**: Event tracking for key actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint configuration
- Write descriptive commit messages
- Add proper error handling
- Test across different browsers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join our community discussions
- **Email**: support@webpuppy.ai

## 🔗 Related Projects

- **WebPuppy Backend**: API server and AI processing
- **WebPuppy CLI**: Command-line interface
- **WebPuppy SDK**: Developer integration library

---

**WebPuppy** - Making data extraction as easy as asking a question.