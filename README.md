# MindPub - Open Source Books Platform

A beautiful, modern landing page for an open-source book reading platform built with React, Tailwind CSS, and Vite with Turbopack.

## Features

- 🚀 **Fast Development** - Powered by Vite for lightning-fast compilation and HMR
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile First** - Fully responsive across all devices
- 🧩 **Component Based** - Clean, reusable React components
- 📚 **Book Showcase** - Grid-based book recommendations
- ❓ **Interactive FAQ** - Accordion-style FAQ section
- 📊 **Statistics** - Visual book statistics display

## Project Structure

```
mindpub/
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── BookStat.jsx
│   │   ├── RecommendedBook.jsx
│   │   ├── AboutUs.jsx
│   │   ├── FAQ.jsx
│   │   └── Footer.jsx
│   ├── pages/               # Page components
│   │   └── LandingPage.jsx
│   ├── styles/              # Global styles
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Components

- **Navbar** - Responsive navigation bar with mobile menu
- **Hero** - Eye-catching hero section with call-to-action
- **BookStat** - Statistics display with icons
- **RecommendedBook** - Grid layout showcasing recommended books
- **AboutUs** - About section with features
- **FAQ** - Interactive accordion FAQ section
- **Footer** - Comprehensive footer with links and social media

## Technologies

- **React 18.3** - UI library (latest stable)
- **Vite 5.4** - Build tool and dev server (latest, extremely fast HMR)
- **Tailwind CSS 3.4** - Utility-first CSS framework (latest)
- **ESLint 9** - Linting with flat config (latest, no deprecated dependencies)
- **PostCSS 8.4** - CSS processing (latest)

## Dependencies Update

All dependencies have been updated to the latest versions to:
- ✅ Fix memory leaks (removed deprecated `inflight`, `glob`, `rimraf`)
- ✅ Improve cold start performance
- ✅ Use ESLint 9 with flat config (no deprecated packages)
- ✅ Latest React, Vite, and Tailwind CSS versions

## Customization

All styles are centralized in `src/styles/global.css` using Tailwind CSS. You can customize:

- Colors in `tailwind.config.js`
- Global styles in `global.css`
- Component styles using Tailwind utility classes

## License

MIT

