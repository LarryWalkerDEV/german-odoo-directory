// animations.js - Main animation controller using Intersection Observer
// Grove.ai-inspired animations with performance optimizations

import { siteConfig } from '../../config/site-config.js';

// Animation configuration from site config
const { 
  intersectionThreshold, 
  rootMargin, 
  staggerDelay,
  transitionDuration 
} = siteConfig.animationSettings;

// Cache for animated elements to prevent re-animation
const animatedElements = new WeakSet();

// Intersection Observer instance
let observer = null;

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Initialize Intersection Observer for scroll animations
 */
export function initScrollAnimations() {
  if (prefersReducedMotion) {
    // Show all elements immediately if user prefers reduced motion
    document.querySelectorAll('.od-animate').forEach(el => {
      el.classList.add('od-animate--visible');
    });
    return;
  }

  // Create Intersection Observer
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animatedElements.has(entry.target)) {
        // Add visible class with requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          entry.target.classList.add('od-animate--visible');
          animatedElements.add(entry.target);
          
          // Unobserve after animation to improve performance
          observer.unobserve(entry.target);
        });
      }
    });
  }, {
    threshold: intersectionThreshold,
    rootMargin: rootMargin
  });

  // Observe all animatable elements
  observeElements();
}

/**
 * Find and observe all elements with animation classes
 */
function observeElements() {
  const elements = document.querySelectorAll('.od-animate');
  
  elements.forEach((element, index) => {
    // Auto-apply stagger delay based on index if in a group
    if (element.closest('.od-animate-group')) {
      const delay = Math.min(index * staggerDelay, 800); // Cap at 800ms
      element.style.transitionDelay = `${delay}ms`;
    }
    
    observer.observe(element);
  });
}

/**
 * Staggered animation for card grids and lists
 */
export function initStaggeredAnimations() {
  if (prefersReducedMotion) return;

  const staggerGroups = document.querySelectorAll('.od-stagger-group');
  
  staggerGroups.forEach(group => {
    const items = group.querySelectorAll('.od-stagger-item');
    
    // Create observer specifically for this group
    const groupObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate all items in the group with stagger
          items.forEach((item, index) => {
            setTimeout(() => {
              requestAnimationFrame(() => {
                item.classList.add('od-animate--visible');
              });
            }, index * staggerDelay);
          });
          
          // Unobserve the group after triggering
          groupObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '-50px'
    });
    
    groupObserver.observe(group);
  });
}

/**
 * Parallax effect for hero sections and images
 */
export function initParallaxEffects() {
  if (prefersReducedMotion) return;

  const parallaxElements = document.querySelectorAll('.od-parallax');
  
  if (parallaxElements.length === 0) return;

  // Throttle function for performance
  let ticking = false;
  
  function updateParallax() {
    if (ticking) return;
    
    ticking = true;
    requestAnimationFrame(() => {
      parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
        const yPos = rect.top * speed;
        
        // Only update if element is in viewport
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          element.style.transform = `translateY(${yPos}px)`;
        }
      });
      
      ticking = false;
    });
  }

  // Add scroll listener with passive flag for better performance
  window.addEventListener('scroll', updateParallax, { passive: true });
  
  // Initial update
  updateParallax();
}

/**
 * Magnetic hover effect for buttons (Grove.ai style)
 */
export function initMagneticButtons() {
  if (prefersReducedMotion) return;

  const magneticButtons = document.querySelectorAll('.od-magnetic');
  
  magneticButtons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Limit movement to prevent too much distortion
      const moveX = x * 0.3;
      const moveY = y * 0.3;
      
      button.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0)';
    });
  });
}

/**
 * Reveal animation for text (letter by letter or word by word)
 */
export function initTextReveal() {
  if (prefersReducedMotion) return;

  const textElements = document.querySelectorAll('.od-text-reveal');
  
  const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animatedElements.has(entry.target)) {
        const element = entry.target;
        const text = element.textContent;
        const isLetterReveal = element.classList.contains('od-text-reveal--letters');
        
        element.innerHTML = '';
        
        // Split text into spans
        const parts = isLetterReveal ? text.split('') : text.split(' ');
        
        parts.forEach((part, index) => {
          const span = document.createElement('span');
          span.textContent = isLetterReveal ? part : part + ' ';
          span.style.opacity = '0';
          span.style.display = 'inline-block';
          span.style.transform = 'translateY(20px)';
          span.style.transition = `all ${transitionDuration}ms ease-out`;
          span.style.transitionDelay = `${index * 30}ms`;
          
          element.appendChild(span);
        });
        
        // Trigger animation
        requestAnimationFrame(() => {
          element.querySelectorAll('span').forEach(span => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
          });
        });
        
        animatedElements.add(element);
        textObserver.unobserve(element);
      }
    });
  }, {
    threshold: 0.5
  });
  
  textElements.forEach(el => textObserver.observe(el));
}

/**
 * Image lazy loading with fade-in effect
 */
export function initImageLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Create new image to preload
        const newImg = new Image();
        newImg.onload = () => {
          requestAnimationFrame(() => {
            img.src = newImg.src;
            img.classList.add('od-loaded');
            img.removeAttribute('data-src');
          });
        };
        
        newImg.src = img.dataset.src;
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  images.forEach(img => {
    img.classList.add('od-lazy-image');
    imageObserver.observe(img);
  });
}

/**
 * Smooth reveal for sections
 */
export function initSectionReveals() {
  if (prefersReducedMotion) return;

  const sections = document.querySelectorAll('.od-section-reveal');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        const elements = section.querySelectorAll('.od-reveal-item');
        
        elements.forEach((el, index) => {
          setTimeout(() => {
            requestAnimationFrame(() => {
              el.classList.add('od-animate--visible');
            });
          }, index * 100);
        });
        
        sectionObserver.unobserve(section);
      }
    });
  }, {
    threshold: 0.3
  });
  
  sections.forEach(section => sectionObserver.observe(section));
}

/**
 * Cleanup function to disconnect observers
 */
export function cleanupAnimations() {
  if (observer) {
    observer.disconnect();
  }
}

/**
 * Re-initialize animations (useful for dynamically added content)
 */
export function refreshAnimations() {
  cleanupAnimations();
  initScrollAnimations();
  initStaggeredAnimations();
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}