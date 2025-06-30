/**
 * Search Analytics Module
 * Track search behavior, popular queries, and performance metrics
 */

class SearchAnalytics {
  constructor() {
    this.analyticsEndpoint = '/api/analytics'; // Future endpoint
    this.sessionId = this.generateSessionId();
    this.searchHistory = [];
    this.performanceMetrics = [];
    
    // Storage keys
    this.STORAGE_KEYS = {
      POPULAR_SEARCHES: 'od_popular_searches',
      RECENT_SEARCHES: 'od_recent_searches',
      SEARCH_PREFERENCES: 'od_search_preferences'
    };
    
    // Performance tracking
    this.searchStartTime = null;
    this.lastSearchCriteria = null;
    
    this.init();
  }
  
  init() {
    // Load stored data
    this.loadStoredData();
    
    // Set up event tracking
    this.setupTracking();
    
    // Initialize performance monitoring
    this.initPerformanceMonitoring();
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  loadStoredData() {
    // Load popular searches
    const popularSearches = localStorage.getItem(this.STORAGE_KEYS.POPULAR_SEARCHES);
    if (popularSearches) {
      this.popularSearches = JSON.parse(popularSearches);
    } else {
      this.popularSearches = {};
    }
    
    // Load recent searches
    const recentSearches = localStorage.getItem(this.STORAGE_KEYS.RECENT_SEARCHES);
    if (recentSearches) {
      this.recentSearches = JSON.parse(recentSearches);
    } else {
      this.recentSearches = [];
    }
  }
  
  setupTracking() {
    // Track search form submissions
    const searchForm = document.querySelector('[data-partner-search]');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        this.trackSearch(e);
      });
    }
    
    // Track filter changes
    if (window.filterManager) {
      window.filterManager.onFilterChange((filters) => {
        this.trackFilterChange(filters);
      });
    }
    
    // Track partner card clicks
    document.addEventListener('click', (e) => {
      const partnerCard = e.target.closest('.od-partner-card__link');
      if (partnerCard) {
        this.trackPartnerClick(partnerCard);
      }
    });
    
    // Track load more button
    const loadMoreBtn = document.querySelector('[data-load-more-btn]');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.trackLoadMore();
      });
    }
    
    // Track view changes
    document.querySelectorAll('[data-view]').forEach(button => {
      button.addEventListener('click', () => {
        this.trackViewChange(button.dataset.view);
      });
    });
  }
  
  initPerformanceMonitoring() {
    // Use Performance Observer if available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('search')) {
            this.recordPerformanceMetric(entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
    }
  }
  
  trackSearch(event) {
    this.searchStartTime = performance.now();
    
    const formData = new FormData(event.target);
    const searchCriteria = {
      keyword: formData.get('keyword') || '',
      location: formData.get('location') || '',
      radius: formData.get('radius') || '',
      services: formData.getAll('services[]'),
      industries: formData.getAll('industries[]'),
      certifications: formData.getAll('certifications[]'),
      timestamp: new Date().toISOString()
    };
    
    this.lastSearchCriteria = searchCriteria;
    
    // Update search history
    this.addToSearchHistory(searchCriteria);
    
    // Update popular searches
    this.updatePopularSearches(searchCriteria);
    
    // Track event
    this.trackEvent('search_performed', {
      criteria: searchCriteria,
      sessionId: this.sessionId
    });
  }
  
  trackSearchComplete(resultCount) {
    if (!this.searchStartTime) return;
    
    const searchDuration = performance.now() - this.searchStartTime;
    
    // Record performance metric
    this.performanceMetrics.push({
      duration: searchDuration,
      resultCount: resultCount,
      timestamp: new Date().toISOString(),
      criteria: this.lastSearchCriteria
    });
    
    // Track event
    this.trackEvent('search_completed', {
      duration: searchDuration,
      resultCount: resultCount,
      sessionId: this.sessionId
    });
    
    // Create performance mark
    if ('performance' in window && 'measure' in performance) {
      performance.measure('search_duration', {
        start: this.searchStartTime,
        duration: searchDuration
      });
    }
    
    this.searchStartTime = null;
  }
  
  trackFilterChange(filters) {
    // Count active filters
    const activeFilterCount = Object.values(filters)
      .filter(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== '';
      }).length;
    
    this.trackEvent('filter_changed', {
      filters: filters,
      activeFilterCount: activeFilterCount,
      sessionId: this.sessionId
    });
  }
  
  trackPartnerClick(partnerLink) {
    const partnerId = partnerLink.href.split('/').pop();
    const partnerName = partnerLink.textContent;
    
    this.trackEvent('partner_clicked', {
      partnerId: partnerId,
      partnerName: partnerName,
      searchCriteria: this.lastSearchCriteria,
      sessionId: this.sessionId
    });
  }
  
  trackLoadMore() {
    this.trackEvent('load_more_clicked', {
      currentResults: document.querySelectorAll('.od-partner-card').length,
      sessionId: this.sessionId
    });
  }
  
  trackViewChange(view) {
    this.trackEvent('view_changed', {
      view: view,
      sessionId: this.sessionId
    });
  }
  
  addToSearchHistory(criteria) {
    // Add to recent searches
    this.recentSearches.unshift({
      ...criteria,
      id: Date.now()
    });
    
    // Keep only last 10 searches
    this.recentSearches = this.recentSearches.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem(
      this.STORAGE_KEYS.RECENT_SEARCHES,
      JSON.stringify(this.recentSearches)
    );
  }
  
  updatePopularSearches(criteria) {
    // Update keyword popularity
    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      this.popularSearches[keyword] = (this.popularSearches[keyword] || 0) + 1;
    }
    
    // Update location popularity
    if (criteria.location) {
      const location = 'location:' + criteria.location.toLowerCase();
      this.popularSearches[location] = (this.popularSearches[location] || 0) + 1;
    }
    
    // Update service popularity
    criteria.services.forEach(service => {
      const key = 'service:' + service;
      this.popularSearches[key] = (this.popularSearches[key] || 0) + 1;
    });
    
    // Save to localStorage
    localStorage.setItem(
      this.STORAGE_KEYS.POPULAR_SEARCHES,
      JSON.stringify(this.popularSearches)
    );
  }
  
  trackEvent(eventName, eventData) {
    const event = {
      name: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Log to console in development
    if (window.location.hostname === 'localhost') {
      console.log('Analytics Event:', event);
    }
    
    // Store event locally
    this.storeEvent(event);
    
    // Send to analytics endpoint (when available)
    this.sendToAnalytics(event);
  }
  
  storeEvent(event) {
    // Store events in sessionStorage for current session
    const events = JSON.parse(sessionStorage.getItem('od_analytics_events') || '[]');
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.shift();
    }
    
    sessionStorage.setItem('od_analytics_events', JSON.stringify(events));
  }
  
  async sendToAnalytics(event) {
    // Only send in production
    if (window.location.hostname === 'localhost') return;
    
    try {
      // Future implementation: Send to analytics endpoint
      // await fetch(this.analyticsEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
  
  recordPerformanceMetric(entry) {
    this.performanceMetrics.push({
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: new Date().toISOString()
    });
  }
  
  // Public API methods
  getPopularSearches(limit = 10) {
    return Object.entries(this.popularSearches)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([term, count]) => ({ term, count }));
  }
  
  getPopularKeywords(limit = 5) {
    return this.getPopularSearches()
      .filter(item => !item.term.includes(':'))
      .slice(0, limit);
  }
  
  getPopularLocations(limit = 5) {
    return this.getPopularSearches()
      .filter(item => item.term.startsWith('location:'))
      .map(item => ({
        ...item,
        term: item.term.replace('location:', '')
      }))
      .slice(0, limit);
  }
  
  getPopularServices(limit = 5) {
    return this.getPopularSearches()
      .filter(item => item.term.startsWith('service:'))
      .map(item => ({
        ...item,
        term: item.term.replace('service:', '')
      }))
      .slice(0, limit);
  }
  
  getRecentSearches(limit = 5) {
    return this.recentSearches.slice(0, limit);
  }
  
  getAverageSearchDuration() {
    if (this.performanceMetrics.length === 0) return 0;
    
    const searchMetrics = this.performanceMetrics.filter(m => m.duration);
    if (searchMetrics.length === 0) return 0;
    
    const totalDuration = searchMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / searchMetrics.length;
  }
  
  getSearchMetrics() {
    const events = JSON.parse(sessionStorage.getItem('od_analytics_events') || '[]');
    const searches = events.filter(e => e.name === 'search_performed');
    const clicks = events.filter(e => e.name === 'partner_clicked');
    
    return {
      totalSearches: searches.length,
      totalClicks: clicks.length,
      clickThroughRate: searches.length > 0 ? (clicks.length / searches.length) * 100 : 0,
      averageDuration: this.getAverageSearchDuration(),
      popularKeywords: this.getPopularKeywords(),
      popularLocations: this.getPopularLocations(),
      popularServices: this.getPopularServices()
    };
  }
  
  // Suggestion provider for search autocomplete
  getSuggestions(query, type = 'all') {
    const suggestions = [];
    const normalizedQuery = query.toLowerCase();
    
    if (type === 'all' || type === 'recent') {
      // Add recent searches
      this.recentSearches
        .filter(search => search.keyword?.toLowerCase().includes(normalizedQuery))
        .slice(0, 3)
        .forEach(search => {
          suggestions.push({
            type: 'recent',
            value: search.keyword,
            label: search.keyword,
            meta: 'Zuletzt gesucht'
          });
        });
    }
    
    if (type === 'all' || type === 'popular') {
      // Add popular searches
      this.getPopularKeywords(5)
        .filter(item => item.term.includes(normalizedQuery))
        .forEach(item => {
          suggestions.push({
            type: 'popular',
            value: item.term,
            label: item.term,
            meta: `${item.count}x gesucht`
          });
        });
    }
    
    return suggestions;
  }
  
  // Clear user data
  clearAnalyticsData() {
    localStorage.removeItem(this.STORAGE_KEYS.POPULAR_SEARCHES);
    localStorage.removeItem(this.STORAGE_KEYS.RECENT_SEARCHES);
    sessionStorage.removeItem('od_analytics_events');
    
    this.popularSearches = {};
    this.recentSearches = [];
    this.performanceMetrics = [];
  }
}

// Initialize analytics
const searchAnalytics = new SearchAnalytics();

// Export for use in other modules
window.searchAnalytics = searchAnalytics;

// Provide global access to track search completion
window.trackSearchComplete = (resultCount) => {
  searchAnalytics.trackSearchComplete(resultCount);
};

export default searchAnalytics;