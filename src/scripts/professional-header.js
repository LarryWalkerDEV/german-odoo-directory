/**
 * Professional Header Interactions
 * Handles sticky header, mobile menu, and dropdown interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Header elements
  const header = document.querySelector('.pro-header');
  const mobileToggle = document.querySelector('.pro-header__mobile-toggle');
  const mobileMenu = document.querySelector('.pro-header__mobile-menu');
  const dropdownToggles = document.querySelectorAll('.pro-header__dropdown-toggle');
  const mobileDropdownToggles = document.querySelectorAll('.pro-header__mobile-dropdown-toggle');
  
  // Sticky header on scroll
  let lastScrollY = 0;
  let ticking = false;
  
  function updateHeaderState() {
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
      header.classList.add('pro-header--scrolled');
    } else {
      header.classList.remove('pro-header--scrolled');
    }
    
    lastScrollY = scrollY;
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick);
  
  // Mobile menu toggle
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function() {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      
      mobileToggle.setAttribute('aria-expanded', !isOpen);
      mobileMenu.classList.toggle('pro-header__mobile-menu--open', !isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });
    
    // Close mobile menu on escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('pro-header__mobile-menu--open')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('pro-header__mobile-menu--open');
        document.body.style.overflow = '';
      }
    });
  }
  
  // Desktop dropdown interactions
  dropdownToggles.forEach(toggle => {
    const dropdown = toggle.nextElementSibling;
    let closeTimeout;
    
    toggle.addEventListener('mouseenter', function() {
      clearTimeout(closeTimeout);
      toggle.setAttribute('aria-expanded', 'true');
    });
    
    toggle.addEventListener('mouseleave', function() {
      closeTimeout = setTimeout(() => {
        toggle.setAttribute('aria-expanded', 'false');
      }, 200);
    });
    
    if (dropdown) {
      dropdown.addEventListener('mouseenter', function() {
        clearTimeout(closeTimeout);
      });
      
      dropdown.addEventListener('mouseleave', function() {
        closeTimeout = setTimeout(() => {
          toggle.setAttribute('aria-expanded', 'false');
        }, 200);
      });
    }
    
    // Keyboard navigation
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isOpen);
    });
  });
  
  // Mobile dropdown interactions
  mobileDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const dropdown = toggle.nextElementSibling;
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      
      toggle.setAttribute('aria-expanded', !isOpen);
      if (dropdown) {
        dropdown.classList.toggle('pro-header__mobile-dropdown--open', !isOpen);
      }
    });
  });
  
  // Active page highlighting
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.pro-header__nav-link, .pro-header__mobile-nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.startsWith(href) && href !== '/') {
      link.classList.add('pro-header__nav-link--active');
    } else if (href === '/' && currentPath === '/') {
      link.classList.add('pro-header__nav-link--active');
    }
  });
});