# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Vite marketing site for 3D Ops, an industrial metal additive manufacturing and product development company. The site is deployed to GitHub Pages at `https://path-magic-tech.github.io/3dops-marketing/`.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

The `postbuild` script automatically copies `index.html` to `404.html` for client-side routing support on GitHub Pages.

## Architecture

### Routing & Layout

The app uses React Router with a nested route structure defined in [src/main.jsx](src/main.jsx):
- [App.jsx](src/App.jsx) serves as the root layout component with shared header/footer
- All pages render inside the `<Outlet />` in App.jsx
- Navigation uses `NavLink` for active state styling
- Custom `NavigateTop` hook scrolls to top on route change
- Base URL is configured via `import.meta.env.BASE_URL` for GitHub Pages deployment

### Asset Handling

Assets use a helper pattern for base URL prefixing:
```jsx
const ASSET = (p) => `${import.meta.env.BASE_URL}${p}`
```

The base URL is set in [vite.config.js](vite.config.js) to `/3dops-marketing/` for GitHub Pages. This pattern is used in App.jsx and should be used in any new components that reference public assets.

### SEO Strategy

- React Helmet Async wraps the entire app for per-page meta tags
- [index.html](index.html) contains base meta tags and structured data (schema.org Organization)
- [public/sitemap.xml](public/sitemap.xml) and [public/robots.txt](public/robots.txt) are included for search engines
- Each page component should use `<Helmet>` to set page-specific title and meta tags

### Component Structure

Components are organized into two categories:
- **Pages** ([src/pages/](src/pages/)): Full page views (Home, Services, Work, About, Contact, NotFound)
- **Components** ([src/components/](src/components/)): Reusable UI building blocks (Hero, CardGrid, ContactForm, Stat)

Pages compose multiple components together. For example, [Home.jsx](src/pages/Home.jsx) uses Hero, CardGrid, and Stat components.

### Styling

All styles are in [src/styles/3dops.css](src/styles/3dops.css) with an industrial theme palette. The site uses:
- CSS custom properties for theming (applied via `theme-nightops` class on `<body>`)
- Mobile-first responsive design
- Grid utilities (`.grid-3`, `.grid-2`) for consistent layouts
- Utility classes (`.container`, `.section`, `.band`, `.pill`, `.card`, etc.)

When adding new components, follow the existing CSS patterns and utility classes rather than adding inline styles.

### Contact Form

The ContactForm component ([src/components/ContactForm.jsx](src/components/ContactForm.jsx)) is frontend-only and requires backend integration. It currently prevents default form submission. Wire it to a backend API or form service like Formspree, Netlify Forms, or similar.

### Image Assets

Current images in [public/images/](public/images/) are SVG placeholders. Replace with actual product photography or royalty-free images as needed. The site includes sample part images referenced by Work page and an OG cover image for social sharing.
