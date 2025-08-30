<<<<<<< HEAD
# flowgen
=======
# FlowGen v2.0 - Visual App Builder

![FlowGen Logo](https://img.shields.io/badge/FlowGen-v2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.7-38B2AC)

## Vision

Empower non-technical founders to build, deploy, and own their full-stack web applications by translating visual logic into production-grade code.

## Core Problem Solved

Founders have ideas but can't code. No-code tools lack code ownership and backend depth. AI generators lack a visual canvas and end-to-end deployment. FlowGen bridges this gap.

## Key Features

### 🎨 Visual Flow Canvas
- Interactive drag-and-drop interface built with React Flow
- Three primary node types: Page, Authentication, and Data
- Real-time visual feedback and connections

### 🤖 AI-Powered Full-Stack Generation
- **Frontend**: v0.dev API integration for React components with Tailwind CSS
- **Database**: OpenAI GPT-4o for SQL schema generation
- **Backend**: Supabase for instant backend APIs and authentication

### 💬 Interactive AI Assistant
- Real-time chat interface for component refinement
- Natural language commands (e.g., "Make the button green")
- Automatic prompt updating and regeneration

### 🚀 One-Click Deployment
- Automatic GitHub repository creation
- Instant Vercel deployment
- Live URL generation within seconds

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Canvas**: React Flow for visual node editing
- **State Management**: Zustand
- **Backend & Database**: Supabase
- **AI APIs**: Vercel v0.dev (UI), OpenAI GPT-4o (Logic/SQL)
- **Deployment**: Vercel API, GitHub API, Octokit

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- GitHub personal access token
- Vercel API token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flowgen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
VERCEL_TOKEN=your_vercel_token
GITHUB_TOKEN=your_github_token
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Golden Path Demo Flow

1. **Add a Page Node**: Click "Page" in the left panel
2. **Describe Your Component**: Enter a description like "A landing page for a SaaS product"
3. **Generate**: Click "Generate" to create the component with AI
4. **Preview**: View your component in the Preview panel
5. **Refine with AI**: Use the AI Chat to make adjustments
6. **Add Data (Optional)**: Add database tables if needed
7. **Deploy**: Click "Generate & Deploy" for instant live deployment

### Node Types

- **Page Node**: Generates React components for web pages
- **Auth Node**: Configures Supabase authentication
- **Data Node**: Creates database schemas and tables

### AI Chat Commands

Examples of what you can ask the AI assistant:
- "Make the button green"
- "Add a loading state"
- "Change the layout to two columns"
- "Add more fields to the form"
- "Make it mobile responsive"

## API Routes

- `/api/generate-ui` - Generates UI components using v0.dev
- `/api/refine-prompt` - Refines components using AI chat
- `/api/create-schema` - Creates database schemas with OpenAI
- `/api/deploy` - Handles GitHub and Vercel deployment

## Architecture

```
FlowGen v2.0
├── Visual Canvas (React Flow)
├── Node System (Page/Auth/Data)
├── AI Generation Layer
│   ├── v0.dev (UI Components)
│   ├── OpenAI GPT-4o (Schema/Logic)
│   └── Supabase (Backend/DB)
├── Interactive Chat (Refinement)
└── Deployment Pipeline
    ├── GitHub (Code Repository)
    └── Vercel (Live Hosting)
```

## Project Structure

```
flowgen/
├── app/
│   ├── api/          # API routes for AI and deployment
│   ├── globals.css   # Global styles with Tailwind
│   ├── layout.tsx    # Root layout component
│   └── page.tsx      # Main application page
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── nodes/        # Custom React Flow nodes
│   └── *.tsx         # Main application components
├── lib/
│   ├── types.ts      # TypeScript definitions
│   ├── utils.ts      # Utility functions
│   └── supabaseClient.ts
├── hooks/
│   ├── useFlowStore.ts  # Zustand state management
│   └── useToast.ts      # Toast notifications
└── Configuration files
```

## Development

### Adding New Node Types

1. Create a new node component in `components/nodes/`
2. Add the type to `lib/types.ts`
3. Update the node type mapping in `FlowCanvas.tsx`
4. Add generation logic to the appropriate API route

### Extending AI Capabilities

1. Modify prompts in API routes (`app/api/`)
2. Add new generation types to `lib/types.ts`
3. Update UI components to handle new data types

## Deployment

The application includes a complete one-click deployment system that:

1. Creates a GitHub repository
2. Commits generated code
3. Deploys to Vercel
4. Provides live URLs

For manual deployment:

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Hackathon Success Criteria ✅

- **Functionality**: Complete "Golden Path" demo flow ✅
- **"Wow" Factor**: AI Chat Assistant + One-Click Deployment ✅
- **Completion**: Live on public Vercel URL ✅

## Support

For questions and support, please open an issue on GitHub or contact the FlowGen team.

---

Built with ❤️ for the hackathon by the FlowGen team.
>>>>>>> c7044ec (Initial commit)
