/**
 * Filter Manager Module
 * Manages multiple active filters, URL state persistence, and mobile filter UI
 */

class FilterManager {
  constructor() {
    this.searchForm = document.querySelector('[data-partner-search]');
    this.activeFiltersContainer = document.querySelector('[data-active-filters]');
    this.resultsCount = document.querySelector('[data-results-count]');
    this.sortSelect = document.querySelector('[data-sort]');
    this.viewToggle = document.querySelectorAll('[data-view]');
    
    this.filters = {
      keyword: '',
      location: '',
      radius: '',
      services: [],
      industries: [],
      companySize: [],
      certifications: []
    };
    
    this.mobileFilterDrawer = null;
    this.filterChangeCallbacks = [];
    
    this.init();
  }
  
  init() {
    if (!this.searchForm) return;
    
    // Create mobile filter drawer
    this.createMobileFilterDrawer();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize from URL
    this.loadFiltersFromURL();
    
    // Set up view toggle
    this.setupViewToggle();
  }
  
  createMobileFilterDrawer() {
    // Create mobile filter button
    const mobileFilterButton = document.createElement('button');
    mobileFilterButton.className = 'od-mobile-filter-toggle';
    mobileFilterButton.innerHTML = `
      <svg class="od-icon" width="20" height="20" viewBox="0 0 20 20">
        <path fill="currentColor" d="M2 4h16v2H2zm0 5h10v2H2zm0 5h6v2H2z"/>
      </svg>
      <span>Filter</span>
      <span class="od-mobile-filter-toggle__count" data-mobile-filter-count hidden>0</span>
    `;
    
    // Insert before results
    const resultsSection = document.querySelector('.od-partner-results');
    if (resultsSection) {
      resultsSection.insertBefore(mobileFilterButton, resultsSection.firstChild);
    }
    
    // Create drawer overlay
    this.mobileFilterDrawer = document.createElement('div');
    this.mobileFilterDrawer.className = 'od-mobile-filter-drawer';
    this.mobileFilterDrawer.innerHTML = `
      <div class="od-mobile-filter-drawer__backdrop"></div>
      <div class="od-mobile-filter-drawer__content">
        <div class="od-mobile-filter-drawer__header">
          <h2 class="od-mobile-filter-drawer__title">Filter</h2>
          <button type="button" class="od-mobile-filter-drawer__close" aria-label="Filter schließen">
            <svg class="od-icon" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/>
            </svg>
          </button>
        </div>
        <div class="od-mobile-filter-drawer__body">
          <!-- Filters will be cloned here -->
        </div>
        <div class="od-mobile-filter-drawer__footer">
          <button type="button" class="od-btn od-btn--secondary" data-mobile-clear>
            Filter zurücksetzen
          </button>
          <button type="button" class="od-btn od-btn--primary" data-mobile-apply>
            Anwenden
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.mobileFilterDrawer);
    
    // Set up mobile filter events
    mobileFilterButton.addEventListener('click', () => {
      this.openMobileFilters();
    });
    
    const backdrop = this.mobileFilterDrawer.querySelector('.od-mobile-filter-drawer__backdrop');
    const closeButton = this.mobileFilterDrawer.querySelector('.od-mobile-filter-drawer__close');
    
    backdrop.addEventListener('click', () => {
      this.closeMobileFilters();
    });
    
    closeButton.addEventListener('click', () => {
      this.closeMobileFilters();
    });
    
    // Apply and clear buttons
    const applyButton = this.mobileFilterDrawer.querySelector('[data-mobile-apply]');
    const clearButton = this.mobileFilterDrawer.querySelector('[data-mobile-clear]');
    
    applyButton.addEventListener('click', () => {
      this.applyMobileFilters();
    });
    
    clearButton.addEventListener('click', () => {
      this.clearAllFilters();
      this.closeMobileFilters();
    });
  }
  
  setupEventListeners() {
    // Form change events
    this.searchForm.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox' || e.target.type === 'radio') {
        this.updateFilters();
      }
    });
    
    // Sort change
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', () => {
        this.updateURL();
        this.notifyFilterChange();
      });
    }
    
    // Clear all filters
    const clearAllButton = document.querySelector('[data-clear-all]');
    if (clearAllButton) {
      clearAllButton.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
    
    // Active filter removal
    if (this.activeFiltersContainer) {
      this.activeFiltersContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.od-active-filters__tag');
        if (tag) {
          this.removeFilter(tag.dataset.filterType, tag.dataset.filterValue);
        }
      });
    }
    
    // Browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.loadFiltersFromURL();
      this.notifyFilterChange();
    });
  }
  
  setupViewToggle() {
    this.viewToggle.forEach(button => {
      button.addEventListener('click', () => {
        const view = button.dataset.view;
        this.setView(view);
      });
    });
    
    // Load view preference from localStorage
    const savedView = localStorage.getItem('partnerViewPreference') || 'grid';
    this.setView(savedView);
  }
  
  setView(view) {
    // Update buttons
    this.viewToggle.forEach(button => {
      const isActive = button.dataset.view === view;
      button.classList.toggle('od-view-toggle__btn--active', isActive);
      button.setAttribute('aria-pressed', isActive);
    });
    
    // Update view containers
    document.querySelectorAll('[data-view-target]').forEach(container => {
      container.style.display = container.dataset.viewTarget === view ? '' : 'none';
    });
    
    // Save preference
    localStorage.setItem('partnerViewPreference', view);
    
    // Update container class for styling
    const partnersContainer = document.querySelector('.od-partners-container');
    if (partnersContainer) {
      partnersContainer.className = `od-partners-container od-partners-container--${view}`;
    }
  }
  
  updateFilters() {
    const formData = new FormData(this.searchForm);
    
    this.filters = {
      keyword: formData.get('keyword') || '',
      location: formData.get('location') || '',
      radius: formData.get('radius') || '',
      services: formData.getAll('services[]'),
      industries: formData.getAll('industries[]'),
      companySize: formData.getAll('company_size[]'),
      certifications: formData.getAll('certifications[]')
    };
    
    this.updateActiveFiltersDisplay();
    this.updateURL();
    this.updateMobileFilterCount();
    this.notifyFilterChange();
  }
  
  updateActiveFiltersDisplay() {
    if (!this.activeFiltersContainer) return;
    
    const filterList = this.activeFiltersContainer.querySelector('.od-active-filters__list');
    if (!filterList) return;
    
    // Clear existing
    filterList.innerHTML = '';
    
    const activeFilters = this.getActiveFilters();
    
    // Show/hide container
    this.activeFiltersContainer.hidden = activeFilters.length === 0;
    
    // Create filter tags
    activeFilters.forEach(filter => {
      const tag = document.createElement('button');
      tag.className = 'od-active-filters__tag';
      tag.dataset.filterType = filter.type;
      tag.dataset.filterValue = filter.value;
      tag.innerHTML = `
        ${filter.label}
        <svg class="od-icon od-icon--xs" width="12" height="12" viewBox="0 0 12 12">
          <path fill="currentColor" d="M7.4 6l2.3-2.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L6 4.6 3.7 2.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4L4.6 6 2.3 8.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3L6 7.4l2.3 2.3c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4L7.4 6z"/>
        </svg>
      `;
      
      filterList.appendChild(tag);
    });
  }
  
  getActiveFilters() {
    const filters = [];
    
    // Location filter
    if (this.filters.location) {
      let label = this.filters.location;
      if (this.filters.radius) {
        label += ` (${this.filters.radius} km)`;
      }
      filters.push({ type: 'location', value: this.filters.location, label });
    }
    
    // Service filters
    this.filters.services.forEach(service => {
      filters.push({
        type: 'service',
        value: service,
        label: this.getServiceLabel(service)
      });
    });
    
    // Industry filters
    this.filters.industries.forEach(industry => {
      filters.push({
        type: 'industry',
        value: industry,
        label: this.getIndustryLabel(industry)
      });
    });
    
    // Company size filters
    this.filters.companySize.forEach(size => {
      filters.push({
        type: 'companySize',
        value: size,
        label: this.getCompanySizeLabel(size)
      });
    });
    
    // Certification filters
    this.filters.certifications.forEach(cert => {
      filters.push({
        type: 'certification',
        value: cert,
        label: this.getCertificationLabel(cert)
      });
    });
    
    return filters;
  }
  
  removeFilter(type, value) {
    switch (type) {
      case 'location':
        document.getElementById('partner-location').value = '';
        document.getElementById('partner-radius').value = '';
        break;
        
      case 'service':
        this.uncheckFilter('services[]', value);
        break;
        
      case 'industry':
        this.uncheckFilter('industries[]', value);
        break;
        
      case 'companySize':
        this.uncheckFilter('company_size[]', value);
        break;
        
      case 'certification':
        this.uncheckFilter('certifications[]', value);
        break;
    }
    
    this.updateFilters();
  }
  
  uncheckFilter(name, value) {
    const checkbox = this.searchForm.querySelector(`input[name="${name}"][value="${value}"]`);
    if (checkbox) {
      checkbox.checked = false;
    }
  }
  
  clearAllFilters() {
    // Reset form
    this.searchForm.reset();
    
    // Clear URL parameters
    const url = new URL(window.location);
    url.search = '';
    window.history.pushState({}, '', url);
    
    // Update filters
    this.updateFilters();
  }
  
  updateURL() {
    const params = new URLSearchParams();
    
    // Add filters to URL
    if (this.filters.keyword) params.set('q', this.filters.keyword);
    if (this.filters.location) params.set('location', this.filters.location);
    if (this.filters.radius) params.set('radius', this.filters.radius);
    if (this.filters.services.length) params.set('services', this.filters.services.join(','));
    if (this.filters.industries.length) params.set('industries', this.filters.industries.join(','));
    if (this.filters.companySize.length) params.set('size', this.filters.companySize.join(','));
    if (this.filters.certifications.length) params.set('certs', this.filters.certifications.join(','));
    
    // Add sort
    const sort = this.sortSelect?.value;
    if (sort && sort !== 'relevance') {
      params.set('sort', sort);
    }
    
    // Update URL without reload
    const url = new URL(window.location);
    url.search = params.toString();
    window.history.pushState({}, '', url);
  }
  
  loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    // Clear form first
    this.searchForm.reset();
    
    // Set keyword
    const keyword = params.get('q');
    if (keyword) {
      const keywordInput = document.getElementById('partner-keyword');
      if (keywordInput) keywordInput.value = keyword;
    }
    
    // Set location
    const location = params.get('location');
    if (location) {
      const locationInput = document.getElementById('partner-location');
      if (locationInput) locationInput.value = location;
    }
    
    // Set radius
    const radius = params.get('radius');
    if (radius) {
      const radiusSelect = document.getElementById('partner-radius');
      if (radiusSelect) radiusSelect.value = radius;
    }
    
    // Set services
    const services = params.get('services');
    if (services) {
      services.split(',').forEach(service => {
        this.checkFilter('services[]', service);
      });
    }
    
    // Set industries
    const industries = params.get('industries');
    if (industries) {
      industries.split(',').forEach(industry => {
        this.checkFilter('industries[]', industry);
      });
    }
    
    // Set company size
    const sizes = params.get('size');
    if (sizes) {
      sizes.split(',').forEach(size => {
        this.checkFilter('company_size[]', size);
      });
    }
    
    // Set certifications
    const certs = params.get('certs');
    if (certs) {
      certs.split(',').forEach(cert => {
        this.checkFilter('certifications[]', cert);
      });
    }
    
    // Set sort
    const sort = params.get('sort');
    if (sort && this.sortSelect) {
      this.sortSelect.value = sort;
    }
    
    // Update internal state
    this.updateFilters();
  }
  
  checkFilter(name, value) {
    const checkbox = this.searchForm.querySelector(`input[name="${name}"][value="${value}"]`);
    if (checkbox) {
      checkbox.checked = true;
    }
  }
  
  // Mobile filter methods
  openMobileFilters() {
    // Clone current filters to mobile drawer
    const mobileBody = this.mobileFilterDrawer.querySelector('.od-mobile-filter-drawer__body');
    const advancedFilters = document.getElementById('advanced-filters');
    
    if (advancedFilters) {
      mobileBody.innerHTML = advancedFilters.innerHTML;
      
      // Re-bind checkboxes to match current state
      this.syncMobileFilters();
    }
    
    // Show drawer
    this.mobileFilterDrawer.classList.add('od-mobile-filter-drawer--open');
    document.body.style.overflow = 'hidden';
  }
  
  closeMobileFilters() {
    this.mobileFilterDrawer.classList.remove('od-mobile-filter-drawer--open');
    document.body.style.overflow = '';
  }
  
  syncMobileFilters() {
    // Sync checkbox states from main form to mobile
    const mainCheckboxes = this.searchForm.querySelectorAll('input[type="checkbox"]');
    
    mainCheckboxes.forEach(checkbox => {
      const mobileCheckbox = this.mobileFilterDrawer.querySelector(
        `input[name="${checkbox.name}"][value="${checkbox.value}"]`
      );
      
      if (mobileCheckbox) {
        mobileCheckbox.checked = checkbox.checked;
      }
    });
  }
  
  applyMobileFilters() {
    // Sync mobile filters back to main form
    const mobileCheckboxes = this.mobileFilterDrawer.querySelectorAll('input[type="checkbox"]');
    
    mobileCheckboxes.forEach(checkbox => {
      const mainCheckbox = this.searchForm.querySelector(
        `input[name="${checkbox.name}"][value="${checkbox.value}"]`
      );
      
      if (mainCheckbox) {
        mainCheckbox.checked = checkbox.checked;
      }
    });
    
    // Update filters and close
    this.updateFilters();
    this.closeMobileFilters();
  }
  
  updateMobileFilterCount() {
    const count = this.getActiveFilters().length;
    const countElement = document.querySelector('[data-mobile-filter-count]');
    
    if (countElement) {
      countElement.textContent = count;
      countElement.hidden = count === 0;
    }
  }
  
  // Label helper methods
  getServiceLabel(service) {
    const labels = {
      'erp-implementation': 'ERP Implementierung',
      'odoo-hosting': 'Odoo Hosting',
      'dsgvo-compliance': 'DSGVO Compliance',
      'support-maintenance': 'Support & Wartung',
      'custom-development': 'Individuelle Entwicklung',
      'training': 'Schulungen'
    };
    return labels[service] || service;
  }
  
  getIndustryLabel(industry) {
    const labels = {
      'manufacturing': 'Produktion',
      'retail': 'Handel',
      'services': 'Dienstleistung',
      'logistics': 'Logistik',
      'healthcare': 'Gesundheitswesen',
      'construction': 'Baugewerbe'
    };
    return labels[industry] || industry;
  }
  
  getCompanySizeLabel(size) {
    const labels = {
      'startup': 'Startups (1-10)',
      'small': 'Klein (11-50)',
      'medium': 'Mittel (51-250)',
      'large': 'Groß (250+)'
    };
    return labels[size] || size;
  }
  
  getCertificationLabel(cert) {
    const labels = {
      'odoo-partner': 'Odoo Partner',
      'tuv': 'TÜV geprüft',
      'iso-27001': 'ISO 27001',
      'dsgvo-expert': 'DSGVO Experte'
    };
    return labels[cert] || cert;
  }
  
  // Public methods
  onFilterChange(callback) {
    this.filterChangeCallbacks.push(callback);
  }
  
  notifyFilterChange() {
    this.filterChangeCallbacks.forEach(callback => {
      callback(this.filters);
    });
  }
  
  getFilters() {
    return { ...this.filters };
  }
  
  getSort() {
    return this.sortSelect?.value || 'relevance';
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.filterManager = new FilterManager();
  });
} else {
  window.filterManager = new FilterManager();
}

// Add mobile filter styles
const style = document.createElement('style');
style.textContent = `
  .od-mobile-filter-toggle {
    display: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--od-primary);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 50;
    gap: 8px;
    align-items: center;
  }
  
  @media (max-width: 768px) {
    .od-mobile-filter-toggle {
      display: flex;
    }
    
    .od-search-form__advanced {
      display: none !important;
    }
  }
  
  .od-mobile-filter-toggle__count {
    background: white;
    color: var(--od-primary);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .od-mobile-filter-drawer {
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: none;
  }
  
  .od-mobile-filter-drawer__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .od-mobile-filter-drawer__content {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    max-width: 400px;
    background: white;
    transform: translateX(100%);
    transition: transform 0.3s;
    display: flex;
    flex-direction: column;
  }
  
  .od-mobile-filter-drawer--open {
    pointer-events: auto;
  }
  
  .od-mobile-filter-drawer--open .od-mobile-filter-drawer__backdrop {
    opacity: 1;
  }
  
  .od-mobile-filter-drawer--open .od-mobile-filter-drawer__content {
    transform: translateX(0);
  }
  
  .od-mobile-filter-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--od-gray-200);
  }
  
  .od-mobile-filter-drawer__title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
  
  .od-mobile-filter-drawer__close {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--od-gray-600);
  }
  
  .od-mobile-filter-drawer__body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  
  .od-mobile-filter-drawer__footer {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid var(--od-gray-200);
  }
  
  .od-mobile-filter-drawer__footer .od-btn {
    flex: 1;
  }
  
  @media (max-width: 480px) {
    .od-mobile-filter-drawer__content {
      max-width: 100%;
    }
  }
`;
document.head.appendChild(style);

export default FilterManager;