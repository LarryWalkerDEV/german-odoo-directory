// Utility functions for build scripts

/**
 * Create URL-friendly slug from text
 * Handles German umlauts and special characters
 */
export function createSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text) {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format date for display
 */
export function formatDate(dateString, locale = 'de-DE') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date for datetime attribute
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toISOString();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLength = 160) {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substr(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return (lastSpace > 0 ? truncated.substr(0, lastSpace) : truncated) + '...';
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content, maxLength = 160) {
  if (!content) return '';
  
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  return truncateText(cleaned, maxLength);
}

/**
 * Process simple markdown to HTML
 */
export function processMarkdown(text) {
  if (!text) return '';
  
  return text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

/**
 * Generate breadcrumb data
 */
export function generateBreadcrumbs(path, title) {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Home', url: '/' }
  ];
  
  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += '/' + part;
    
    if (index === parts.length - 1) {
      breadcrumbs.push({ name: title, url: currentPath });
    } else {
      // Capitalize first letter
      const name = part.charAt(0).toUpperCase() + part.slice(1);
      breadcrumbs.push({ name, url: currentPath });
    }
  });
  
  return breadcrumbs;
}

/**
 * Group array by key function
 */
export function groupBy(array, keyFn) {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}

/**
 * Sort partners by tier and name
 */
export function sortPartners(partners) {
  const tierOrder = {
    'enterprise': 1,
    'premium': 2,
    'starter': 3
  };
  
  return partners.sort((a, b) => {
    const tierA = tierOrder[a.subscription_tier] || 999;
    const tierB = tierOrder[b.subscription_tier] || 999;
    
    if (tierA !== tierB) {
      return tierA - tierB;
    }
    
    return a.company_name.localeCompare(b.company_name, 'de');
  });
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(siteUrl, path) {
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // Ensure path ends with /
  if (!path.endsWith('/')) {
    path = path + '/';
  }
  
  return siteUrl + path;
}