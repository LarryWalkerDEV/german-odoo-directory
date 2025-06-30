# Build Scripts Documentation

This directory contains all the build scripts for the German Odoo Directory static site generator.

## Overview

The build system fetches data from Supabase and generates static HTML pages for optimal performance and SEO.

## Scripts

### Core Build Scripts

- **`build.js`** - Main build orchestrator that runs all steps in sequence
- **`setup.js`** - Creates directories and copies static assets
- **`fetch-data.js`** - Fetches data from Supabase and saves to JSON
- **`generate-pages.js`** - Generates all static HTML pages

### Specialized Generators

- **`generate-blog.js`** - Enhanced blog generation with advanced features
- **`generate-partners.js`** - Partner directory and profile pages

### Utilities

- **`utils.js`** - Shared utility functions (slugs, formatting, etc.)
- **`test-connection.js`** - Tests Supabase connection

## Usage

### Full Build
```bash
npm run build
```

### Individual Steps
```bash
npm run setup          # Setup directories
npm run fetch          # Fetch data from Supabase
npm run generate       # Generate all pages
npm run generate:blog  # Generate only blog pages
npm run generate:partners # Generate only partner pages
```

### Development
```bash
npm run dev            # Start local server on port 8080
npm run preview        # Preview built site on port 3000
```

## Data Flow

1. **Fetch Phase**: Data is fetched from Supabase and saved to `dist/data/`
   - `blog-articles.json` - Blog articles with JSONB data
   - `partners.json` - Partner listings with location data
   - `author-personas.json` - Author information
   - `fetch-summary.json` - Fetch statistics

2. **Generate Phase**: Static HTML pages are created in `dist/`
   - Homepage (`index.html`)
   - Blog listing (`blog/index.html`)
   - Blog articles (`blog/[slug]/index.html`)
   - Partner directory (`partner/index.html`)
   - Partner profiles (`partner/[slug]/index.html`)
   - Sitemap (`sitemap.xml`)

## Features

### SEO Optimization
- Clean URLs with German-friendly slugs
- Meta tags and Open Graph data
- Structured data (Schema.org)
- XML sitemaps
- Canonical URLs

### Performance
- Static HTML generation
- Minimal JavaScript
- Optimized CSS loading
- Lazy loading for images

### German Market Focus
- Proper umlaut handling in URLs
- German date formatting
- DSGVO compliance features
- Regional categorization

## Error Handling

All scripts include comprehensive error handling:
- Database connection failures
- Missing data handling
- File system errors
- Graceful degradation

## Environment Variables

Required in `.env`:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key (optional)
```

## Directory Structure

```
dist/
├── index.html
├── blog/
│   ├── index.html
│   ├── feed.xml
│   └── [article-slug]/
│       └── index.html
├── partner/
│   ├── index.html
│   ├── sitemap.xml
│   └── [partner-slug]/
│       └── index.html
├── css/
│   ├── base.css
│   ├── blog.css
│   └── partners.css
├── js/
├── images/
├── data/
│   ├── blog-articles.json
│   ├── partners.json
│   └── author-personas.json
└── sitemap.xml
```

## Extending

To add new page types:
1. Create a new generator script
2. Add data fetching logic to `fetch-data.js`
3. Update `generate-pages.js` or create standalone generator
4. Add npm script to `package.json`

## Performance Tips

- Run `npm run fetch` separately if only content changed
- Use `npm run generate:blog` for blog-only updates
- Cache JSON data files for faster rebuilds
- Monitor build times in `fetch-summary.json`