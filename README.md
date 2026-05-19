# Quran Reader Application

A modern, feature-rich Quran reading application built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**. Provides a seamless reading experience with audio playback, customizable themes, fonts, and powerful navigation tools.

## Features

### Surah Navigation
- **Complete Surah List** — Browse all 114 surahs with English names, Arabic names, translations, and ayah counts
- **Surah Search** — Filter surahs by name (English/Arabic), number, or translation
- **Quick Navigation** — Navigate between previous/next surahs with one click
- **Surah Sidebar** — Collapsible sidebar for easy surah browsing (desktop & mobile)
- **Revelation Info** — Displays whether each surah is Meccan or Medinan with corresponding imagery

### Quran Reader
- **Translation Mode** — View Arabic text alongside English translations with word-by-word breakdown
- **Reading Mode** — Continuous Arabic text view for uninterrupted reading
- **Virtualized Ayah List** — Optimized rendering for smooth scrolling through large surahs
- **Bismillah Display** — Beautiful SVG bismillah header (excluded for Surah Al-Fatiha & At-Tawbah)
- **Ayah Numbers** — Arabic numeral ayah markers
- **Loading States** — Skeleton loaders while surah data is being fetched
- **Error Recovery** — Retry mechanism for failed data loads

### Audio Player
- **Full Audio Playback** — Listen to verse-byverse recitation (Abdul Rahman Al-Sudais)
- **Word-Level Tracking** — Real-time word highlighting synchronized with audio
- **Playback Controls** — Play, pause, stop, previous/next ayah
- **Progress Bar** — Seekable progress bar with time display
- **Volume Control** — Adjustable volume with mute toggle
- **Auto-Advance** — Automatically plays the next ayah when current one finishes
- **Surah Audio** — Play entire surah from start or any specific ayah
- **Error Handling** — Graceful error messages with recovery options

### Search
- **Global Search Modal** (`Ctrl+K`) — Search across all 6,236 ayahs
- **Multi-Language Search** — Search in English translations and Arabic text
- **Surah Name Search** — Find surahs by name match
- **Ayah Text Search** — Find specific verses by content
- **Highlighted Results** — Search terms highlighted in results
- **Quick Access** — Frequently accessed surahs available without searching
- **Debounced Search** — Optimized API calls with 400ms debounce

### Jump to Ayah
- **Direct Navigation** — Jump to any specific ayah in any surah
- **Surah Selector** — Searchable dropdown with all 114 surahs
- **Ayah Selector** — Dynamic dropdown showing valid ayah range for selected surah
- **Cross-Surah Jump** — Navigate to ayahs in different surahs seamlessly
- **Same-Surah Jump** — Instant scroll to ayah within current surah

### Themes
- **Dark Mode** — Optimized for low-light reading
- **Light Mode** — Clean, bright interface
- **Sepia Mode** — Warm, paper-like reading experience
- **System Theme** — Automatically follows OS preference
- **Persistent Theme** — Theme preference saved to localStorage

### Font Customization
- **8 Arabic Fonts** — KFGQ Uthmanic, Hafs, Amiri Quran, Noto Naskh Arabic, Al Mushaf, Al Qalam Quran Majeed, ME Quran, PDMS Saleem Quran
- **Adjustable Arabic Font Size** — Range from 18px to 100px
- **Adjustable Translation Font Size** — Range from 14px to 100px
- **Font Picker** — Visual font selection interface
- **Live Preview** — See font changes applied to sample text
- **Persistent Settings** — Font preferences saved to localStorage

### Reading Settings
- **View Mode Toggle** — Switch between Translation and Reading modes
- **Collapsible Settings** — Expandable reading settings panel
- **Quran Statistics** — Display of total surahs (114), ayahs (6,236), and pages (604)

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open search modal |
| `Space` | Play/Pause audio |
| `Shift+ArrowRight` | Next ayah |
| `Shift+ArrowLeft` | Previous ayah |
| `Escape` | Stop audio / Close modal |
| `Ctrl+ArrowDown` | Next surah |
| `Ctrl+ArrowUp` | Previous surah |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+,` | Toggle settings panel |

### UI/UX
- **Responsive Design** — Fully responsive layout for desktop, tablet, and mobile
- **Auto-Hiding Bars** — Header and bars hide/show based on scroll direction
- **Mobile Menu** — Full-screen mobile navigation overlay
- **Smooth Transitions** — Polished animations and transitions throughout
- **Accessibility** — ARIA labels, keyboard navigation, semantic HTML
- **Toast Notifications** — Audio error alerts with dismiss capability

### Performance
- **Surah Preloading** — Adjacent surahs preloaded in background
- **Virtualized Rendering** — Efficient rendering of large ayah lists
- **Generation-Based Audio** — Clean audio lifecycle management without stale callbacks
- **RequestAnimationFrame Tracking** — Smooth word-level audio synchronization
- **Debounced API Calls** — Optimized search with reduced network requests
- **LocalStorage Persistence** — User preferences cached for instant load

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **UI Components:** Radix UI
- **Language:** TypeScript
- **Linting:** ESLint

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository and navigate to the project:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page (redirects to surah)
│   └── surah/[number]/     # Dynamic surah routes
├── components/
│   ├── audio/              # Audio player bar
│   ├── layout/             # App layout, header, sidebar, bottom bar
│   ├── reader/             # Surah reader, ayah cards, sidebar
│   ├── search/             # Search modal, jump-to-ayah modal
│   ├── settings/           # Right panel, theme picker, sliders
│   └── ui/                 # Reusable UI components
├── context/                # React context (AppContext)
├── constants/              # Font configurations
├── data/                   # Static surah metadata
├── hooks/                  # Custom hooks (keyboard shortcuts)
├── services/               # API services (quranApi, search, loader)
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## API Integration

The application communicates with a backend API for:

- `GET /api/surahs` — Fetch all surahs list
- `GET /api/surahs?q=...` — Search surahs by name
- `GET /api/surahs/:id` — Fetch complete surah data with ayahs
- `GET /api/search?q=...&lang=en` — Search across Quran text

## License

This project is built for educational and personal use.
