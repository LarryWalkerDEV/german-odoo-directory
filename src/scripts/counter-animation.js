// counter-animation.js - Animated number counters with easing
// Implements Grove.ai-style dramatic 2s counter animations

import { siteConfig } from '../../config/site-config.js';

const { counterDuration } = siteConfig.animationSettings;

// Track animated counters to prevent re-animation
const animatedCounters = new WeakSet();

// Easing functions for smooth animation
const easingFunctions = {
  // Ease out cubic for smooth deceleration
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  
  // Ease out quart for more dramatic deceleration
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  
  // Ease out expo for very dramatic deceleration
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  
  // Custom easing for counter (starts fast, ends slow)
  counterEase: (t) => {
    if (t < 0.5) {
      return 4 * t * t * t;
    }
    return 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
};

/**
 * Format number with German locale (1.000 format)
 */
function formatNumber(num, decimals = 0) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * Parse formatted number back to float
 */
function parseFormattedNumber(str) {
  // Remove German thousand separators and replace comma with dot
  return parseFloat(str.replace(/\./g, '').replace(',', '.'));
}

/**
 * Animate a single counter element
 */
function animateCounter(element, options = {}) {
  // Skip if already animated or user prefers reduced motion
  if (animatedCounters.has(element) || 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Get configuration
  const startValue = parseFloat(element.dataset.countFrom || '0');
  const endValue = parseFloat(element.dataset.countTo || element.textContent);
  const duration = parseInt(element.dataset.duration || options.duration || counterDuration);
  const decimals = parseInt(element.dataset.decimals || '0');
  const suffix = element.dataset.suffix || '';
  const prefix = element.dataset.prefix || '';
  const easingName = element.dataset.easing || options.easing || 'counterEase';
  const easing = easingFunctions[easingName] || easingFunctions.counterEase;

  // Mark as animated
  animatedCounters.add(element);

  // Animation variables
  let startTime = null;
  const difference = endValue - startValue;

  // Animation function
  function updateCounter(currentTime) {
    if (!startTime) startTime = currentTime;
    
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply easing
    const easedProgress = easing(progress);
    const currentValue = startValue + (difference * easedProgress);
    
    // Update element with formatted number
    element.textContent = prefix + formatNumber(currentValue, decimals) + suffix;
    
    // Add animation classes for styling
    if (progress === 0) {
      element.classList.add('od-counter--animating');
    }
    
    // Continue animation or finish
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.classList.remove('od-counter--animating');
      element.classList.add('od-counter--complete');
      
      // Ensure final value is exact
      element.textContent = prefix + formatNumber(endValue, decimals) + suffix;
      
      // Dispatch custom event
      element.dispatchEvent(new CustomEvent('counterComplete', {
        detail: { value: endValue }
      }));
    }
  }

  // Start animation
  requestAnimationFrame(updateCounter);
}

/**
 * Initialize counter animations with Intersection Observer
 */
export function initCounterAnimations() {
  const counters = document.querySelectorAll('.od-counter');
  
  if (counters.length === 0) return;

  // Create observer for counters
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Slight delay for dramatic effect
        setTimeout(() => {
          animateCounter(entry.target);
        }, 200);
        
        counterObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '-50px'
  });

  // Observe all counters
  counters.forEach(counter => {
    // Set initial value
    if (counter.dataset.countFrom !== undefined) {
      const startValue = parseFloat(counter.dataset.countFrom);
      const decimals = parseInt(counter.dataset.decimals || '0');
      const prefix = counter.dataset.prefix || '';
      const suffix = counter.dataset.suffix || '';
      
      counter.textContent = prefix + formatNumber(startValue, decimals) + suffix;
    }
    
    counterObserver.observe(counter);
  });
}

/**
 * Animate multiple counters in sequence
 */
export function animateCounterSequence(counters, delay = 300) {
  counters.forEach((counter, index) => {
    setTimeout(() => {
      animateCounter(counter);
    }, index * delay);
  });
}

/**
 * Create and animate a counter from any element
 */
export function createCounter(element, endValue, options = {}) {
  // Convert element to counter
  element.classList.add('od-counter');
  element.dataset.countTo = endValue;
  
  // Apply options as data attributes
  if (options.from !== undefined) element.dataset.countFrom = options.from;
  if (options.duration) element.dataset.duration = options.duration;
  if (options.decimals) element.dataset.decimals = options.decimals;
  if (options.prefix) element.dataset.prefix = options.prefix;
  if (options.suffix) element.dataset.suffix = options.suffix;
  if (options.easing) element.dataset.easing = options.easing;
  
  // Animate immediately or return for later
  if (options.immediate !== false) {
    animateCounter(element, options);
  }
  
  return element;
}

/**
 * Percentage counter with progress bar
 */
export function animateProgressCounter(element) {
  const progressBar = element.querySelector('.od-progress__bar');
  const counter = element.querySelector('.od-counter');
  
  if (!progressBar || !counter) return;
  
  const percentage = parseFloat(progressBar.dataset.percent || '0');
  
  // Create counter for percentage
  createCounter(counter, percentage, {
    suffix: '%',
    duration: 2000,
    easing: 'easeOutQuart'
  });
  
  // Animate progress bar width
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          progressBar.style.width = percentage + '%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });
  
  observer.observe(element);
}

/**
 * Statistics counter group animation
 */
export function animateStatGroup(container) {
  const counters = container.querySelectorAll('.od-counter');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate all counters with stagger
        animateCounterSequence(counters, 200);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3
  });
  
  observer.observe(container);
}

/**
 * Initialize all counter types
 */
export function initAllCounters() {
  // Basic counters
  initCounterAnimations();
  
  // Progress counters
  document.querySelectorAll('.od-progress-counter').forEach(animateProgressCounter);
  
  // Stat groups
  document.querySelectorAll('.od-stat-group').forEach(animateStatGroup);
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllCounters);
} else {
  initAllCounters();
}