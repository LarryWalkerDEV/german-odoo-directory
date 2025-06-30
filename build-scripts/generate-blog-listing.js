import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { siteConfig } from '../config/site-config.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'dist', 'data');
const blogDir = path.join(rootDir, 'dist', 'blog');

const ARTICLES_PER_PAGE = 12;

function loadBlogData() {
  const articles = JSON.parse(fs.readFileSync(path.join(dataDir, 'blog-articles.json'), 'utf8'));
  const authors = JSON.parse(fs.readFileSync(path.join(dataDir, 'author-personas.json'), 'utf8'));
  
  // Create author lookup map
  const authorMap = {};
  authors.forEach(author => {
    authorMap[author.id] = author;
  });
  
  // Enhance articles with full author data and sort by date
  const enhancedArticles = articles
    .map(article => ({
      ...article,
      author: article.author?.persona_id ? authorMap[article.author.persona_id] : article.author,
      publishedDate: new Date(article.published_at || article.created_at || '2025-01-01')
    }))
    .sort((a, b) => b.publishedDate - a.publishedDate);
  
  return enhancedArticles;
}

function generatePagination(currentPage, totalPages, baseUrl) {
  let html = '<nav class="pagination" aria-label="Seitennavigation">';
  html += '<ul class="pagination-list">';
  
  // Previous button
  if (currentPage > 1) {
    const prevUrl = currentPage === 2 ? baseUrl : `${baseUrl}page/${currentPage - 1}/`;
    html += `<li><a href="${prevUrl}" class="pagination-prev" aria-label="Vorherige Seite">← Zurück</a></li>`;
  }
  
  // Page numbers
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  if (startPage > 1) {
    html += '<li><a href="' + baseUrl + '">1</a></li>';
    if (startPage > 2) html += '<li><span class="pagination-ellipsis">…</span></li>';
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageUrl = i === 1 ? baseUrl : `${baseUrl}page/${i}/`;
    const activeClass = i === currentPage ? ' class="pagination-current"' : '';
    html += `<li><a href="${pageUrl}"${activeClass}>${i}</a></li>`;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += '<li><span class="pagination-ellipsis">…</span></li>';
    html += `<li><a href="${baseUrl}page/${totalPages}/">${totalPages}</a></li>`;
  }
  
  // Next button
  if (currentPage < totalPages) {
    html += `<li><a href="${baseUrl}page/${currentPage + 1}/" class="pagination-next" aria-label="Nächste Seite">Weiter →</a></li>`;
  }
  
  html += '</ul></nav>';
  return html;
}

function generateBlogListingPage(articles, pageNumber, totalPages) {
  const startIndex = (pageNumber - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const pageArticles = articles.slice(startIndex, endIndex);
  
  const articleCards = pageArticles.map(article => {
    const date = article.publishedDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Extract clean excerpt from content
    let excerpt = article.excerpt || '';
    if (!excerpt && article.content) {
      // Remove HTML tags and get first 200 characters
      excerpt = article.content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200) + '...';
    }
    
    const authorName = article.author?.author_name || article.author?.name || 'Odoo Experte';
    
    // Use Supabase storage URL for thumbnail images
    const supabaseUrl = process.env.SUPABASE_URL;
    const thumbnailImage = supabaseUrl ? 
      `${supabaseUrl}/storage/v1/object/public/blog-images/${article.slug}/hero.jpg` : 
      '/assets/images/blog/default-article.svg';
    
    return `
      <article class="blog-card">
        <div class="blog-card-image">
          <img src="${thumbnailImage}" alt="${article.title}" loading="lazy">
        </div>
        <div class="blog-card-content">
          <div class="blog-card-meta">
            <time datetime="${article.published_at || article.created_at}">${date}</time>
            <span class="blog-card-author">von ${authorName}</span>
          </div>
          <h2 class="blog-card-title">
            <a href="/blog/${article.slug}/" class="od-internal-link">${article.title}</a>
          </h2>
          <p class="blog-card-excerpt">${excerpt}</p>
          <a href="/blog/${article.slug}/" class="blog-card-link od-internal-link">
            Weiterlesen →
          </a>
        </div>
      </article>
    `;
  }).join('');
  
  const pagination = totalPages > 1 ? generatePagination(pageNumber, totalPages, '/blog/') : '';
  
  const pageTitle = pageNumber === 1 
    ? 'Blog - Deutsche Odoo Experten' 
    : `Blog - Seite ${pageNumber} - Deutsche Odoo Experten`;
  
  const canonicalUrl = pageNumber === 1 
    ? `${siteConfig.siteUrl}/blog/` 
    : `${siteConfig.siteUrl}/blog/page/${pageNumber}/`;
  
  return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="description" content="Odoo Blog mit ${articles.length} Artikeln zu ERP, DSGVO, KI, Migration, Hosting, ROI-Rechner. Expertenwissen für deutsche Unternehmen.">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/components.css">
    <link rel="stylesheet" href="/css/blog-listing.css">
    <link rel="stylesheet" href="/css/responsive.css">
    
    <!-- Pagination rel tags -->
    ${pageNumber > 1 ? `<link rel="prev" href="${pageNumber === 2 ? '/blog/' : `/blog/page/${pageNumber - 1}/`}">` : ''}
    ${pageNumber < totalPages ? `<link rel="next" href="/blog/page/${pageNumber + 1}/">` : ''}
</head>
<body>
    <header class="site-header">
        <div class="container">
            <div class="header-content">
                <h1 class="site-title"><a href="/">${siteConfig.siteName}</a></h1>
                <nav class="main-nav">
                    <a href="/">Home</a>
                    <a href="/blog/" class="active">Blog</a>
                    <a href="/partner/">Partner</a>
                    <a href="/tools/">Tools</a>
                </nav>
            </div>
        </div>
    </header>
    
    <main>
        <div class="blog-hero">
            <div class="container">
                <h1>Odoo Blog & Expertenwissen</h1>
                <p class="blog-hero-subtitle">
                    ${articles.length} Artikel zu Odoo ERP, Best Practices und Digitalisierung
                </p>
            </div>
        </div>
        
        <div class="container">
            <div class="blog-grid">
                ${articleCards}
            </div>
            
            ${pagination}
        </div>
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <div class="footer-content">
                <p>&copy; ${new Date().getFullYear()} ${siteConfig.siteName}. Alle Rechte vorbehalten.</p>
                <nav class="footer-nav">
                    <a href="/impressum/">Impressum</a>
                    <a href="/datenschutz/">Datenschutz</a>
                    <a href="/blog/feed.xml">RSS Feed</a>
                </nav>
            </div>
        </div>
    </footer>
    
    <!-- JavaScript Files -->
    <script src="/js/main.js" defer></script>
</body>
</html>`;
}

function generateBlogListingCSS() {
  const css = `
/* Blog Listing Styles */
.blog-hero {
  background: linear-gradient(135deg, #714B67 0%, #875A4C 100%);
  color: white;
  padding: 4rem 0;
  margin-bottom: 3rem;
  text-align: center;
}

.blog-hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.blog-hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.blog-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.blog-card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.blog-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-card-content {
  padding: 1.5rem;
}

.blog-card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
}

.blog-card-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.blog-card-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.blog-card-title a:hover {
  color: #714B67;
}

.blog-card-excerpt {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.blog-card-link {
  color: #714B67;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: gap 0.3s ease;
}

.blog-card-link:hover {
  gap: 0.5rem;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  margin: 4rem 0;
}

.pagination-list {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pagination-list li {
  margin: 0;
}

.pagination-list a,
.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.75rem;
  text-decoration: none;
  color: #333;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.pagination-list a:hover {
  background: #714B67;
  color: white;
  border-color: #714B67;
}

.pagination-current {
  background: #714B67 !important;
  color: white !important;
  border-color: #714B67 !important;
  font-weight: bold;
}

.pagination-prev,
.pagination-next {
  font-weight: 500;
}

.pagination-ellipsis {
  border: none;
  background: transparent;
  cursor: default;
}

/* Responsive */
@media (max-width: 768px) {
  .blog-grid {
    grid-template-columns: 1fr;
  }
  
  .blog-hero h1 {
    font-size: 2rem;
  }
  
  .pagination-list {
    flex-wrap: wrap;
  }
}
`;
  
  const cssPath = path.join(rootDir, 'dist', 'css', 'blog-listing.css');
  fs.writeFileSync(cssPath, css);
  console.log('✅ Blog listing CSS generated');
}

export function generateBlogListing() {
  console.log('📄 Generating blog listing pages...');
  
  try {
    // Load and process articles
    const articles = loadBlogData();
    const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
    
    // Generate CSS
    generateBlogListingCSS();
    
    // Generate main blog index
    const indexHtml = generateBlogListingPage(articles, 1, totalPages);
    fs.writeFileSync(path.join(blogDir, 'index.html'), indexHtml);
    
    // Generate pagination pages
    if (totalPages > 1) {
      const pageDir = path.join(blogDir, 'page');
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      
      for (let page = 2; page <= totalPages; page++) {
        const pageHtml = generateBlogListingPage(articles, page, totalPages);
        const pagePath = path.join(pageDir, String(page));
        
        if (!fs.existsSync(pagePath)) {
          fs.mkdirSync(pagePath, { recursive: true });
        }
        
        fs.writeFileSync(path.join(pagePath, 'index.html'), pageHtml);
      }
    }
    
    console.log(`✅ Generated blog listing with ${totalPages} pages for ${articles.length} articles`);
    return true;
  } catch (error) {
    console.error('❌ Error generating blog listing:', error);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateBlogListing();
}