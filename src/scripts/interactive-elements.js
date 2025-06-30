// interactive-elements.js - Interactive UI elements with Grove.ai-inspired effects
// Card hovers, button ripples, form animations, dropdowns

/**
 * Card hover effects with 3D tilt
 */
export function initCardHoverEffects() {
  const cards = document.querySelectorAll('.od-card-3d, .od-partner-card, .od-blog-card');
  
  cards.forEach(card => {
    // Skip if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    card.addEventListener('mouseenter', handleCardEnter);
    card.addEventListener('mousemove', handleCardMove);
    card.addEventListener('mouseleave', handleCardLeave);
  });
  
  function handleCardEnter(e) {
    const card = e.currentTarget;
    card.style.transition = 'transform 0.1s ease-out';
  }
  
  function handleCardMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    // Apply 3D transform
    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(10px)
    `;
    
    // Add shine effect
    const shine = card.querySelector('.od-card-shine');
    if (shine) {
      const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;
      shine.style.background = `
        radial-gradient(
          circle at ${shineX}% ${shineY}%,
          rgba(255, 255, 255, 0.3) 0%,
          rgba(255, 255, 255, 0) 80%
        )
      `;
    }
  }
  
  function handleCardLeave(e) {
    const card = e.currentTarget;
    card.style.transition = 'transform 0.5s ease-out';
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    
    const shine = card.querySelector('.od-card-shine');
    if (shine) {
      shine.style.background = 'none';
    }
  }
}

/**
 * Button ripple effects
 */
export function initButtonRipples() {
  const buttons = document.querySelectorAll('.od-btn, .od-ripple');
  
  buttons.forEach(button => {
    button.addEventListener('click', createRipple);
  });
  
  function createRipple(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate ripple position
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = 'od-ripple-effect';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    // Add ripple to button
    button.appendChild(ripple);
    
    // Calculate scale based on button size
    const scale = Math.max(rect.width, rect.height) * 2;
    
    // Animate ripple
    requestAnimationFrame(() => {
      ripple.style.transform = `scale(${scale})`;
      ripple.style.opacity = '0';
    });
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  // Add ripple styles if not already present
  if (!document.querySelector('#od-ripple-styles')) {
    const styles = `
      .od-ripple-effect {
        position: absolute;
        width: 1px;
        height: 1px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: scale(0);
        opacity: 1;
        transition: transform 0.6s ease-out, opacity 0.6s ease-out;
        pointer-events: none;
      }
      
      .od-btn, .od-ripple {
        position: relative;
        overflow: hidden;
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'od-ripple-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

/**
 * Form field animations
 */
export function initFormAnimations() {
  // Floating labels
  const floatingInputs = document.querySelectorAll('.od-floating-label input, .od-floating-label textarea');
  
  floatingInputs.forEach(input => {
    // Check initial state
    checkFloatingLabel(input);
    
    // Add event listeners
    input.addEventListener('focus', () => handleFloatingFocus(input, true));
    input.addEventListener('blur', () => handleFloatingFocus(input, false));
    input.addEventListener('input', () => checkFloatingLabel(input));
  });
  
  function checkFloatingLabel(input) {
    const label = input.nextElementSibling;
    if (!label || !label.classList.contains('od-floating-label__label')) return;
    
    if (input.value || input === document.activeElement) {
      label.classList.add('od-floating-label__label--active');
    } else {
      label.classList.remove('od-floating-label__label--active');
    }
  }
  
  function handleFloatingFocus(input, focused) {
    const wrapper = input.closest('.od-floating-label');
    if (!wrapper) return;
    
    if (focused) {
      wrapper.classList.add('od-floating-label--focused');
    } else {
      wrapper.classList.remove('od-floating-label--focused');
    }
    
    checkFloatingLabel(input);
  }
  
  // Input validation animations
  const inputs = document.querySelectorAll('.od-input[required], .od-input[pattern]');
  
  inputs.forEach(input => {
    input.addEventListener('blur', validateInput);
    input.addEventListener('input', () => {
      if (input.classList.contains('od-input--error')) {
        validateInput.call(input);
      }
    });
  });
  
  function validateInput() {
    const input = this;
    const isValid = input.checkValidity();
    
    if (!input.value) {
      input.classList.remove('od-input--error', 'od-input--success');
      return;
    }
    
    if (isValid) {
      input.classList.remove('od-input--error');
      input.classList.add('od-input--success');
      
      // Success animation
      const wrapper = input.closest('.od-input-wrapper');
      if (wrapper) {
        wrapper.style.animation = 'od-pulse 0.3s ease';
        setTimeout(() => {
          wrapper.style.animation = '';
        }, 300);
      }
    } else {
      input.classList.add('od-input--error');
      input.classList.remove('od-input--success');
      
      // Error shake animation
      input.style.animation = 'od-shake 0.3s ease';
      setTimeout(() => {
        input.style.animation = '';
      }, 300);
    }
  }
  
  // Add validation styles and animations
  if (!document.querySelector('#od-form-styles')) {
    const styles = `
      @keyframes od-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      .od-input--success {
        border-color: var(--od-accent);
      }
      
      .od-input--error {
        border-color: var(--od-error);
      }
      
      .od-floating-label__label--active {
        top: 0.5rem;
        font-size: 0.75rem;
        color: var(--od-primary);
      }
      
      .od-floating-label--focused .od-floating-label__label {
        color: var(--od-primary);
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'od-form-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

/**
 * Dropdown behaviors
 */
export function initDropdowns() {
  const dropdowns = document.querySelectorAll('.od-dropdown');
  
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.od-dropdown__trigger');
    const menu = dropdown.querySelector('.od-dropdown__menu');
    
    if (!trigger || !menu) return;
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(dropdown);
    });
    
    // Close on outside click
    document.addEventListener('click', () => {
      closeDropdown(dropdown);
    });
    
    // Prevent closing when clicking inside menu
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Keyboard navigation
    dropdown.addEventListener('keydown', (e) => {
      handleDropdownKeyboard(e, dropdown);
    });
  });
  
  function toggleDropdown(dropdown) {
    const isOpen = dropdown.classList.contains('od-dropdown--open');
    
    // Close all other dropdowns
    document.querySelectorAll('.od-dropdown--open').forEach(d => {
      if (d !== dropdown) closeDropdown(d);
    });
    
    if (isOpen) {
      closeDropdown(dropdown);
    } else {
      openDropdown(dropdown);
    }
  }
  
  function openDropdown(dropdown) {
    const menu = dropdown.querySelector('.od-dropdown__menu');
    
    dropdown.classList.add('od-dropdown--open');
    dropdown.setAttribute('aria-expanded', 'true');
    
    // Animate menu
    requestAnimationFrame(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'translateY(0)';
    });
    
    // Focus first item
    const firstItem = menu.querySelector('.od-dropdown__item');
    if (firstItem) firstItem.focus();
  }
  
  function closeDropdown(dropdown) {
    const menu = dropdown.querySelector('.od-dropdown__menu');
    
    dropdown.classList.remove('od-dropdown--open');
    dropdown.setAttribute('aria-expanded', 'false');
    
    // Animate menu
    menu.style.opacity = '0';
    menu.style.transform = 'translateY(-10px)';
  }
  
  function handleDropdownKeyboard(e, dropdown) {
    const items = dropdown.querySelectorAll('.od-dropdown__item');
    const currentIndex = Array.from(items).indexOf(document.activeElement);
    
    switch (e.key) {
      case 'Escape':
        closeDropdown(dropdown);
        dropdown.querySelector('.od-dropdown__trigger').focus();
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1].focus();
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex - 1].focus();
        }
        break;
        
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
        
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  }
}

/**
 * Tooltip interactions
 */
export function initTooltips() {
  const tooltips = document.querySelectorAll('[data-tooltip]');
  
  tooltips.forEach(element => {
    const tooltipText = element.dataset.tooltip;
    const position = element.dataset.tooltipPosition || 'top';
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = `od-tooltip-popup od-tooltip-popup--${position}`;
    tooltip.textContent = tooltipText;
    
    // Show tooltip on hover/focus
    element.addEventListener('mouseenter', () => showTooltip(element, tooltip));
    element.addEventListener('focus', () => showTooltip(element, tooltip));
    
    // Hide tooltip
    element.addEventListener('mouseleave', () => hideTooltip(tooltip));
    element.addEventListener('blur', () => hideTooltip(tooltip));
  });
  
  function showTooltip(element, tooltip) {
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top, left;
    const position = element.dataset.tooltipPosition || 'top';
    
    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + 8;
        break;
    }
    
    // Ensure tooltip stays within viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    
    // Animate in
    requestAnimationFrame(() => {
      tooltip.classList.add('od-tooltip-popup--visible');
    });
  }
  
  function hideTooltip(tooltip) {
    tooltip.classList.remove('od-tooltip-popup--visible');
    
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 200);
  }
  
  // Add tooltip styles
  if (!document.querySelector('#od-tooltip-styles')) {
    const styles = `
      .od-tooltip-popup {
        position: fixed;
        background: var(--od-gray-900);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        white-space: nowrap;
        opacity: 0;
        transform: scale(0.9);
        transition: all 0.2s ease;
        pointer-events: none;
        z-index: 1001;
      }
      
      .od-tooltip-popup--visible {
        opacity: 1;
        transform: scale(1);
      }
      
      .od-tooltip-popup::after {
        content: '';
        position: absolute;
        border: 4px solid transparent;
      }
      
      .od-tooltip-popup--top::after {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: var(--od-gray-900);
      }
      
      .od-tooltip-popup--bottom::after {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: var(--od-gray-900);
      }
      
      .od-tooltip-popup--left::after {
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-left-color: var(--od-gray-900);
      }
      
      .od-tooltip-popup--right::after {
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-right-color: var(--od-gray-900);
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'od-tooltip-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

/**
 * Tab navigation
 */
export function initTabs() {
  const tabGroups = document.querySelectorAll('.od-tabs');
  
  tabGroups.forEach(group => {
    const tabs = group.querySelectorAll('.od-tab');
    const panels = group.querySelectorAll('.od-tab-panel');
    
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Update tabs
        tabs.forEach(t => {
          t.classList.remove('od-tab--active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('od-tab--active');
        tab.setAttribute('aria-selected', 'true');
        
        // Update panels
        panels.forEach(p => {
          p.classList.remove('od-tab-panel--active');
          p.setAttribute('aria-hidden', 'true');
        });
        if (panels[index]) {
          panels[index].classList.add('od-tab-panel--active');
          panels[index].setAttribute('aria-hidden', 'false');
          
          // Animate panel
          panels[index].style.animation = 'od-fade-in 0.3s ease';
        }
      });
      
      // Keyboard navigation
      tab.addEventListener('keydown', (e) => {
        let newIndex = index;
        
        switch (e.key) {
          case 'ArrowLeft':
            newIndex = index > 0 ? index - 1 : tabs.length - 1;
            break;
          case 'ArrowRight':
            newIndex = index < tabs.length - 1 ? index + 1 : 0;
            break;
          case 'Home':
            newIndex = 0;
            break;
          case 'End':
            newIndex = tabs.length - 1;
            break;
          default:
            return;
        }
        
        e.preventDefault();
        tabs[newIndex].click();
        tabs[newIndex].focus();
      });
    });
  });
}

/**
 * Initialize all interactive elements
 */
export function initAllInteractiveElements() {
  initCardHoverEffects();
  initButtonRipples();
  initFormAnimations();
  initDropdowns();
  initTooltips();
  initTabs();
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllInteractiveElements);
} else {
  initAllInteractiveElements();
}