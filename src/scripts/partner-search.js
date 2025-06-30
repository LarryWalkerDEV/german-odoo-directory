/**
 * Partner Search Module
 * Real-time search with debouncing and German language support
 */

import { normalizeGermanText, searchCities } from '../data/german-locations.js';

class PartnerSearch {
  constructor() {
    this.searchForm = document.querySelector('[data-partner-search]');
    this.keywordInput = document.getElementById('partner-keyword');
    this.locationInput = document.getElementById('partner-location');
    this.radiusSelect = document.getElementById('partner-radius');
    this.advancedToggle = document.querySelector('.od-search-form__toggle');
    this.advancedFilters = document.getElementById('advanced-filters');
    this.submitButton = document.querySelector('.od-search-form__submit');
    
    this.resultsContainer = document.querySelector('[data-partners-container]');
    this.loadingIndicator = document.querySelector('[data-loading]');
    this.noResultsMessage = document.querySelector('[data-no-results]');
    this.resultsCount = document.querySelector('[data-results-count]');
    this.resultsDescription = document.querySelector('[data-results-description]');
    
    this.partners = [];
    this.filteredPartners = [];
    this.searchDebounceTimer = null;
    this.searchDelay = 300; // ms
    
    this.init();
  }
  
  init() {
    // Load partner data
    this.loadPartnerData();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize search from URL params
    this.initializeFromURL();
  }
  
  async loadPartnerData() {
    try {
      // In production, this would load from generated JSON files
      // For now, we'll use mock data
      this.partners = this.generateMockPartners();
      this.performSearch();
    } catch (error) {
      console.error('Error loading partner data:', error);
    }
  }
  
  setupEventListeners() {
    // Real-time search on keyword input
    this.keywordInput.addEventListener('input', () => {
      this.debounceSearch();
    });
    
    // Location autocomplete
    this.locationInput.addEventListener('input', (e) => {
      this.handleLocationInput(e.target.value);
      this.debounceSearch();
    });
    
    // Radius change
    this.radiusSelect.addEventListener('change', () => {
      this.performSearch();
    });
    
    // Advanced filters toggle
    this.advancedToggle.addEventListener('click', () => {
      this.toggleAdvancedFilters();
    });
    
    // Form submission
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.performSearch();
    });
    
    // Advanced filter checkboxes
    const checkboxes = this.searchForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.performSearch();
      });
    });
    
    // Clear all filters
    const clearButton = document.querySelector('[data-clear-all]');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
    
    // Reset search button
    const resetButton = document.querySelector('[data-reset-search]');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
  }
  
  debounceSearch() {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.performSearch();
    }, this.searchDelay);
  }
  
  performSearch() {
    // Show loading state
    this.showLoading();
    
    // Get search criteria
    const criteria = this.getSearchCriteria();
    
    // Filter partners
    this.filteredPartners = this.filterPartners(criteria);
    
    // Sort results
    this.sortResults(criteria.sort);
    
    // Update URL
    this.updateURL(criteria);
    
    // Display results
    this.displayResults();
    
    // Update active filters display
    this.updateActiveFilters(criteria);
  }
  
  getSearchCriteria() {
    const formData = new FormData(this.searchForm);
    
    return {
      keyword: formData.get('keyword') || '',
      location: formData.get('location') || '',
      radius: formData.get('radius') || '',
      services: formData.getAll('services[]'),
      industries: formData.getAll('industries[]'),
      companySize: formData.getAll('company_size[]'),
      certifications: formData.getAll('certifications[]'),
      sort: document.querySelector('[data-sort]')?.value || 'relevance'
    };
  }
  
  filterPartners(criteria) {
    let filtered = [...this.partners];
    
    // Keyword search
    if (criteria.keyword) {
      const normalizedKeyword = normalizeGermanText(criteria.keyword);
      filtered = filtered.filter(partner => 
        this.matchesKeyword(partner, normalizedKeyword)
      );
    }
    
    // Location filter
    if (criteria.location) {
      filtered = this.filterByLocation(filtered, criteria.location, criteria.radius);
    }
    
    // Service filters
    if (criteria.services.length > 0) {
      filtered = filtered.filter(partner =>
        criteria.services.some(service => partner.services.includes(service))
      );
    }
    
    // Industry filters
    if (criteria.industries.length > 0) {
      filtered = filtered.filter(partner =>
        criteria.industries.some(industry => partner.industries?.includes(industry))
      );
    }
    
    // Company size filters
    if (criteria.companySize.length > 0) {
      filtered = filtered.filter(partner =>
        criteria.companySize.includes(partner.targetCompanySize)
      );
    }
    
    // Certification filters
    if (criteria.certifications.length > 0) {
      filtered = filtered.filter(partner =>
        criteria.certifications.some(cert => 
          partner.certifications.some(pCert => 
            normalizeGermanText(pCert) === normalizeGermanText(cert)
          )
        )
      );
    }
    
    return filtered;
  }
  
  matchesKeyword(partner, normalizedKeyword) {
    // Search in multiple fields
    const searchableText = [
      partner.name,
      partner.description,
      ...partner.services,
      ...partner.certifications,
      partner.location.city,
      partner.location.state
    ].join(' ');
    
    const normalizedText = normalizeGermanText(searchableText);
    return normalizedText.includes(normalizedKeyword);
  }
  
  filterByLocation(partners, location, radius) {
    // First, try to find the city in our data
    const cities = searchCities(location, 1);
    if (cities.length === 0) {
      // If no city found, try to match against partner locations directly
      const normalizedLocation = normalizeGermanText(location);
      return partners.filter(partner => {
        const partnerLocation = normalizeGermanText(partner.location.city);
        return partnerLocation.includes(normalizedLocation);
      });
    }
    
    const targetCity = cities[0];
    
    if (!radius || radius === '') {
      // No radius specified, filter by exact city match
      return partners.filter(partner => 
        normalizeGermanText(partner.location.city) === normalizeGermanText(targetCity.name)
      );
    }
    
    // Filter by distance
    const radiusKm = parseInt(radius);
    return partners.filter(partner => {
      if (!partner.location.coordinates) return false;
      
      const distance = this.calculateDistance(
        targetCity.lat,
        targetCity.lng,
        partner.location.coordinates.lat,
        partner.location.coordinates.lng
      );
      
      return distance <= radiusKm;
    });
  }
  
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  sortResults(sortBy) {
    switch (sortBy) {
      case 'rating':
        this.filteredPartners.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'experience':
        this.filteredPartners.sort((a, b) => (b.experience || 0) - (a.experience || 0));
        break;
      case 'projects':
        this.filteredPartners.sort((a, b) => (b.projectCount || 0) - (a.projectCount || 0));
        break;
      case 'distance':
        // Distance sorting is handled in location filtering
        break;
      case 'relevance':
      default:
        // Sort by subscription tier first, then by relevance score
        this.filteredPartners.sort((a, b) => {
          const tierOrder = { enterprise: 3, premium: 2, starter: 1 };
          const tierDiff = (tierOrder[b.subscription_tier] || 0) - (tierOrder[a.subscription_tier] || 0);
          if (tierDiff !== 0) return tierDiff;
          
          // Then by relevance score (if available)
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        });
    }
  }
  
  displayResults() {
    // Hide loading
    this.hideLoading();
    
    // Update result count
    const count = this.filteredPartners.length;
    this.resultsCount.textContent = count;
    
    // Update description
    this.updateResultsDescription();
    
    if (count === 0) {
      this.showNoResults();
      return;
    }
    
    // Hide no results message
    this.noResultsMessage.hidden = true;
    
    // Get the grid container
    const grid = this.resultsContainer.querySelector('[data-view-target="grid"]');
    if (!grid) return;
    
    // Clear existing results
    grid.innerHTML = '';
    
    // Display partners (limited for performance)
    const displayLimit = 20;
    const partnersToShow = this.filteredPartners.slice(0, displayLimit);
    
    partnersToShow.forEach(partner => {
      const card = this.createPartnerCard(partner);
      grid.appendChild(card);
    });
    
    // Update load more button
    this.updateLoadMoreButton(count, displayLimit);
  }
  
  createPartnerCard(partner) {
    const div = document.createElement('div');
    div.innerHTML = this.getPartnerCardHTML(partner);
    return div.firstElementChild;
  }
  
  getPartnerCardHTML(partner) {
    const certificationBadges = partner.certifications
      .map(cert => this.getCertificationBadge(cert))
      .join('');
    
    const servicesTags = partner.services
      .slice(0, 2)
      .map(service => `<span class="od-tag od-tag--primary">${this.getServiceName(service)}</span>`)
      .join('');
    
    const tierBadge = this.getTierBadge(partner.subscription_tier);
    
    return `
      <article class="od-partner-card" itemscope itemtype="https://schema.org/LocalBusiness">
        <div class="od-partner-card__inner">
          ${tierBadge}
          
          <div class="od-partner-card__header">
            <div class="od-partner-card__logo-wrapper">
              <img 
                src="${partner.logoUrl || '/assets/images/partner-placeholder.svg'}" 
                alt="${partner.name} Logo" 
                class="od-partner-card__logo"
                width="80"
                height="80"
                loading="lazy"
                itemprop="logo"
              >
            </div>
            <div class="od-partner-card__info">
              <h3 class="od-partner-card__name" itemprop="name">
                <a href="/partners/${partner.id}" class="od-partner-card__link">
                  ${partner.name}
                </a>
              </h3>
              <div class="od-partner-card__location" itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
                <svg class="od-icon od-icon--sm" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
                  <path fill="currentColor" d="M7 0C3.1 0 0 3.1 0 7c0 5.3 7 7 7 7s7-1.7 7-7c0-3.9-3.1-7-7-7zm0 10c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
                </svg>
                <span itemprop="addressLocality">${partner.location.city}</span>,
                <span itemprop="addressRegion">${partner.location.state}</span>
              </div>
            </div>
          </div>
          
          <p class="od-partner-card__description" itemprop="description">
            ${this.truncateText(partner.description, 120)}
          </p>
          
          <div class="od-partner-card__specializations">
            ${servicesTags}
          </div>
          
          <div class="od-partner-card__trust">
            <div class="od-partner-card__trust-item">
              <svg class="od-icon od-icon--sm" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm3-6H8V5H6v5h5V8z"/>
              </svg>
              <span class="od-partner-card__trust-label">${partner.experience || 5}+ Jahre Erfahrung</span>
            </div>
            <div class="od-partner-card__trust-item">
              <svg class="od-icon od-icon--sm" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M8 0L6 3 2 3.5l3 3L4 10l4-2 4 2-1-3.5 3-3L10 3 8 0z"/>
              </svg>
              <span class="od-partner-card__trust-label">${partner.projectCount || 10}+ Projekte</span>
            </div>
            ${partner.certifications.length > 0 ? `
            <div class="od-partner-card__trust-item">
              <svg class="od-icon od-icon--sm" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-1 12l-3-3 1.4-1.4L7 9.2l3.6-3.6L12 7l-5 5z"/>
              </svg>
              <span class="od-partner-card__trust-label">Zertifiziert</span>
            </div>
            ` : ''}
          </div>
          
          ${certificationBadges ? `
          <div class="od-partner-card__certifications">
            ${certificationBadges}
          </div>
          ` : ''}
          
          <div class="od-partner-card__actions">
            <a href="/partners/${partner.id}" class="od-btn od-btn--secondary od-btn--sm od-btn--block">
              Mehr erfahren
              <svg class="od-icon od-icon--sm" aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
                <path fill="currentColor" d="M4 2l4 4-4 4"/>
              </svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }
  
  getTierBadge(tier) {
    const badges = {
      enterprise: '<div class="od-partner-badge od-partner-badge--enterprise">Top Partner</div>',
      premium: '<div class="od-partner-badge od-partner-badge--premium">Premium</div>',
      starter: ''
    };
    return badges[tier] || '';
  }
  
  getCertificationBadge(certification) {
    const badges = {
      'TÜV': {
        title: 'TÜV geprüft',
        icon: '<svg class="od-certification__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#0066CC" opacity="0.1"/><path fill="#0066CC" d="M10 15l-3-3 1.4-1.4L10 12.2l5.6-5.6L17 8l-7 7z"/></svg>'
      },
      'ISO 27001': {
        title: 'ISO 27001 zertifiziert',
        icon: '<svg class="od-certification__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#FF6B35" opacity="0.1"/><path fill="#FF6B35" d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z"/></svg>'
      },
      'DSGVO': {
        title: 'DSGVO konform',
        icon: '<svg class="od-certification__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00A36C" d="M12 2L4 7v5c0 5 3.4 9.8 8 11 4.6-1.2 8-6 8-11V7l-8-5z" opacity="0.1"/><path fill="#00A36C" d="M12 2L4 7v5c0 5 3.4 9.8 8 11 4.6-1.2 8-6 8-11V7l-8-5zm-2 13l-3-3 1.4-1.4L10 12.2l5.6-5.6L17 8l-7 7z"/></svg>'
      },
      'GoBD': {
        title: 'GoBD konform',
        icon: '<svg class="od-certification__icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" fill="#7B68EE" opacity="0.1"/><path fill="#7B68EE" d="M9 11h6v2H9zm0 4h6v2H9zm0-8h6v2H9z"/></svg>'
      }
    };
    
    const badge = badges[certification];
    if (!badge) return '';
    
    return `<div class="od-certification od-certification--${normalizeGermanText(certification)}" title="${badge.title}">${badge.icon}</div>`;
  }
  
  getServiceName(service) {
    const serviceNames = {
      'erp-implementation': 'ERP Implementierung',
      'odoo-hosting': 'Odoo Hosting',
      'dsgvo-compliance': 'DSGVO Compliance',
      'support-maintenance': 'Support & Wartung',
      'custom-development': 'Individuelle Entwicklung',
      'training': 'Schulungen'
    };
    return serviceNames[service] || service;
  }
  
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
  
  updateResultsDescription() {
    const criteria = this.getSearchCriteria();
    let description = '';
    
    if (criteria.location) {
      description = `in ${criteria.location}`;
      if (criteria.radius) {
        description += ` (${criteria.radius} km Umkreis)`;
      }
    }
    
    if (criteria.services.length > 0) {
      const serviceNames = criteria.services.map(s => this.getServiceName(s));
      description += description ? ' für ' : 'für ';
      description += serviceNames.join(', ');
    }
    
    this.resultsDescription.textContent = description;
  }
  
  updateLoadMoreButton(total, shown) {
    const loadMoreSection = document.querySelector('[data-load-more]');
    const showingSpan = document.querySelector('[data-showing]');
    const totalSpan = document.querySelector('[data-total]');
    
    if (loadMoreSection) {
      loadMoreSection.style.display = shown < total ? 'block' : 'none';
      
      if (showingSpan) showingSpan.textContent = shown;
      if (totalSpan) totalSpan.textContent = total;
    }
  }
  
  showLoading() {
    this.loadingIndicator.hidden = false;
    this.resultsContainer.querySelector('[data-view-target="grid"]').style.display = 'none';
  }
  
  hideLoading() {
    this.loadingIndicator.hidden = true;
    this.resultsContainer.querySelector('[data-view-target="grid"]').style.display = '';
  }
  
  showNoResults() {
    this.noResultsMessage.hidden = false;
    this.resultsContainer.querySelector('[data-view-target="grid"]').style.display = 'none';
  }
  
  toggleAdvancedFilters() {
    const isExpanded = this.advancedToggle.getAttribute('aria-expanded') === 'true';
    this.advancedToggle.setAttribute('aria-expanded', !isExpanded);
    this.advancedFilters.hidden = isExpanded;
  }
  
  handleLocationInput(value) {
    if (value.length < 2) return;
    
    // Search for matching cities
    const matches = searchCities(value, 8);
    
    // Update datalist
    const datalist = document.getElementById('location-suggestions');
    if (datalist) {
      datalist.innerHTML = matches
        .map(city => `<option value="${city.name}">`)
        .join('');
    }
  }
  
  updateActiveFilters(criteria) {
    const container = document.querySelector('[data-active-filters]');
    if (!container) return;
    
    const filterList = container.querySelector('.od-active-filters__list');
    if (!filterList) return;
    
    // Clear existing filters
    filterList.innerHTML = '';
    
    const activeFilters = [];
    
    // Add location filter
    if (criteria.location) {
      let label = criteria.location;
      if (criteria.radius) {
        label += ` (${criteria.radius} km)`;
      }
      activeFilters.push({ type: 'location', value: criteria.location, label });
    }
    
    // Add service filters
    criteria.services.forEach(service => {
      activeFilters.push({
        type: 'service',
        value: service,
        label: this.getServiceName(service)
      });
    });
    
    // Add certification filters
    criteria.certifications.forEach(cert => {
      activeFilters.push({
        type: 'certification',
        value: cert,
        label: cert
      });
    });
    
    // Show/hide container
    container.hidden = activeFilters.length === 0;
    
    // Create filter tags
    activeFilters.forEach(filter => {
      const tag = document.createElement('button');
      tag.className = 'od-active-filters__tag';
      tag.innerHTML = `
        ${filter.label}
        <svg class="od-icon od-icon--xs" width="12" height="12" viewBox="0 0 12 12">
          <path fill="currentColor" d="M7.4 6l2.3-2.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L6 4.6 3.7 2.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4L4.6 6 2.3 8.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3L6 7.4l2.3 2.3c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4L7.4 6z"/>
        </svg>
      `;
      
      tag.addEventListener('click', () => {
        this.removeFilter(filter.type, filter.value);
      });
      
      filterList.appendChild(tag);
    });
  }
  
  removeFilter(type, value) {
    switch (type) {
      case 'location':
        this.locationInput.value = '';
        this.radiusSelect.value = '';
        break;
      case 'service':
        const serviceCheckbox = this.searchForm.querySelector(`input[name="services[]"][value="${value}"]`);
        if (serviceCheckbox) serviceCheckbox.checked = false;
        break;
      case 'certification':
        const certCheckbox = this.searchForm.querySelector(`input[name="certifications[]"][value="${value}"]`);
        if (certCheckbox) certCheckbox.checked = false;
        break;
    }
    
    this.performSearch();
  }
  
  clearAllFilters() {
    // Clear form inputs
    this.searchForm.reset();
    
    // Perform search
    this.performSearch();
  }
  
  updateURL(criteria) {
    const params = new URLSearchParams();
    
    if (criteria.keyword) params.set('q', criteria.keyword);
    if (criteria.location) params.set('location', criteria.location);
    if (criteria.radius) params.set('radius', criteria.radius);
    if (criteria.services.length) params.set('services', criteria.services.join(','));
    if (criteria.certifications.length) params.set('certs', criteria.certifications.join(','));
    if (criteria.sort !== 'relevance') params.set('sort', criteria.sort);
    
    const url = new URL(window.location);
    url.search = params.toString();
    
    window.history.replaceState({}, '', url);
  }
  
  initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('q')) {
      this.keywordInput.value = params.get('q');
    }
    
    if (params.has('location')) {
      this.locationInput.value = params.get('location');
    }
    
    if (params.has('radius')) {
      this.radiusSelect.value = params.get('radius');
    }
    
    if (params.has('services')) {
      const services = params.get('services').split(',');
      services.forEach(service => {
        const checkbox = this.searchForm.querySelector(`input[name="services[]"][value="${service}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
    
    if (params.has('certs')) {
      const certs = params.get('certs').split(',');
      certs.forEach(cert => {
        const checkbox = this.searchForm.querySelector(`input[name="certifications[]"][value="${cert}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
    
    if (params.has('sort')) {
      const sortSelect = document.querySelector('[data-sort]');
      if (sortSelect) sortSelect.value = params.get('sort');
    }
  }
  
  // Generate mock partner data for testing
  generateMockPartners() {
    const cities = [
      { name: 'Berlin', state: 'Berlin', lat: 52.520008, lng: 13.404954 },
      { name: 'Hamburg', state: 'Hamburg', lat: 53.551086, lng: 9.993682 },
      { name: 'München', state: 'Bayern', lat: 48.135125, lng: 11.581981 },
      { name: 'Köln', state: 'Nordrhein-Westfalen', lat: 50.937531, lng: 6.960279 },
      { name: 'Frankfurt', state: 'Hessen', lat: 50.110924, lng: 8.682127 },
      { name: 'Stuttgart', state: 'Baden-Württemberg', lat: 48.775845, lng: 9.182932 },
      { name: 'Düsseldorf', state: 'Nordrhein-Westfalen', lat: 51.227741, lng: 6.773456 },
      { name: 'Leipzig', state: 'Sachsen', lat: 51.339695, lng: 12.373075 }
    ];
    
    const services = ['erp-implementation', 'odoo-hosting', 'dsgvo-compliance', 'support-maintenance', 'custom-development', 'training'];
    const certifications = ['TÜV', 'ISO 27001', 'DSGVO', 'GoBD'];
    const tiers = ['starter', 'premium', 'enterprise'];
    
    const partners = [];
    
    for (let i = 1; i <= 150; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      
      partners.push({
        id: `partner-${i}`,
        name: `Odoo Partner ${i} GmbH`,
        description: `Wir sind Ihr zuverlässiger Partner für Odoo-Implementierungen in ${city.name}. Mit über ${5 + Math.floor(Math.random() * 15)} Jahren Erfahrung unterstützen wir mittelständische Unternehmen bei der digitalen Transformation.`,
        location: {
          city: city.name,
          state: city.state,
          address: `Beispielstraße ${Math.floor(Math.random() * 100)}`,
          coordinates: { lat: city.lat, lng: city.lng }
        },
        services: services.filter(() => Math.random() > 0.5),
        certifications: certifications.filter(() => Math.random() > 0.6),
        subscription_tier: tier,
        experience: 5 + Math.floor(Math.random() * 15),
        projectCount: 10 + Math.floor(Math.random() * 190),
        rating: 4 + Math.random(),
        targetCompanySize: ['startup', 'small', 'medium', 'large'][Math.floor(Math.random() * 4)],
        industries: ['manufacturing', 'retail', 'services', 'logistics'].filter(() => Math.random() > 0.5)
      });
    }
    
    return partners;
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PartnerSearch();
  });
} else {
  new PartnerSearch();
}

export default PartnerSearch;