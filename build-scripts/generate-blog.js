import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { siteConfig } from '../config/site-config.js';
import articleProcessor from '../src/scripts/article-processor-simple.js';
import svgHandler from '../src/scripts/svg-handler.js';
import contentEnhancer from '../src/scripts/content-enhancer.js';
import seoProcessor from '../src/scripts/seo-processor.js';
import { generateBlogListing } from './generate-blog-listing.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'dist', 'data');
const blogDir = path.join(rootDir, 'dist', 'blog');

// Ensure blog directory exists
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

// Load blog data
function loadBlogData() {
  const articles = JSON.parse(fs.readFileSync(path.join(dataDir, 'blog-articles.json'), 'utf8'));
  const authors = JSON.parse(fs.readFileSync(path.join(dataDir, 'author-personas.json'), 'utf8'));
  
  // Create author lookup map
  const authorMap = {};
  authors.forEach(author => {
    authorMap[author.id] = author;
  });
  
  // Enhance articles with full author data
  const enhancedArticles = articles.map(article => {
    // Handle different author data structures
    let authorData = null;
    
    if (article.author) {
      // Article already has author object with persona_id
      const personaId = article.author.persona_id;
      if (personaId && authorMap[personaId]) {
        authorData = {
          ...authorMap[personaId],
          ...article.author // Preserve article-specific author fields
        };
      } else {
        authorData = article.author; // Use as-is
      }
    } else if (article.author_id && authorMap[article.author_id]) {
      // Legacy structure with author_id
      authorData = authorMap[article.author_id];
    }
    
    return {
      ...article,
      author: authorData
    };
  });
  
  return { articles: enhancedArticles, authors };
}

// Generate blog-specific CSS
function generateBlogStyles() {
  // Get styles from processors
  const svgStyles = svgHandler.generateSvgStyles();
  const contentStyles = contentEnhancer.generateContentEnhancerStyles();
  
  const blogStyles = `
/* Blog-specific styles */
.article-hero-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
  margin-bottom: 0;
}

.article-hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.blog-header {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  padding: 4rem 0;
  margin-bottom: 3rem;
}

.blog-article {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.article-meta {
  display: flex;
  gap: 2rem;
  color: #666;
  font-size: 0.9rem;
  margin: 1rem 0 2rem;
}

.article-content {
  line-height: 1.8;
  font-size: 1.1rem;
}

.article-content h2 {
  margin: 2rem 0 1rem;
  color: #333;
}

.article-content pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.author-bio {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 3rem;
}

.related-articles {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.tag {
  background: #e0e0e0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  text-decoration: none;
  color: #666;
}

.tag:hover {
  background: #d0d0d0;
  color: #333;
}

/* Link styles */
.od-internal-link {
  color: #714B67;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
}

.od-internal-link:hover {
  border-bottom-color: #714B67;
}

.od-external-link {
  color: #2e7d32;
  text-decoration: none;
  position: relative;
  padding-right: 20px;
}

.od-external-link::after {
  content: "↗";
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.8em;
}

.od-external-link:hover {
  text-decoration: underline;
}

${svgStyles}

${contentStyles}
`;
  
  const cssDir = path.join(rootDir, 'dist', 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  const cssPath = path.join(cssDir, 'blog.css');
  fs.writeFileSync(cssPath, blogStyles);
  console.log('✅ Blog styles generated');
}

// Extract keywords from URL slug for SEO
function extractKeywordsFromUrl(slug) {
  return slug
    .split('-')
    .filter(word => word.length > 2)
    .join(', ');
}

// Enhanced blog article template
function generateArticleHTML(article, relatedArticles, allArticles) {
  const publishDate = new Date(article.published_at);
  const formattedDate = publishDate.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Process article data with new processors
  const processedData = article.article_data ? 
    articleProcessor.processArticleData(article.article_data) : null;
  
  // Get processed content - prioritize the root content field which contains the full HTML
  let articleContent = '';
  if (article.content) {
    // Use the root content field which has the full article HTML
    articleContent = articleProcessor.processArticleContent(article.content);
  } else if (processedData && processedData.content) {
    // Fallback to processed article_data content
    articleContent = processedData.content;
  } else if (article.content_blocks && article.content_blocks.length > 0) {
    // Fallback to old content blocks processing
    articleContent = article.content_blocks.map(block => {
      switch (block.type) {
        case 'text':
          return `<div class="content-text">${articleProcessor.processArticleContent(block.content)}</div>`;
        
        case 'heading':
          const level = block.level || 2;
          const id = createAnchorId(block.content);
          return `<h${level} id="${id}">${block.content}</h${level}>`;
        
        case 'code':
          return `
            <div class="code-block">
              ${block.filename ? `<div class="code-filename">${block.filename}</div>` : ''}
              <pre><code class="language-${block.language || 'python'}">${escapeHtml(block.content)}</code></pre>
            </div>
          `;
        
        case 'list':
          const tag = block.ordered ? 'ol' : 'ul';
          return `<${tag} class="content-list">${block.items.map(item => `<li>${articleProcessor.processArticleContent(item)}</li>`).join('')}</${tag}>`;
        
        case 'quote':
          return `
            <blockquote class="content-quote">
              <p>${articleProcessor.processArticleContent(block.content)}</p>
              ${block.author ? `<cite>— ${block.author}</cite>` : ''}
            </blockquote>
          `;
        
        case 'callout':
          return `
            <div class="callout callout-${block.style || 'info'}">
              ${block.title ? `<h4>${block.title}</h4>` : ''}
              <p>${articleProcessor.processArticleContent(block.content)}</p>
            </div>
          `;
        
        default:
          return `<div class="content-block">${block.content || ''}</div>`;
      }
    }).join('\n');
  } else if (article.content) {
    articleContent = articleProcessor.processArticleContent(article.content);
  }
  
  // Add header IDs for TOC
  articleContent = articleProcessor.addHeaderIds(articleContent);
  
  // Process SVG visualizations if available
  let svgContent = '';
  if (processedData && processedData.visualizations) {
    svgContent = svgHandler.implementLazyLoading(processedData.visualizations);
  }
  
  // Process code blocks
  let codeBlocksHtml = '';
  if (processedData && processedData.codeBlocks) {
    codeBlocksHtml = contentEnhancer.enhanceCodeBlocks(processedData.codeBlocks);
  }
  
  // Process FAQ section
  let faqHtml = '';
  let faqSchema = null;
  if (article.seo_data && article.seo_data.faq_section) {
    const faqData = contentEnhancer.processFaqSection(article.seo_data.faq_section);
    if (faqData) {
      faqHtml = faqData.html;
      faqSchema = faqData.schema;
    }
  }
  
  // Process related articles
  const processedRelated = contentEnhancer.processRelatedArticles(relatedArticles, allArticles);
  
  // Generate table of contents
  const toc = processedData?.tableOfContents || articleProcessor.generateTableOfContents(articleContent);
  
  // Calculate reading time
  const readingTime = processedData?.readingTime || articleProcessor.calculateReadingTime(article.content || articleContent);
  
  // Generate current URL
  const currentUrl = `${siteConfig.siteUrl}/blog/${article.slug}/`;
  
  // Generate breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog/' },
    { name: article.title }
  ];
  
  // Generate SEO meta description with keywords from URL
  const urlKeywords = extractKeywordsFromUrl(article.slug);
  const enhancedMetaDescription = article.meta_description || article.excerpt || 
    `${article.title} - Erfahren Sie mehr über ${urlKeywords}. Expertenwissen für deutsche Unternehmen.`;
  
  // Use Supabase storage URL for hero images
  const supabaseUrl = process.env.SUPABASE_URL;
  const heroImage = supabaseUrl ? 
    `${supabaseUrl}/storage/v1/object/public/blog-images/${article.slug}/hero.jpg` : 
    '/assets/images/blog/default-hero.jpg';
  
  // For now, assume all articles will have generated images from Supabase
  const hasGeneratedImage = true;
  
  // Generate SEO head section
  const seoHead = seoProcessor.generateSeoHead({
    title: article.title,
    article,
    seoData: {
      ...article.seo_data,
      meta_description: enhancedMetaDescription,
      og_image: heroImage
    },
    currentUrl,
    breadcrumbs
  });
  
  const content = `
    <article class="blog-article" itemscope itemtype="https://schema.org/BlogPosting">
      ${hasGeneratedImage ? `
        <div class="article-hero-image">
          <img src="${heroImage}" alt="${article.title}" loading="eager" itemprop="image">
        </div>
      ` : ''}
      <header class="blog-header">
        <div class="container">
          <h1 itemprop="headline">${article.title}</h1>
          <div class="article-meta">
            <time datetime="${article.published_at}" itemprop="datePublished">${formattedDate}</time>
            ${article.author ? `
              <span itemprop="author" itemscope itemtype="https://schema.org/Person">
                von <span itemprop="name">${article.author.author_name || article.author.name || 'Odoo Experte'}</span>
              </span>
            ` : ''}
            <span>${readingTime} Min. Lesezeit</span>
          </div>
          ${article.tags && article.tags.length > 0 ? `
            <div class="tag-cloud">
              ${article.tags.map(tag => `<a href="/blog/tag/${createSlug(tag)}/" class="tag">${tag}</a>`).join('')}
            </div>
          ` : ''}
        </div>
      </header>
      
      <div class="container">
        ${toc && toc.html ? toc.html : ''}
        
        <div class="article-content" itemprop="articleBody">
          ${articleContent}
          ${svgContent}
          ${codeBlocksHtml}
        </div>
        
        ${faqHtml}
        
        ${contentEnhancer.addSocialSharing(article, currentUrl)}
        
        ${article.author ? `
          <aside class="author-bio" itemprop="author" itemscope itemtype="https://schema.org/Person">
            <h3>Über den Autor</h3>
            ${(() => {
              const authorId = article.author.persona_id || article.author.id;
              const authorImagePath = `/assets/images/authors/${authorId}-avatar.jpg`;
              const hasAuthorImage = fs.existsSync(path.join(rootDir, 'dist', authorImagePath.substring(1)));
              const avatarSrc = hasAuthorImage ? authorImagePath : 
                               article.author.local_avatar_path || 
                               article.author.avatar_url || 
                               '/assets/images/authors/default-avatar.jpg';
              return `<img src="${avatarSrc}" alt="${article.author.author_name || article.author.name}" itemprop="image">`;
            })()}
            <h4 itemprop="name">${article.author.author_name || article.author.name || 'Odoo Experte'}</h4>
            ${article.author.author_title ? `<p class="author-title">${article.author.author_title}</p>` : ''}
            <p itemprop="description">${article.author.bio || ''}</p>
            ${article.author.expertise && article.author.expertise.length > 0 ? `
              <div class="expertise">
                <strong>Expertise:</strong>
                ${article.author.expertise.map(exp => `<span class="tag">${exp}</span>`).join('')}
              </div>
            ` : ''}
          </aside>
        ` : ''}
        
        ${processedRelated && processedRelated.length > 0 ? `
          <section class="related-articles">
            <h3>Ähnliche Artikel</h3>
            <div class="article-grid">
              ${processedRelated.map(related => `
                <article class="article-card">
                  <h4><a href="/blog/${related.slug}/" class="od-internal-link">${related.title}</a></h4>
                  <p>${related.excerpt || ''}</p>
                  <time>${new Date(related.publishedAt).toLocaleDateString('de-DE')}</time>
                  ${related.readTime ? `<span class="read-time">${related.readTime} Min.</span>` : ''}
                </article>
              `).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    </article>
  `;
  
  return { content, seoHead };
}

// Helper function (keep for backward compatibility)
function processMarkdown(text) {
  // Now using articleProcessor
  return articleProcessor.processArticleContent(text);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createAnchorId(text) {
  return createSlug(text);
}

// Generate table of contents if article has headings (backward compatibility)
function generateTableOfContents(contentBlocks) {
  // Now using articleProcessor
  if (!contentBlocks) return null;
  
  const headings = contentBlocks.filter(block => block.type === 'heading' && block.level >= 2 && block.level <= 3);
  
  if (headings.length < 3) return null;
  
  let toc = '<ul>';
  let currentLevel = 2;
  
  headings.forEach(heading => {
    const id = createAnchorId(heading.content);
    
    if (heading.level > currentLevel) {
      toc += '<ul>';
    } else if (heading.level < currentLevel) {
      toc += '</ul>';
    }
    
    toc += `<li><a href="#${id}">${heading.content}</a></li>`;
    currentLevel = heading.level;
  });
  
  // Close any open lists
  while (currentLevel > 2) {
    toc += '</ul>';
    currentLevel--;
  }
  
  toc += '</ul>';
  return { html: toc };
}

// Find related articles based on tags and category
function findRelatedArticles(currentArticle, allArticles, limit = 3) {
  if (!currentArticle.tags || currentArticle.tags.length === 0) {
    return allArticles
      .filter(a => a.id !== currentArticle.id)
      .slice(0, limit);
  }
  
  // Score articles based on tag overlap
  const scoredArticles = allArticles
    .filter(a => a.id !== currentArticle.id)
    .map(article => {
      let score = 0;
      
      // Tag overlap
      if (article.tags) {
        const overlap = article.tags.filter(tag => currentArticle.tags.includes(tag)).length;
        score += overlap * 2;
      }
      
      // Same category
      if (article.category === currentArticle.category) {
        score += 1;
      }
      
      return { article, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return scoredArticles.slice(0, limit).map(item => item.article);
}

// Generate blog RSS feed
function generateRSSFeed(articles) {
  console.log('📡 Generating RSS feed...');
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.siteName} - Blog</title>
    <link>${siteConfig.siteUrl}/blog/</link>
    <description>Expertenwissen zu Odoo ERP, DSGVO-Compliance und Best Practices für deutsche Unternehmen.</description>
    <language>de-DE</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${articles.slice(0, 20).map(article => `
    <item>
      <title>${escapeHtml(article.title)}</title>
      <link>${siteConfig.siteUrl}/blog/${article.slug}/</link>
      <description>${escapeHtml(article.excerpt || '')}</description>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <guid isPermaLink="true">${siteConfig.siteUrl}/blog/${article.slug}/</guid>
      ${article.author ? `<author>${article.author.name}</author>` : ''}
      ${article.tags ? article.tags.map(tag => `<category>${escapeHtml(tag)}</category>`).join('\n      ') : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;
  
  fs.writeFileSync(path.join(blogDir, 'feed.xml'), rss);
  console.log('✅ RSS feed generated');
}

// Main blog generation function
export async function generateBlog() {
  console.log('🚀 Starting blog generation...\n');
  
  try {
    // Load data
    const { articles, authors } = loadBlogData();
    console.log(`📊 Loaded ${articles.length} articles and ${authors.length} authors`);
    
    // Generate blog styles
    generateBlogStyles();
    console.log('✅ Blog styles generated');
    
    // Generate individual article pages
    console.log('📄 Generating blog articles...');
    let generatedCount = 0;
    
    articles.forEach(article => {
      const articleDir = path.join(blogDir, article.slug);
      if (!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir, { recursive: true });
      }
      
      // Find related articles
      const relatedArticles = findRelatedArticles(article, articles);
      
      // Generate article HTML
      const { content, seoHead } = generateArticleHTML(article, relatedArticles, articles);
      
      // Generate scripts for interactive elements
      const scripts = `
        ${contentEnhancer.generateFaqScript()}
        ${contentEnhancer.generateCopyScript()}
        ${svgHandler.initializeLazyLoadingScript()}
      `;
      
      // Create full HTML page
      const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${seoHead}
    <!-- CSS Files in correct order -->
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/components.css">
    <link rel="stylesheet" href="/css/blog.css">
    <link rel="stylesheet" href="/css/animations.css">
    <link rel="stylesheet" href="/css/partner-search.css">
    <link rel="stylesheet" href="/css/author-bio.css">
    <link rel="stylesheet" href="/css/responsive.css">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <h1><a href="/">${siteConfig.siteName}</a></h1>
            <nav>
                <a href="/">Home</a>
                <a href="/blog/">Blog</a>
                <a href="/partner/">Partner</a>
            </nav>
        </div>
    </header>
    
    <main>
        ${content}
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${siteConfig.siteName}. Alle Rechte vorbehalten.</p>
        </div>
    </footer>
    
    <!-- JavaScript Files -->
    <script src="/js/main.js" defer></script>
    <script src="/js/animations.js" defer></script>
    <script src="/js/author-bio.js" defer></script>
    <script src="/js/scroll-effects.js" defer></script>
    <script src="/js/interactive-elements.js" defer></script>
    <script src="/js/article-processor.js" defer></script>
    <script src="/js/content-enhancer.js" defer></script>
    <script>
      ${scripts}
    </script>
</body>
</html>`;
      
      fs.writeFileSync(path.join(articleDir, 'index.html'), html);
      generatedCount++;
    });
    
    console.log(`✅ Generated ${generatedCount} blog articles`);
    
    // Generate RSS feed
    generateRSSFeed(articles);
    
    // Generate blog listing pages
    generateBlogListing();
    
    console.log('\n✨ Blog generation complete!');
    return true;
  } catch (error) {
    console.error('\n❌ Blog generation error:', error.message);
    return false;
  }
}

// Run generation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('📝 Running blog generation from command line...');
  generateBlog().catch(console.error);
}