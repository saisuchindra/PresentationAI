# PresentationAI

A research-first AI presentation generator that creates professional, data-driven PowerPoint presentations without the AI slop.

## 🎯 Project Overview

PresentationAI is a full-stack application that generates expert presentations by combining:
- **Research assistant** capabilities for fact-gathering and content organization
- **PowerPoint generator** that creates structured slides with native charts and visualizations
- **Multiple AI models** (Gemini, Claude, Llama) for different use cases

## 📁 Project Structure

```
.
├── client/              # Next.js frontend application
│   ├── src/
│   │   ├── app/        # Next.js pages and layouts
│   │   └── lib/        # Utilities and services
│   └── package.json
│
└── server/             # Express backend server
    ├── src/
    │   ├── index.ts    # Server entry point
    │   └── services/   # AI, Database, Image services
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/saisuchindra/PresentationAI.git
cd PresentationAI
```

2. Install dependencies:

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd server
npm install
```

### Running the Application

**Start Backend Server:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Start Frontend Application:**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.2.7
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Lucide React
- **Presentation Generation:** pptxgenjs

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Database:** Supabase
- **Validation:** Zod

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Start production server

## 🎨 Design Philosophy

PresentationAI rejects the "AI slop" aesthetic:
- Clean, intentional design without unnecessary effects
- Focused typography hierarchy
- Sophisticated color palette
- Smooth, purposeful animations
- Emphasis on substance over flashiness

## 📚 Features

- Generate presentations from any topic
- Multiple presentation styles (Professional/Traditional)
- Choose from multiple AI models
- Research-backed content with proper citations
- Native chart and visualization support
- Export to PowerPoint format

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Sai Suchindra**
- GitHub: [@saisuchindra](https://github.com/saisuchindra)
- Email: sai@example.com
