# 🇩🇪 German Odoo Directory

A professional B2B SaaS platform for finding certified Odoo partners in Germany. Built with pure HTML/CSS/JavaScript and powered by Supabase.

## 🌟 Features

- **129 SEO-optimized blog articles** about Odoo ERP
- **Partner directory** with advanced search capabilities
- **EEAT compliance** with German business trust indicators
- **Professional Grove.ai design aesthetic**
- **AI-generated hero images** for each article
- **Static site generation** for optimal performance
- **German business context** (TÜV, DSGVO certifications)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- DigitalOcean account (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/german-odoo-directory.git
cd german-odoo-directory
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.template` to `.env` and add your Supabase credentials:
```bash
cp .env.template .env
```

4. Build the site:
```bash
npm run build
```

5. Preview locally:
```bash
npm run preview
```

## 📦 Project Structure

```
german-odoo-directory/
├── src/                    # Source files
│   ├── templates/         # HTML templates
│   ├── styles/           # CSS files
│   └── scripts/          # JavaScript modules
├── build-scripts/         # Build and generation scripts
├── config/               # Configuration files
├── dist/                 # Generated static site (git ignored)
└── supabase/            # Supabase edge functions
```

## 🛠️ Available Scripts

- `npm run build` - Build the complete static site
- `npm run dev` - Start local development server
- `npm run generate:blog` - Generate blog pages
- `npm run generate:partners` - Generate partner pages
- `npm run generate:images:secure` - Generate AI images for articles

## 🚢 Deployment

### DigitalOcean App Platform (Recommended)

1. Push to GitHub:
```bash
./push-to-github.sh
```

2. Deploy via DigitalOcean Dashboard:
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Create new app from GitHub repository
   - Configure as Static Site (FREE tier)
   - Set build command: `npm install && npm run build`
   - Set output directory: `dist`

### Environment Variables

Add these to your DigitalOcean app:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 🎨 Design System

- **Primary Color**: #714B67 (Purple)
- **Font**: Inter
- **Grid**: 8px baseline
- **Aesthetic**: Grove.ai minimalist design

## 📊 Performance

- **Lighthouse Score**: 95+
- **Static HTML/CSS/JS**: No framework overhead
- **Optimized Images**: Served from Supabase CDN
- **Caching**: Aggressive cache headers for assets

## 🔒 Security

- CSP headers configured
- No exposed API keys
- Supabase RLS enabled
- HTTPS enforced

## 📈 SEO Features

- Schema.org structured data
- XML sitemap
- RSS feed
- Meta descriptions with keywords
- Clean URLs
- German language optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for the German Odoo community