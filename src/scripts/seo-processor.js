/**
 * SEO Processor for German Odoo Directory
 * Generates meta tags, Open Graph, and structured data from JSONB
 */

import { siteConfig } from '../../config/site-config.js';

/**
 * Generate meta tags from seo_data
 * @param {object} seoData - SEO data from JSONB
 * @param {object} article - Article data
 * @returns {string} - HTML meta tags
 */
export function generateMetaTags(seoData, article) {
  if (!seoData) return '';

  const {
    meta_description,
    meta_keywords,
    keywords = [],
    canonical_url,
    robots_meta
  } = seoData;

  let metaTags = '';

  // Basic meta tags
  if (meta_description) {
    metaTags += `<meta name="description" content="${escapeHtml(meta_description)}">\n`;
  }

  // Keywords (combine meta_keywords and keywords array)
  const allKeywords = [...(keywords || [])];
  if (meta_keywords) {
    allKeywords.push(...meta_keywords.split(',').map(k => k.trim()));
  }
  
  if (allKeywords.length > 0) {
    metaTags += `<meta name="keywords" content="${escapeHtml(allKeywords.join(', '))}">\n`;
  }

  // Robots meta
  if (robots_meta) {
    metaTags += `<meta name="robots" content="${escapeHtml(robots_meta)}">\n`;
  } else {
    metaTags += `<meta name="robots" content="index, follow">\n`;
  }

  // Canonical URL
  if (canonical_url) {
    metaTags += `<link rel="canonical" href="${escapeHtml(canonical_url)}">\n`;
  }

  // Author
  if (article?.author?.name) {
    metaTags += `<meta name="author" content="${escapeHtml(article.author.name)}">\n`;
  }

  // Article specific meta
  if (article?.published_at) {
    metaTags += `<meta name="article:published_time" content="${article.published_at}">\n`;
  }

  if (article?.updated_at) {
    metaTags += `<meta name="article:modified_time" content="${article.updated_at}">\n`;
  }

  // German language
  metaTags += `<meta name="language" content="de">\n`;
  metaTags += `<meta http-equiv="content-language" content="de-DE">\n`;

  return metaTags;
}

/**
 * Create Open Graph tags
 * @param {object} seoData - SEO data from JSONB
 * @param {object} article - Article data
 * @param {string} currentUrl - Current page URL
 * @returns {string} - Open Graph meta tags
 */
export function createOpenGraphTags(seoData, article, currentUrl) {
  const ogTags = [];

  // Basic OG tags
  ogTags.push(`<meta property="og:type" content="article">`);
  ogTags.push(`<meta property="og:title" content="${escapeHtml(article.title)}">`);
  ogTags.push(`<meta property="og:url" content="${escapeHtml(currentUrl)}">`);
  ogTags.push(`<meta property="og:site_name" content="${escapeHtml(siteConfig.siteName)}">`);
  ogTags.push(`<meta property="og:locale" content="de_DE">`);

  // Description
  const description = seoData?.meta_description || article.excerpt || '';
  if (description) {
    ogTags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
  }

  // Image
  if (article.featured_image) {
    ogTags.push(`<meta property="og:image" content="${escapeHtml(article.featured_image)}">`);
    ogTags.push(`<meta property="og:image:alt" content="${escapeHtml(article.title)}">`);
  }

  // Article specific
  if (article.published_at) {
    ogTags.push(`<meta property="article:published_time" content="${article.published_at}">`);
  }

  if (article.updated_at) {
    ogTags.push(`<meta property="article:modified_time" content="${article.updated_at}">`);
  }

  if (article.author?.name) {
    ogTags.push(`<meta property="article:author" content="${escapeHtml(article.author.name)}">`);
  }

  if (article.tags && article.tags.length > 0) {
    article.tags.forEach(tag => {
      ogTags.push(`<meta property="article:tag" content="${escapeHtml(tag)}">`);
    });
  }

  // Twitter Card
  ogTags.push(`<meta name="twitter:card" content="summary_large_image">`);
  ogTags.push(`<meta name="twitter:title" content="${escapeHtml(article.title)}">`);
  if (description) {
    ogTags.push(`<meta name="twitter:description" content="${escapeHtml(description)}">`);
  }
  if (article.featured_image) {
    ogTags.push(`<meta name="twitter:image" content="${escapeHtml(article.featured_image)}">`);
  }

  return ogTags.join('\n');
}

/**
 * Process structured data for articles
 * @param {object} article - Article data
 * @param {object} seoData - SEO data from JSONB
 * @param {string} currentUrl - Current page URL
 * @returns {object} - Article schema.org structured data
 */
export function processArticleStructuredData(article, seoData, currentUrl) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl
    },
    "headline": article.title,
    "description": seoData?.meta_description || article.excerpt || '',
    "datePublished": article.published_at,
    "dateModified": article.updated_at || article.published_at,
    "author": {
      "@type": "Person",
      "name": article.author?.name || "Odoo Directory Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.siteUrl}/assets/logo.png`
      }
    },
    "inLanguage": "de-DE"
  };

  // Add image if available
  if (article.featured_image) {
    structuredData.image = {
      "@type": "ImageObject",
      "url": article.featured_image,
      "width": 1200,
      "height": 630
    };
  }

  // Add article body
  if (article.content || article.article_data?.content) {
    structuredData.articleBody = stripHtml(article.content || article.article_data.content);
  }

  // Add keywords
  if (seoData?.keywords && seoData.keywords.length > 0) {
    structuredData.keywords = seoData.keywords.join(", ");
  }

  // Add word count and reading time
  if (article.word_count) {
    structuredData.wordCount = article.word_count;
  }

  if (article.read_time) {
    structuredData.timeRequired = `PT${article.read_time}M`;
  }

  return structuredData;
}

/**
 * Generate breadcrumb schema
 * @param {Array} breadcrumbs - Array of breadcrumb items
 * @param {string} baseUrl - Base URL of the site
 * @returns {object} - Breadcrumb schema.org structured data
 */
export function generateBreadcrumbSchema(breadcrumbs, baseUrl = siteConfig.siteUrl) {
  const items = breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url ? `${baseUrl}${crumb.url}` : undefined
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
}

/**
 * Add article schema markup
 * @param {object} article - Article data
 * @param {object} seoData - SEO data
 * @param {string} currentUrl - Current URL
 * @returns {string} - JSON-LD script tag
 */
export function addArticleSchemaMarkup(article, seoData, currentUrl) {
  const articleSchema = processArticleStructuredData(article, seoData, currentUrl);
  
  // Add FAQ schema if available
  if (seoData?.faq_section && seoData.faq_section.length > 0) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": seoData.faq_section.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    // Return both schemas
    return `
<script type="application/ld+json">
${JSON.stringify(articleSchema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
</script>`;
  }

  return `
<script type="application/ld+json">
${JSON.stringify(articleSchema, null, 2)}
</script>`;
}

/**
 * Generate organization schema
 * @returns {object} - Organization schema.org structured data
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.siteName,
    "url": siteConfig.siteUrl,
    "logo": `${siteConfig.siteUrl}/assets/logo.png`,
    "description": "Das führende deutsche Verzeichnis für Odoo-Partner und ERP-Expertise",
    "foundingDate": "2024",
    "areaServed": {
      "@type": "Country",
      "name": "Deutschland"
    },
    "sameAs": [
      "https://www.linkedin.com/company/odoo-directory-de",
      "https://www.xing.com/companies/odoo-directory-de"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "info@odoo-directory.de",
      "availableLanguage": ["German", "English"]
    }
  };
}

/**
 * Generate complete SEO head section
 * @param {object} options - SEO options
 * @returns {string} - Complete head section HTML
 */
export function generateSeoHead(options) {
  const {
    title,
    article,
    seoData,
    currentUrl,
    breadcrumbs = []
  } = options;

  let head = '';

  // Title
  head += `<title>${escapeHtml(title)} - ${escapeHtml(siteConfig.siteName)}</title>\n`;

  // Meta tags
  head += generateMetaTags(seoData, article) + '\n';

  // Open Graph
  head += createOpenGraphTags(seoData, article, currentUrl) + '\n';

  // Structured data
  if (article) {
    head += addArticleSchemaMarkup(article, seoData, currentUrl) + '\n';
  }

  // Breadcrumbs
  if (breadcrumbs.length > 0) {
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
    head += `
<script type="application/ld+json">
${JSON.stringify(breadcrumbSchema, null, 2)}
</script>\n`;
  }

  // Organization schema (on homepage only)
  if (currentUrl === siteConfig.siteUrl || currentUrl === `${siteConfig.siteUrl}/`) {
    const orgSchema = generateOrganizationSchema();
    head += `
<script type="application/ld+json">
${JSON.stringify(orgSchema, null, 2)}
</script>\n`;
  }

  // Alternate language versions
  head += `<link rel="alternate" hreflang="de" href="${currentUrl}">\n`;
  head += `<link rel="alternate" hreflang="x-default" href="${currentUrl}">\n`;

  // Favicon
  head += `<link rel="icon" type="image/png" href="/favicon.png">\n`;

  // RSS feed
  head += `<link rel="alternate" type="application/rss+xml" title="${siteConfig.siteName} - Blog Feed" href="/blog/feed.xml">\n`;

  return head;
}

/**
 * Helper function to escape HTML
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Helper function to strip HTML tags
 * @param {string} html - HTML content
 * @returns {string} - Plain text
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').trim();
}

/**
 * Generate sitemap entry for article
 * @param {object} article - Article data
 * @param {string} baseUrl - Base URL
 * @returns {object} - Sitemap entry
 */
export function generateSitemapEntry(article, baseUrl = siteConfig.siteUrl) {
  return {
    url: `${baseUrl}/blog/${article.slug}/`,
    lastmod: article.updated_at || article.published_at,
    changefreq: 'weekly',
    priority: 0.8
  };
}

// Export all functions
export default {
  generateMetaTags,
  createOpenGraphTags,
  processArticleStructuredData,
  generateBreadcrumbSchema,
  addArticleSchemaMarkup,
  generateOrganizationSchema,
  generateSeoHead,
  generateSitemapEntry
};