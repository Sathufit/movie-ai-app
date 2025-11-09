# 🎬 MovieAI - Your Next Favorite Movie Awaits

A modern, AI-powered movie discovery web app built with Next.js 14, TypeScript, Tailwind CSS v4, and Framer Motion. Inspired by Netflix and IMDB, featuring a sleek dark theme with purple/red gradient accents.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.0-ff69b4?style=flat)

## ✨ Features

### Current Features
- 🎨 **Beautiful UI** - Netflix + IMDB inspired design with dark theme
- 🔍 **Smart Search** - Interactive search bar with trending suggestions
- 🎭 **Movie Cards** - Smooth hover animations and detailed info on hover
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🎬 **Featured Sections** - Trending Now and Popular This Week
- ⚡ **Smooth Animations** - Powered by Framer Motion
- 🎯 **Type-Safe** - Built with TypeScript for better DX
- 🌈 **Modern Gradients** - Purple to red accent colors

### Coming Soon
- 🤖 **AI Features** - Plot summaries and personalized recommendations
- 🎥 **Movie Details** - Full details page with trailers and cast
- 👤 **User Profiles** - Favorites, watchlists, and ratings
- 🔐 **Authentication** - Secure user accounts
- 📊 **Advanced Filters** - Search by genre, year, rating, etc.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- TMDB API Key (get it from https://www.themoviedb.org/settings/api)
- Google Gemini API Key (get it from https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone or download the project
cd movie-ai-app

# Install dependencies
npm install

# Setup environment variables
# Copy .env.local.example to .env.local and add your API keys
cp .env.local.example .env.local

# Edit .env.local and add your API keys:
# NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
# NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app! 🎉

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
movie-ai-app/
├── app/                      # Next.js 14 App Router
│   ├── page.tsx             # Homepage with featured movies
│   ├── layout.tsx           # Root layout with metadata
│   ├── loading.tsx          # Loading states
│   ├── error.tsx            # Error boundaries
│   ├── not-found.tsx        # 404 page
│   ├── manifest.ts          # PWA manifest
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── MovieCard.tsx        # Movie card with animations
│   └── SearchBar.tsx        # Interactive search component
├── lib/                     # Utility functions and data
│   ├── constants.ts         # API config and constants
│   ├── movieData.ts         # Mock data and utilities
│   └── utils.ts             # Helper functions
├── types/                   # TypeScript type definitions
│   ├── movie.ts             # Movie interfaces
│   └── index.ts             # Exported types
├── public/                  # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Beautiful icons |
| **Headless UI** | Accessible components |

## 🎯 Key Components

### MovieCard Component
Reusable card component with:
- Hover animations (lift effect)
- Rating badge with star icon
- Release date display
- Description on hover
- Watch trailer button
- Staggered entrance animations

### SearchBar Component
Interactive search with:
- Focus animations
- Clear button
- Trending searches
- Dropdown suggestions
- Smooth transitions

### Homepage
Full-featured landing page:
- Hero section with gradient
- Search functionality
- Trending movies grid
- Popular movies section
- AI features teaser
- Responsive navigation

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (use `.env.example` as template):

```env
# TMDB API (for real movie data)
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here

# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_key_here
```

### Image Domains

Already configured in `next.config.ts`:
- `image.tmdb.org` - For TMDB movie posters

## 🎨 Design System

### Colors
```
Background: Zinc 950/900 (dark gradient)
Primary: Purple 600 → Red 600
Text: White / Zinc 400
Accent: Purple 400 / Red 400
Borders: Zinc 800
```

### Typography
```
Headings: Bold, white
Body: Regular, zinc-400
Links: Zinc-400 → white on hover
```

### Spacing Scale
```
Container: max-w-7xl mx-auto px-4
Sections: mb-16
Cards: gap-6
Elements: p-4, p-8
```

## 📱 Responsive Design

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Mobile | < 640px | 1 column |
| Tablet | 640px - 1024px | 2 columns |
| Desktop | > 1024px | 4 columns |

## 🚀 Next Steps

### Phase 1: API Integration (Week 1-2)
1. Get [TMDB API key](https://www.themoviedb.org/settings/api)
2. Implement movie fetching
3. Add real search functionality
4. Implement pagination

### Phase 2: Movie Details (Week 3-4)
1. Create movie details page
2. Add YouTube trailer embed
3. Show cast and crew
4. Display user reviews

### Phase 3: AI Features (Week 5-6)
1. Set up OpenAI integration
2. Create plot summarization
3. Build recommendation engine
4. Add AI chat interface

### Phase 4: User Features (Week 7-8)
1. Add NextAuth authentication
2. Create user profiles
3. Implement favorites/watchlist
4. Build rating system

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎓 Beginner-Friendly

This project is designed to be:
- ✅ Well-commented code
- ✅ Clear component structure
- ✅ Type-safe with TypeScript
- ✅ Modern React patterns
- ✅ Reusable components
- ✅ Clean architecture

Perfect for learning:
- Next.js 14 App Router
- TypeScript with React
- Tailwind CSS styling
- Framer Motion animations
- Component-driven development

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Image loading issues
Check that `next.config.ts` has the correct image domains configured.

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share improvements

## 📄 License

MIT License - Free to use for personal and commercial projects!

## 🌟 Show Your Support

If you found this project helpful:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🔀 Fork and contribute

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

**Happy coding! 🎬✨**

