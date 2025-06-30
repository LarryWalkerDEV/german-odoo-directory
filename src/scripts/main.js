// main.js - Main entry point for all animations and interactions
// Initializes all modules with performance optimizations

import { 
  initScrollAnimations, 
  initStaggeredAnimations, 
  initParallaxEffects,
  initMagneticButtons,
  initTextReveal,
  initImageLazyLoad,
  initSectionReveals,
  refreshAnimations
} from './animations.js';

import { 
  initCounterAnimations,
  initAllCounters 
} from './counter-animation.js';

import { 
  initHeaderScroll,
  initProgressIndicator,
  initSmoothScroll,
  initBackToTop,
  initScrollTriggers,
  initStickyElements
} from './scroll-effects.js';

import { 
  initCardHoverEffects,
  initButtonRipples,
  initFormAnimations,
  initDropdowns,
  initTooltips,
  initTabs
} from './interactive-elements.js';

// Import search modules
import './partner-search.js';
import './location-search.js';
import './filter-manager.js';
import './search-analytics.js';

/**
 * Performance monitoring utilities
 */
const performanceMonitor = {
  marks: {},
  
  start(name) {
    this.marks[name] = performance.now();
  },
  
  end(name) {
    if (this.marks[name]) {
      const duration = performance.now() - this.marks[name];
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      delete this.marks[name];
    }
  }
};

/**
 * Check if user prefers reduced motion
 */
function shouldReduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initialize all animation modules
 */
function initializeAnimations() {
  performanceMonitor.start('animations');
  
  if (!shouldReduceMotion()) {
    // Core animations
    initScrollAnimations();
    initStaggeredAnimations();
    initParallaxEffects();
    initMagneticButtons();
    initTextReveal();
    initSectionReveals();
    
    // Image lazy loading (always enabled for performance)
    initImageLazyLoad();
  } else {
    // Still enable lazy loading for performance
    initImageLazyLoad();
    
    // Show all animated elements immediately
    document.querySelectorAll('.od-animate').forEach(el => {
      el.classList.add('od-animate--visible');
    });
  }
  
  performanceMonitor.end('animations');
}

/**
 * Initialize counter animations
 */
function initializeCounters() {
  performanceMonitor.start('counters');
  
  if (!shouldReduceMotion()) {
    initAllCounters();
  } else {
    // Show final values immediately
    document.querySelectorAll('.od-counter').forEach(counter => {
      const value = counter.dataset.countTo || counter.textContent;
      counter.textContent = counter.dataset.prefix + value + counter.dataset.suffix;
    });
  }
  
  performanceMonitor.end('counters');
}

/**
 * Initialize scroll effects
 */
function initializeScrollEffects() {
  performanceMonitor.start('scroll-effects');
  
  initHeaderScroll();
  initProgressIndicator();
  initSmoothScroll();
  initBackToTop();
  
  if (!shouldReduceMotion()) {
    initScrollTriggers();
    initStickyElements();
  }
  
  performanceMonitor.end('scroll-effects');
}

/**
 * Initialize interactive elements
 */
function initializeInteractiveElements() {
  performanceMonitor.start('interactive-elements');
  
  if (!shouldReduceMotion()) {
    initCardHoverEffects();
  }
  
  // These enhance usability, so they're always enabled
  initButtonRipples();
  initFormAnimations();
  initDropdowns();
  initTooltips();
  initTabs();
  
  performanceMonitor.end('interactive-elements');
}

/**
 * Add loading skeleton screens
 */
function initSkeletonScreens() {
  // Replace loading placeholders with skeleton screens
  const loadingElements = document.querySelectorAll('.od-loading-placeholder');
  
  loadingElements.forEach(element => {
    const type = element.dataset.skeletonType || 'text';
    const count = parseInt(element.dataset.skeletonCount || '3');
    
    element.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `od-skeleton od-skeleton--${type}`;
      
      if (type === 'text' && i === count - 1) {
        skeleton.style.width = '60%';
      }
      
      element.appendChild(skeleton);
    }
  });
}

/**
 * Handle dynamic content loading
 */
function observeDynamicContent() {
  // Watch for dynamically added content
  const observer = new MutationObserver((mutations) => {
    let hasNewContent = false;
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.matches('.od-animate, .od-counter, [data-tooltip]')) {
          hasNewContent = true;
        }
      });
    });
    
    if (hasNewContent) {
      // Debounce refresh to avoid multiple calls
      clearTimeout(observeDynamicContent.timeout);
      observeDynamicContent.timeout = setTimeout(() => {
        refreshAnimations();
        initializeCounters();
        initTooltips();
      }, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Initialize performance optimizations
 */
function initPerformanceOptimizations() {
  // Passive event listeners for scroll and touch
  const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
  
  passiveEvents.forEach(event => {
    window.addEventListener(event, () => {}, { passive: true });
  });
  
  // Preload critical fonts
  const criticalFonts = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-var-italic.woff2'
  ];
  
  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = font;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  // Enable paint containment for performance
  document.querySelectorAll('.od-card, .od-section').forEach(element => {
    element.style.contain = 'layout style paint';
  });
}

/**
 * Error boundary for animation failures
 */
function wrapWithErrorBoundary(fn, moduleName) {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      console.error(`Error in ${moduleName}:`, error);
      // Continue with other initializations
    }
  };
}

/**
 * Main initialization function
 */
function initializeEverything() {
  performanceMonitor.start('total-init');
  
  // Wrap each initialization in error boundary
  const initFunctions = [
    { fn: initSkeletonScreens, name: 'skeleton-screens' },
    { fn: initializeAnimations, name: 'animations' },
    { fn: initializeCounters, name: 'counters' },
    { fn: initializeScrollEffects, name: 'scroll-effects' },
    { fn: initializeInteractiveElements, name: 'interactive-elements' },
    { fn: initPerformanceOptimizations, name: 'performance' },
    { fn: observeDynamicContent, name: 'dynamic-content' }
  ];
  
  initFunctions.forEach(({ fn, name }) => {
    wrapWithErrorBoundary(fn, name)();
  });
  
  performanceMonitor.end('total-init');
  
  // Mark as initialized
  document.body.classList.add('od-initialized');
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('odooDirectoryReady', {
    detail: { initialized: true }
  }));
}

/**
 * Visibility API optimization
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Pause expensive animations when page is hidden
    document.body.classList.add('od-page-hidden');
  } else {
    document.body.classList.remove('od-page-hidden');
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange);

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEverything);
} else {
  initializeEverything();
}

/**
 * Export utilities for external use
 */
export {
  refreshAnimations,
  initializeCounters,
  shouldReduceMotion
};

// Add CSS for page states
const pageStateStyles = `
  .od-page-hidden .od-animate {
    animation-play-state: paused;
  }
  
  .od-initialized {
    opacity: 1;
    transition: opacity 0.3s ease;
  }
  
  body:not(.od-initialized) {
    opacity: 0.8;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = pageStateStyles;
document.head.appendChild(styleSheet);