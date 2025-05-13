# AI Personas

An interactive web application that allows users to interact with AI-powered personas, each with unique characteristics, expertise, and communication styles. The application supports file uploads, document processing, and natural conversations with AI personas.

## Features

- 🤖 Multiple AI personas with distinct personalities and expertise
- 💬 Natural conversation interface
- 📄 File upload and processing support
- 🔍 Document search and analysis
- 🎨 Modern, responsive UI
- 🌙 Dark/Light mode support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **AI**: OpenAI API, LangChain
- **Vector Database**: Pinecone
- **File Processing**: pdf-parse, mammoth, tesseract.js

## Prerequisites

- Node.js 18+ and npm/pnpm
- OpenAI API key
- Pinecone API key and environment
- Python 3.8+ (for backend processing)

## Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment

# Backend
PYTHON_BACKEND_URL=http://localhost:8000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-personas.git
cd ai-personas
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install
# or
pnpm install

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Start the development servers:

```bash
# Start frontend (from root directory)
npm run dev
# or
pnpm dev

# Start backend (from backend directory)
uvicorn main:app --reload
```

The application will be available at `http://localhost:3000`

## Project Structure

```
ai-personas/
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Utility functions and processors
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── backend/              # Python backend
│   ├── processors/       # Document processors
│   └── main.py          # FastAPI application
└── package.json
```

## Usage

1. Select a persona from the available options
2. Start a conversation by typing messages or using suggested prompts
3. Upload files for analysis (supported formats: PDF, DOCX, TXT, CSV, images)
4. Ask questions about the uploaded documents
5. Use the persona's expertise to get insights and recommendations

## Deployment

### Frontend (Next.js)

The frontend can be deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy

### Backend (Python)

The backend can be deployed to any Python-compatible hosting service:

1. Set up a Python environment
2. Install dependencies
3. Configure environment variables
4. Run with Gunicorn or similar WSGI server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 