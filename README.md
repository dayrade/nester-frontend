# Nester Frontend

Frontend application for Nester - AI-powered property content generation platform built with Next.js, React, and Tailwind CSS.

## Features

- **Modern Tech Stack**: Built with Next.js 14, React 18, and TypeScript
- **Responsive Design**: Tailwind CSS with DaisyUI components
- **Authentication**: Supabase Auth integration
- **AI Integration**: OpenAI API for content generation
- **Real Estate Focus**: Specialized for property listings and content
- **White Label Ready**: Customizable branding and theming

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dayrade/nester-frontend.git
cd nester-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility libraries and configurations
├── types/                 # TypeScript type definitions
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library for Tailwind
- **Supabase**: Backend-as-a-Service for auth and database
- **OpenAI**: AI content generation
- **Sentry**: Error monitoring and performance tracking

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for content generation
- `SENTRY_DSN` - Sentry DSN for error tracking (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.