/**
 * SVG Handler for German Odoo Directory
 * Sanitizes and processes SVG visualizations from JSONB
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize SVG content for security
 * @param {string} svgContent - Raw SVG content
 * @returns {string} - Sanitized SVG content
 */
export function sanitizeSvg(svgContent) {
  if (!svgContent) return '';

  // Configure DOMPurify for SVG
  const cleanSvg = DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: [
      'svg', 'defs', 'pattern', 'image', 'g', 'path', 'circle', 'rect', 
      'line', 'polyline', 'polygon', 'text', 'tspan', 'ellipse',
      'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask',
      'filter', 'feGaussianBlur', 'feOffset', 'feBlend', 'feMerge', 'feMergeNode'
    ],
    ADD_ATTR: [
      'viewBox', 'xmlns', 'xmlns:xlink', 'preserveAspectRatio',
      'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
      'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height',
      'transform', 'style', 'class', 'id', 'opacity', 'fill-opacity',
      'stroke-opacity', 'points', 'x1', 'y1', 'x2', 'y2',
      'gradientUnits', 'gradientTransform', 'offset', 'stop-color', 'stop-opacity',
      'clip-path', 'mask', 'filter', 'href', 'xlink:href'
    ],
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onmousemove']
  });

  return cleanSvg;
}

/**
 * Process SVG visualizations from JSONB array
 * @param {Array} visualizations - Array of SVG visualization objects
 * @returns {Array} - Processed visualizations with metadata
 */
export function processSvgVisualizations(visualizations) {
  if (!Array.isArray(visualizations)) return [];

  return visualizations
    .filter(viz => viz && viz.svg_content)
    .map((viz, index) => {
      const processed = {
        id: viz.id || `svg-viz-${index}`,
        title: viz.title || `Visualisierung ${index + 1}`,
        description: viz.description || '',
        content: sanitizeSvg(viz.svg_content),
        aspectRatio: extractAspectRatio(viz.svg_content),
        hasAnimation: detectAnimation(viz.svg_content),
        priority: viz.priority || index
      };

      // Add wrapper for responsive behavior
      processed.wrappedContent = wrapSvgForResponsive(
        processed.content,
        processed.id,
        processed.title,
        processed.aspectRatio
      );

      return processed;
    })
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Extract aspect ratio from SVG viewBox
 * @param {string} svgContent - SVG content
 * @returns {number} - Aspect ratio (width/height)
 */
function extractAspectRatio(svgContent) {
  if (!svgContent) return 1;

  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  if (viewBoxMatch) {
    const [, , width, height] = viewBoxMatch[1].split(/\s+/).map(Number);
    if (width && height) {
      return width / height;
    }
  }

  // Try to get from width/height attributes
  const widthMatch = svgContent.match(/width="(\d+)"/);
  const heightMatch = svgContent.match(/height="(\d+)"/);
  
  if (widthMatch && heightMatch) {
    return parseInt(widthMatch[1]) / parseInt(heightMatch[1]);
  }

  return 1; // Default aspect ratio
}

/**
 * Detect if SVG contains animations
 * @param {string} svgContent - SVG content
 * @returns {boolean} - Has animations
 */
function detectAnimation(svgContent) {
  if (!svgContent) return false;
  
  return /(<animate|<animateTransform|<animateMotion|<set|@keyframes)/.test(svgContent);
}

/**
 * Add responsive wrapper for SVGs
 * @param {string} svgContent - Sanitized SVG content
 * @param {string} id - SVG ID
 * @param {string} title - SVG title
 * @param {number} aspectRatio - Aspect ratio
 * @returns {string} - Wrapped SVG HTML
 */
export function wrapSvgForResponsive(svgContent, id, title, aspectRatio = 1) {
  // Calculate padding for aspect ratio
  const paddingBottom = (1 / aspectRatio) * 100;

  // Ensure SVG has proper attributes for responsiveness
  const responsiveSvg = svgContent.replace(
    /<svg/,
    `<svg class="od-svg__content" preserveAspectRatio="xMidYMid meet"`
  );

  return `
    <div class="od-svg-wrapper" id="${id}-wrapper" data-aspect-ratio="${aspectRatio}">
      <div class="od-svg-container" style="padding-bottom: ${paddingBottom}%;">
        ${title ? `<h4 class="od-svg__title">${title}</h4>` : ''}
        ${responsiveSvg}
      </div>
    </div>
  `;
}

/**
 * Implement lazy loading for SVGs
 * @param {Array} visualizations - Array of processed visualizations
 * @returns {string} - HTML with lazy loading setup
 */
export function implementLazyLoading(visualizations) {
  if (!visualizations.length) return '';

  let html = '<div class="od-svg-collection">';

  visualizations.forEach((viz, index) => {
    const isLazy = index > 0; // First SVG loads immediately
    
    if (isLazy) {
      html += `
        <div class="od-svg-lazy" 
             data-svg-id="${viz.id}"
             data-svg-content="${encodeURIComponent(viz.wrappedContent)}">
          <div class="od-svg-placeholder" style="aspect-ratio: ${viz.aspectRatio};">
            <div class="od-loading-spinner"></div>
            <p class="od-svg-placeholder__text">Lade ${viz.title}...</p>
          </div>
        </div>
      `;
    } else {
      html += viz.wrappedContent;
    }
  });

  html += '</div>';
  return html;
}

/**
 * Add fallback for missing SVGs
 * @param {string} title - SVG title
 * @param {string} description - SVG description
 * @returns {string} - Fallback HTML
 */
export function createSvgFallback(title = 'Visualisierung', description = '') {
  return `
    <div class="od-svg-fallback">
      <svg class="od-svg-fallback__icon" width="100" height="100" viewBox="0 0 100 100">
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="#ddd" stroke-width="2" rx="5"/>
        <line x1="30" y1="70" x2="70" y2="30" stroke="#ddd" stroke-width="2"/>
        <line x1="30" y1="30" x2="70" y2="70" stroke="#ddd" stroke-width="2"/>
      </svg>
      <h4 class="od-svg-fallback__title">${title}</h4>
      ${description ? `<p class="od-svg-fallback__desc">${description}</p>` : ''}
      <p class="od-svg-fallback__message">Diese Visualisierung ist momentan nicht verfügbar.</p>
    </div>
  `;
}

/**
 * Generate inline styles for SVG handling
 * @returns {string} - CSS styles
 */
export function generateSvgStyles() {
  return `
    /* SVG Wrapper Styles */
    .od-svg-wrapper {
      margin: 2rem 0;
      max-width: 100%;
    }

    .od-svg-container {
      position: relative;
      width: 100%;
      height: 0;
      overflow: hidden;
    }

    .od-svg__content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .od-svg__title {
      position: absolute;
      top: -2rem;
      left: 0;
      margin: 0;
      font-size: 1rem;
      color: #666;
    }

    /* Lazy Loading */
    .od-svg-lazy {
      min-height: 200px;
      position: relative;
    }

    .od-svg-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
    }

    .od-loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #714B67;
      border-radius: 50%;
      animation: od-spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes od-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .od-svg-placeholder__text {
      color: #666;
      font-size: 0.9rem;
    }

    /* Fallback Styles */
    .od-svg-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      background: #f9f9f9;
      border-radius: 8px;
      text-align: center;
      margin: 2rem 0;
    }

    .od-svg-fallback__icon {
      margin-bottom: 1rem;
      opacity: 0.3;
    }

    .od-svg-fallback__title {
      margin: 0.5rem 0;
      color: #333;
    }

    .od-svg-fallback__desc {
      color: #666;
      margin: 0.5rem 0;
    }

    .od-svg-fallback__message {
      color: #999;
      font-size: 0.9rem;
      margin-top: 1rem;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .od-svg-wrapper {
        margin: 1.5rem 0;
      }
      
      .od-svg__title {
        font-size: 0.9rem;
      }
    }
  `;
}

/**
 * Initialize lazy loading observer
 * @returns {string} - JavaScript for lazy loading
 */
export function initializeLazyLoadingScript() {
  return `
    // SVG Lazy Loading
    (function() {
      const lazyLoadSvg = (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const container = entry.target;
            const svgContent = decodeURIComponent(container.dataset.svgContent);
            
            // Replace placeholder with actual SVG
            container.innerHTML = svgContent;
            container.classList.remove('od-svg-lazy');
            container.classList.add('od-svg-loaded');
            
            // Stop observing
            observer.unobserve(container);
          }
        });
      };

      // Create observer
      const svgObserver = new IntersectionObserver(lazyLoadSvg, {
        rootMargin: '100px 0px',
        threshold: 0.01
      });

      // Observe all lazy SVGs
      document.querySelectorAll('.od-svg-lazy').forEach(svg => {
        svgObserver.observe(svg);
      });
    })();
  `;
}

// Export all functions
export default {
  sanitizeSvg,
  processSvgVisualizations,
  wrapSvgForResponsive,
  implementLazyLoading,
  createSvgFallback,
  generateSvgStyles,
  initializeLazyLoadingScript
};