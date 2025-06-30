/**
 * Simple Article Processor for German Odoo Directory
 * Processes article content without external dependencies
 */

/**
 * Process article content to make links clickable
 * @param {string} content - Raw article content (HTML or markdown)
 * @returns {string} - Processed HTML with clickable links
 */
export function processArticleContent(content) {
  if (!content) return '';

  let html = content;
  
  // Process links to add appropriate classes only if they don't already have classes
  html = html.replace(/<a\s+href="([^"]+)"([^>]*)>/g, (match, href, rest) => {
    // Skip if already has class attribute
    if (rest.includes('class=')) {
      return match;
    }
    
    // Check if it's an internal link
    const isInternal = href.startsWith('/') || 
                      href.includes('odoo-directory.de') ||
                      href.includes('deutsche-odoo-experten.de') ||
                      (!href.startsWith('http://') && !href.startsWith('https://'));
    
    if (isInternal) {
      return `<a href="${href}" class="od-internal-link"${rest}>`;
    } else {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="od-external-link"${rest}>`;
    }
  });

  return html;
}

/**
 * Generate table of contents from article content
 * @param {string} content - HTML content with headings
 * @returns {object} - TOC data structure
 */
export function generateTableOfContents(content) {
  if (!content) return null;

  const headingRegex = /<h([2-4])[^>]*id="([^"]+)"[^>]*>(.+?)<\/h\1>/g;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, '') // Strip HTML tags
    });
  }

  if (headings.length < 3) return null;

  return {
    headings,
    html: generateTocHtml(headings)
  };
}

/**
 * Generate TOC HTML
 * @param {Array} headings - Array of heading objects
 * @returns {string} - HTML for table of contents
 */
function generateTocHtml(headings) {
  let html = '<nav class="od-toc" aria-label="Inhaltsverzeichnis">';
  html += '<h3 class="od-toc__title">Inhaltsverzeichnis</h3>';
  html += '<ol class="od-toc__list">';

  let currentLevel = 2;
  
  headings.forEach(heading => {
    // Handle nested levels
    while (currentLevel < heading.level) {
      html += '<ol class="od-toc__list od-toc__list--nested">';
      currentLevel++;
    }
    while (currentLevel > heading.level) {
      html += '</ol>';
      currentLevel--;
    }

    html += `<li class="od-toc__item">
      <a href="#${heading.id}" class="od-toc__link od-internal-link">
        ${heading.text}
      </a>
    </li>`;
  });

  // Close any remaining open lists
  while (currentLevel > 2) {
    html += '</ol>';
    currentLevel--;
  }

  html += '</ol></nav>';
  return html;
}

/**
 * Calculate reading time for article
 * @param {string} content - Article content
 * @param {number} wordsPerMinute - Reading speed (default: 200 for German)
 * @returns {number} - Reading time in minutes
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
  if (!content) return 0;

  // Strip HTML tags
  const text = content.replace(/<[^>]+>/g, '');
  
  // Count words (German-specific)
  const words = text.trim().split(/\s+/).length;
  
  // Calculate reading time
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return minutes;
}

/**
 * Process complete article data
 * @param {object} articleData - JSONB article_data from Supabase
 * @returns {object} - Processed article data
 */
export function processArticleData(articleData) {
  if (!articleData) return null;

  const { content, svg_visualizations, code_examples } = articleData;
  
  // Process content
  const processedContent = processArticleContent(content);
  
  // Generate TOC
  const tableOfContents = generateTableOfContents(processedContent);
  
  // Calculate reading time
  const readingTime = calculateReadingTime(content);

  return {
    content: processedContent,
    tableOfContents,
    readingTime,
    visualizations: svg_visualizations || [],
    codeBlocks: code_examples || []
  };
}

/**
 * Add header IDs for TOC navigation
 * @param {string} content - HTML content
 * @returns {string} - Content with header IDs
 */
export function addHeaderIds(content) {
  if (!content) return '';

  // Add IDs to headers that don't have them
  return content.replace(/<h([2-4])(?![^>]*id=)([^>]*)>(.+?)<\/h\1>/g, (match, level, attrs, text) => {
    // Create slug from header text
    const id = text
      .toLowerCase()
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
  });
}

// Export all functions
export default {
  processArticleContent,
  generateTableOfContents,
  calculateReadingTime,
  processArticleData,
  addHeaderIds
};