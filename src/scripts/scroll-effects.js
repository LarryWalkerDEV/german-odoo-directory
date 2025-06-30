// scroll-effects.js - Scroll-based effects and behaviors
// Implements header shrink/grow, progress indicators, smooth scrolling

// Throttle function for performance
function throttle(func, wait) {
  let timeout;
  let previous = 0;
  
  return function(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Header behavior on scroll (shrink/grow)
 */
export function initHeaderScroll() {
  const header = document.querySelector('.od-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  
  // Configuration
  const scrollThreshold = 100;
  const hideThreshold = 300;
  
  function updateHeader() {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollDistance = Math.abs(currentScrollY - lastScrollY);
    
    // Add/remove scrolled class for styling
    if (currentScrollY > scrollThreshold) {
      header.classList.add('od-header--scrolled');
    } else {
      header.classList.remove('od-header--scrolled');
    }
    
    // Hide/show header based on scroll direction
    if (currentScrollY > hideThreshold) {
      if (scrollingDown && scrollDistance > 10) {
        header.classList.add('od-header--hidden');
      } else if (!scrollingDown && scrollDistance > 10) {
        header.classList.remove('od-header--hidden');
      }
    } else {
      header.classList.remove('od-header--hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }
  
  // Optimized scroll handler
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  };
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Initial state
  updateHeader();
}

/**
 * Progress indicator for blog articles
 */
export function initProgressIndicator() {
  const article = document.querySelector('.od-article');
  if (!article) return;
  
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'od-reading-progress';
  progressBar.innerHTML = '<div class="od-reading-progress__bar"></div>';
  document.body.appendChild(progressBar);
  
  const bar = progressBar.querySelector('.od-reading-progress__bar');
  
  // Add styles
  const styles = `
    .od-reading-progress {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transition: opacity 0.3s;
    }
    
    .od-reading-progress__bar {
      height: 100%;
      background: var(--od-primary);
      width: 0;
      transition: width 0.1s;
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Calculate and update progress
  const updateProgress = throttle(() => {
    const articleRect = article.getBoundingClientRect();
    const articleHeight = articleRect.height;
    const windowHeight = window.innerHeight;
    const scrolled = window.scrollY - articleRect.top - window.scrollY;
    const totalScroll = articleHeight - windowHeight;
    const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
    
    bar.style.width = `${progress * 100}%`;
    
    // Hide when article is out of view
    if (articleRect.bottom < 0 || articleRect.top > windowHeight) {
      progressBar.style.opacity = '0';
    } else {
      progressBar.style.opacity = '1';
    }
  }, 16);
  
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', debounce(updateProgress, 250));
  
  // Initial update
  updateProgress();
}

/**
 * Smooth scroll to sections
 */
export function initSmoothScroll() {
  // Check if browser supports smooth scrolling
  const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
  
  // Handle anchor links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    
    const targetId = link.getAttribute('href');
    if (targetId === '#') return;
    
    const target = document.querySelector(targetId);
    if (!target) return;
    
    e.preventDefault();
    
    // Calculate offset for fixed header
    const header = document.querySelector('.od-header');
    const headerHeight = header ? header.offsetHeight : 0;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
    
    if (supportsNativeSmoothScroll) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      // Fallback for older browsers
      smoothScrollTo(targetPosition, 600);
    }
    
    // Update URL without jumping
    if (history.pushState) {
      history.pushState(null, null, targetId);
    }
  });
}

/**
 * Smooth scroll polyfill
 */
function smoothScrollTo(target, duration) {
  const start = window.scrollY;
  const distance = target - start;
  const startTime = performance.now();
  
  function ease(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  function scroll() {
    const now = performance.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = ease(progress);
    
    window.scrollTo(0, start + distance * easeProgress);
    
    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }
  
  requestAnimationFrame(scroll);
}

/**
 * Back to top button behavior
 */
export function initBackToTop() {
  // Create button
  const button = document.createElement('button');
  button.className = 'od-back-to-top';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  `;
  button.setAttribute('aria-label', 'Nach oben scrollen');
  document.body.appendChild(button);
  
  // Add styles
  const styles = `
    .od-back-to-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 48px;
      height: 48px;
      background: var(--od-primary);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.3s ease;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .od-back-to-top:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    
    .od-back-to-top--visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    @media (max-width: 768px) {
      .od-back-to-top {
        bottom: 1rem;
        right: 1rem;
        width: 40px;
        height: 40px;
      }
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Show/hide based on scroll position
  const toggleButton = throttle(() => {
    if (window.scrollY > 500) {
      button.classList.add('od-back-to-top--visible');
    } else {
      button.classList.remove('od-back-to-top--visible');
    }
  }, 100);
  
  window.addEventListener('scroll', toggleButton, { passive: true });
  
  // Scroll to top on click
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Initial check
  toggleButton();
}

/**
 * Scroll-triggered animations for elements
 */
export function initScrollTriggers() {
  const triggers = document.querySelectorAll('[data-scroll-trigger]');
  
  if (triggers.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const triggerClass = element.dataset.scrollTrigger;
        
        // Add trigger class
        element.classList.add(triggerClass);
        
        // Dispatch custom event
        element.dispatchEvent(new CustomEvent('scrollTrigger', {
          detail: { triggered: true }
        }));
        
        // Unobserve if not repeatable
        if (element.dataset.scrollRepeat !== 'true') {
          observer.unobserve(element);
        }
      } else if (entry.target.dataset.scrollRepeat === 'true') {
        // Remove class for repeatable triggers
        const triggerClass = entry.target.dataset.scrollTrigger;
        entry.target.classList.remove(triggerClass);
      }
    });
  }, {
    threshold: parseFloat(document.body.dataset.scrollThreshold || '0.5'),
    rootMargin: document.body.dataset.scrollMargin || '-50px'
  });
  
  triggers.forEach(trigger => observer.observe(trigger));
}

/**
 * Sticky elements with smart behavior
 */
export function initStickyElements() {
  const stickyElements = document.querySelectorAll('.od-sticky');
  
  stickyElements.forEach(element => {
    const parent = element.parentElement;
    const offset = parseInt(element.dataset.stickyOffset || '80');
    
    // Create sentinel element
    const sentinel = document.createElement('div');
    sentinel.className = 'od-sticky-sentinel';
    parent.insertBefore(sentinel, element);
    
    // Observer for sticky state
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        element.classList.add('od-sticky--stuck');
        element.style.top = `${offset}px`;
      } else {
        element.classList.remove('od-sticky--stuck');
      }
    }, {
      rootMargin: `-${offset}px 0px 0px 0px`,
      threshold: 0
    });
    
    observer.observe(sentinel);
  });
}

/**
 * Initialize all scroll effects
 */
export function initAllScrollEffects() {
  initHeaderScroll();
  initProgressIndicator();
  initSmoothScroll();
  initBackToTop();
  initScrollTriggers();
  initStickyElements();
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllScrollEffects);
} else {
  initAllScrollEffects();
}