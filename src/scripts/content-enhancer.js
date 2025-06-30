/**
 * Content Enhancer for German Odoo Directory
 * Processes FAQ sections, social sharing, and related content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Process FAQ sections from seo_data.faq_section
 * @param {Array} faqSection - Array of FAQ objects
 * @returns {object} - Processed FAQ data with HTML and schema
 */
export function processFaqSection(faqSection) {
  if (!Array.isArray(faqSection) || faqSection.length === 0) return null;

  const processedFaqs = faqSection.map((faq, index) => ({
    id: `faq-${index}`,
    question: DOMPurify.sanitize(faq.question),
    answer: DOMPurify.sanitize(faq.answer),
    expanded: index === 0 // First FAQ expanded by default
  }));

  return {
    faqs: processedFaqs,
    html: generateFaqHtml(processedFaqs),
    schema: generateFaqSchema(processedFaqs)
  };
}

/**
 * Generate FAQ HTML with expandable components
 * @param {Array} faqs - Processed FAQ array
 * @returns {string} - FAQ HTML
 */
function generateFaqHtml(faqs) {
  let html = `
    <section class="od-faq-section" aria-label="Häufig gestellte Fragen">
      <h2 class="od-faq-section__title">Häufig gestellte Fragen</h2>
      <div class="od-faq-list">
  `;

  faqs.forEach(faq => {
    html += `
      <div class="od-faq-item ${faq.expanded ? 'od-faq-item--expanded' : ''}" 
           data-faq-id="${faq.id}">
        <button class="od-faq-question" 
                aria-expanded="${faq.expanded}" 
                aria-controls="${faq.id}-answer">
          <span class="od-faq-question__text">${faq.question}</span>
          <svg class="od-faq-question__icon" width="24" height="24" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
        <div class="od-faq-answer" 
             id="${faq.id}-answer"
             aria-hidden="${!faq.expanded}">
          <div class="od-faq-answer__content">
            ${faq.answer}
          </div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </section>
  `;

  return html;
}

/**
 * Generate FAQ schema.org markup
 * @param {Array} faqs - Processed FAQ array
 * @returns {object} - Schema.org FAQPage structured data
 */
export function generateFaqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Create expandable FAQ component script
 * @returns {string} - JavaScript for FAQ interaction
 */
export function generateFaqScript() {
  return `
    // FAQ Interaction Handler
    (function() {
      const faqItems = document.querySelectorAll('.od-faq-item');
      
      faqItems.forEach(item => {
        const button = item.querySelector('.od-faq-question');
        const answer = item.querySelector('.od-faq-answer');
        
        button.addEventListener('click', () => {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          
          // Toggle current item
          button.setAttribute('aria-expanded', !isExpanded);
          answer.setAttribute('aria-hidden', isExpanded);
          item.classList.toggle('od-faq-item--expanded');
          
          // Smooth height animation
          if (!isExpanded) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
          } else {
            answer.style.maxHeight = '0';
          }
        });
      });
    })();
  `;
}

/**
 * Process related articles
 * @param {Array} relatedArticles - Array of related article IDs or objects
 * @param {Array} allArticles - Array of all articles for lookup
 * @returns {Array} - Processed related articles with metadata
 */
export function processRelatedArticles(relatedArticles, allArticles = []) {
  if (!Array.isArray(relatedArticles) || relatedArticles.length === 0) return [];

  // Handle both ID references and full objects
  const processed = relatedArticles.map(related => {
    if (typeof related === 'string' || typeof related === 'number') {
      // It's an ID, find the full article
      return allArticles.find(article => article.id === related);
    }
    return related;
  }).filter(Boolean);

  return processed.map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || article.meta_description || '',
    publishedAt: article.published_at,
    readTime: article.read_time || calculateReadTime(article.content),
    category: article.category,
    tags: article.tags || []
  }));
}

/**
 * Calculate reading time helper
 * @param {string} content - Article content
 * @returns {number} - Reading time in minutes
 */
function calculateReadTime(content) {
  if (!content) return 5;
  const words = content.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

/**
 * Add social sharing buttons
 * @param {object} article - Article data
 * @param {string} currentUrl - Current page URL
 * @returns {string} - Social sharing HTML
 */
export function addSocialSharing(article, currentUrl) {
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(article.title);
  const encodedExcerpt = encodeURIComponent(article.excerpt || article.meta_description || '');

  const shareButtons = [
    {
      name: 'LinkedIn',
      icon: 'linkedin',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: '#0077B5'
    },
    {
      name: 'XING',
      icon: 'xing',
      url: `https://www.xing.com/spi/shares/new?url=${encodedUrl}`,
      color: '#006567'
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: '#1DA1F2'
    },
    {
      name: 'E-Mail',
      icon: 'email',
      url: `mailto:?subject=${encodedTitle}&body=${encodedExcerpt}%0A%0A${encodedUrl}`,
      color: '#666'
    }
  ];

  let html = `
    <div class="od-social-sharing">
      <h3 class="od-social-sharing__title">Artikel teilen</h3>
      <div class="od-social-sharing__buttons">
  `;

  shareButtons.forEach(button => {
    html += `
      <a href="${button.url}" 
         class="od-social-sharing__button od-social-sharing__button--${button.icon}"
         target="_blank" 
         rel="noopener noreferrer"
         aria-label="Auf ${button.name} teilen"
         style="--button-color: ${button.color}">
        <span class="od-social-sharing__icon">${getSocialIcon(button.icon)}</span>
        <span class="od-social-sharing__label">${button.name}</span>
      </a>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Get social media icon SVG
 * @param {string} platform - Social media platform
 * @returns {string} - SVG icon
 */
function getSocialIcon(platform) {
  const icons = {
    linkedin: '<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    xing: '<svg viewBox="0 0 24 24"><path d="M18.188 0c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.17.308.436.66.967.66h3.454c.211 0 .375-.078.463-.22.089-.151.089-.346-.009-.536l-4.879-8.916c-.004-.006-.004-.016 0-.022l7.614-13.5c.098-.193.098-.41.009-.561-.089-.142-.252-.22-.463-.22h-3.446zm-13.871 6.547c-.211 0-.375.078-.463.22-.089.151-.089.346.009.536l2.821 4.918c.004.006.004.016 0 .022l-3.699 6.1c-.098.193-.098.41-.009.561.089.142.252.22.463.22h3.446c.517 0 .741-.325.927-.66 0 0 3.598-5.938 3.852-6.371-.015-.024-2.836-4.929-2.836-4.929-.17-.308-.436-.66-.967-.66h-3.454z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>'
  };
  
  return icons[platform] || '';
}

/**
 * Implement copy-to-clipboard for code blocks
 * @param {Array} codeBlocks - Array of code block objects
 * @returns {string} - Enhanced code blocks HTML
 */
export function enhanceCodeBlocks(codeBlocks) {
  if (!Array.isArray(codeBlocks) || codeBlocks.length === 0) return '';

  let html = '';

  codeBlocks.forEach(block => {
    html += `
      <div class="od-code-block" data-language="${block.language}">
        ${block.filename ? `<div class="od-code-block__filename">${block.filename}</div>` : ''}
        <div class="od-code-block__header">
          <span class="od-code-block__language">${block.language}</span>
          <button class="od-code-block__copy" 
                  data-code-id="${block.id}"
                  aria-label="Code kopieren">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 11-2 0V4H9a1 1 0 01-1-1z"/>
              <rect x="3" y="6" width="10" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="od-code-block__copy-text">Kopieren</span>
          </button>
        </div>
        <pre class="od-code-block__pre"><code class="language-${block.language}" id="${block.id}">${block.code}</code></pre>
      </div>
    `;
  });

  return html;
}

/**
 * Generate copy-to-clipboard script
 * @returns {string} - JavaScript for copy functionality
 */
export function generateCopyScript() {
  return `
    // Copy to Clipboard Handler
    (function() {
      const copyButtons = document.querySelectorAll('.od-code-block__copy');
      
      copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
          const codeId = button.dataset.codeId;
          const codeElement = document.getElementById(codeId);
          const code = codeElement.textContent;
          
          try {
            await navigator.clipboard.writeText(code);
            
            // Update button text
            const textElement = button.querySelector('.od-code-block__copy-text');
            const originalText = textElement.textContent;
            textElement.textContent = 'Kopiert!';
            button.classList.add('od-code-block__copy--success');
            
            // Reset after 2 seconds
            setTimeout(() => {
              textElement.textContent = originalText;
              button.classList.remove('od-code-block__copy--success');
            }, 2000);
          } catch (err) {
            console.error('Kopieren fehlgeschlagen:', err);
          }
        });
      });
    })();
  `;
}

/**
 * Generate content enhancer styles
 * @returns {string} - CSS styles
 */
export function generateContentEnhancerStyles() {
  return `
    /* FAQ Styles */
    .od-faq-section {
      margin: 3rem 0;
      padding: 2rem;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .od-faq-section__title {
      margin: 0 0 2rem;
      color: #333;
    }

    .od-faq-item {
      margin-bottom: 1rem;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .od-faq-question {
      width: 100%;
      padding: 1.25rem;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
      transition: background-color 0.3s ease;
    }

    .od-faq-question:hover {
      background-color: #f5f5f5;
    }

    .od-faq-question__icon {
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .od-faq-item--expanded .od-faq-question__icon {
      transform: rotate(180deg);
    }

    .od-faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .od-faq-answer__content {
      padding: 0 1.25rem 1.25rem;
      color: #666;
      line-height: 1.6;
    }

    /* Social Sharing */
    .od-social-sharing {
      margin: 3rem 0;
      padding: 2rem;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
    }

    .od-social-sharing__title {
      margin: 0 0 1rem;
      font-size: 1.2rem;
      color: #333;
    }

    .od-social-sharing__buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .od-social-sharing__button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--button-color, #666);
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .od-social-sharing__button:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    .od-social-sharing__icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .od-social-sharing__label {
      font-size: 0.9rem;
    }

    /* Code Blocks */
    .od-code-block {
      margin: 2rem 0;
      border-radius: 8px;
      overflow: hidden;
      background: #2d2d2d;
    }

    .od-code-block__filename {
      padding: 0.75rem 1rem;
      background: #1a1a1a;
      color: #999;
      font-size: 0.85rem;
      font-family: monospace;
    }

    .od-code-block__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #1a1a1a;
      border-bottom: 1px solid #3a3a3a;
    }

    .od-code-block__language {
      color: #666;
      font-size: 0.85rem;
      text-transform: uppercase;
    }

    .od-code-block__copy {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      background: transparent;
      border: 1px solid #666;
      color: #999;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .od-code-block__copy:hover {
      border-color: #999;
      color: #ccc;
    }

    .od-code-block__copy--success {
      border-color: #4CAF50;
      color: #4CAF50;
    }

    .od-code-block__copy svg {
      width: 16px;
      height: 16px;
    }

    .od-code-block__copy-text {
      font-size: 0.85rem;
    }

    .od-code-block__pre {
      margin: 0;
      padding: 1rem;
      overflow-x: auto;
    }

    .od-code-block__pre code {
      color: #f8f8f2;
      font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .od-social-sharing__buttons {
        flex-direction: column;
      }
      
      .od-social-sharing__button {
        justify-content: center;
      }
    }
  `;
}

// Export all functions
export default {
  processFaqSection,
  generateFaqSchema,
  generateFaqScript,
  processRelatedArticles,
  addSocialSharing,
  enhanceCodeBlocks,
  generateCopyScript,
  generateContentEnhancerStyles
};