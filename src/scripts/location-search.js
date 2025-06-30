/**
 * Location Search Module
 * City autocomplete, distance-based search, and location detection
 */

import { 
  majorCities, 
  germanStates, 
  searchCities, 
  getCitiesWithinRadius,
  getCityByZipCode,
  normalizeGermanText 
} from '../data/german-locations.js';

class LocationSearch {
  constructor() {
    this.locationInput = null;
    this.radiusSelect = null;
    this.suggestionsContainer = null;
    this.currentLocation = null;
    this.mapContainer = null;
    
    this.init();
  }
  
  init() {
    // Find location-related elements
    this.locationInput = document.getElementById('partner-location');
    this.radiusSelect = document.getElementById('partner-radius');
    
    if (!this.locationInput) return;
    
    // Create custom suggestions dropdown
    this.createSuggestionsDropdown();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Try to detect user location (if permitted)
    this.detectUserLocation();
  }
  
  createSuggestionsDropdown() {
    // Create container for suggestions
    this.suggestionsContainer = document.createElement('div');
    this.suggestionsContainer.className = 'od-location-suggestions';
    this.suggestionsContainer.setAttribute('role', 'listbox');
    this.suggestionsContainer.hidden = true;
    
    // Position it relative to the input
    this.locationInput.parentElement.style.position = 'relative';
    this.locationInput.parentElement.appendChild(this.suggestionsContainer);
  }
  
  setupEventListeners() {
    // Input events
    this.locationInput.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });
    
    // Focus/blur events
    this.locationInput.addEventListener('focus', () => {
      if (this.locationInput.value.length >= 2) {
        this.handleInput(this.locationInput.value);
      }
    });
    
    this.locationInput.addEventListener('blur', (e) => {
      // Delay hiding to allow click on suggestions
      setTimeout(() => {
        if (!this.suggestionsContainer.contains(e.relatedTarget)) {
          this.hideSuggestions();
        }
      }, 200);
    });
    
    // Keyboard navigation
    this.locationInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
    
    // Handle radius change
    if (this.radiusSelect) {
      this.radiusSelect.addEventListener('change', () => {
        this.updateLocationBasedSearch();
      });
    }
  }
  
  handleInput(value) {
    if (value.length < 2) {
      this.hideSuggestions();
      return;
    }
    
    // Check if it's a ZIP code
    if (/^\d{5}$/.test(value)) {
      const city = getCityByZipCode(value);
      if (city) {
        this.showSuggestions([{ 
          type: 'zip', 
          name: city, 
          label: `${value} - ${city}`,
          value: city 
        }]);
        return;
      }
    }
    
    // Search for cities
    const cityMatches = searchCities(value, 5);
    
    // Search for states
    const normalizedValue = normalizeGermanText(value);
    const stateMatches = Object.entries(germanStates)
      .filter(([key, state]) => 
        normalizeGermanText(state.name).includes(normalizedValue) ||
        normalizeGermanText(state.shortCode).includes(normalizedValue)
      )
      .map(([key, state]) => ({
        type: 'state',
        name: state.name,
        label: `${state.name} (Bundesland)`,
        value: state.name,
        key: key
      }))
      .slice(0, 3);
    
    // Combine results
    const suggestions = [
      ...cityMatches.map(city => ({
        type: 'city',
        name: city.name,
        label: `${city.name}, ${city.state}`,
        value: city.name,
        data: city
      })),
      ...stateMatches
    ];
    
    // Add current location option if available
    if (this.currentLocation && suggestions.length > 0) {
      suggestions.unshift({
        type: 'current',
        name: 'Aktueller Standort',
        label: 'Aktueller Standort verwenden',
        value: this.currentLocation.city,
        data: this.currentLocation
      });
    }
    
    this.showSuggestions(suggestions);
  }
  
  showSuggestions(suggestions) {
    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }
    
    // Clear existing suggestions
    this.suggestionsContainer.innerHTML = '';
    
    // Add suggestions
    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'od-location-suggestions__item';
      item.setAttribute('role', 'option');
      item.setAttribute('data-index', index);
      
      // Add icon based on type
      const icon = this.getIconForType(suggestion.type);
      
      item.innerHTML = `
        ${icon}
        <span class="od-location-suggestions__text">${suggestion.label}</span>
      `;
      
      // Click handler
      item.addEventListener('click', () => {
        this.selectSuggestion(suggestion);
      });
      
      // Hover handler
      item.addEventListener('mouseenter', () => {
        this.highlightSuggestion(index);
      });
      
      this.suggestionsContainer.appendChild(item);
    });
    
    // Show container
    this.suggestionsContainer.hidden = false;
    
    // Highlight first item
    this.highlightSuggestion(0);
  }
  
  hideSuggestions() {
    this.suggestionsContainer.hidden = true;
    this.suggestionsContainer.innerHTML = '';
  }
  
  selectSuggestion(suggestion) {
    this.locationInput.value = suggestion.value;
    this.hideSuggestions();
    
    // Store selected location data
    if (suggestion.data) {
      this.selectedLocation = suggestion.data;
    }
    
    // Trigger search
    const event = new Event('input', { bubbles: true });
    this.locationInput.dispatchEvent(event);
    
    // If state selected, clear radius to search entire state
    if (suggestion.type === 'state') {
      this.radiusSelect.value = '';
    }
    
    // Update map if available
    this.updateMapView(suggestion);
  }
  
  highlightSuggestion(index) {
    // Remove existing highlights
    const items = this.suggestionsContainer.querySelectorAll('.od-location-suggestions__item');
    items.forEach(item => item.classList.remove('od-location-suggestions__item--active'));
    
    // Add highlight to current item
    if (items[index]) {
      items[index].classList.add('od-location-suggestions__item--active');
    }
  }
  
  handleKeyboardNavigation(e) {
    if (this.suggestionsContainer.hidden) return;
    
    const items = this.suggestionsContainer.querySelectorAll('.od-location-suggestions__item');
    const activeItem = this.suggestionsContainer.querySelector('.od-location-suggestions__item--active');
    let currentIndex = activeItem ? parseInt(activeItem.getAttribute('data-index')) : -1;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        this.highlightSuggestion(currentIndex);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        this.highlightSuggestion(currentIndex);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (activeItem) {
          activeItem.click();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        this.hideSuggestions();
        break;
    }
  }
  
  getIconForType(type) {
    const icons = {
      city: '<svg class="od-icon od-icon--sm" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C4.7 0 2 2.7 2 6c0 4.4 6 10 6 10s6-5.6 6-10c0-3.3-2.7-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
      state: '<svg class="od-icon od-icon--sm" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M14 6h-4V2c0-.6-.4-1-1-1H7c-.6 0-1 .4-1 1v4H2c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h4v4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4h4c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1z"/></svg>',
      zip: '<svg class="od-icon od-icon--sm" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M13 1H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM5 11H3V9h2v2zm0-4H3V5h2v2zm4 4H7V9h2v2zm0-4H7V5h2v2zm4 4h-2V9h2v2zm0-4h-2V5h2v2z"/></svg>',
      current: '<svg class="od-icon od-icon--sm" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-9C6.3 5 5 6.3 5 8s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/></svg>'
    };
    
    return icons[type] || icons.city;
  }
  
  async detectUserLocation() {
    // Check if geolocation is available
    if (!navigator.geolocation) return;
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Find nearest city
      const nearestCity = this.findNearestCity(latitude, longitude);
      
      if (nearestCity) {
        this.currentLocation = {
          lat: latitude,
          lng: longitude,
          city: nearestCity.name,
          state: nearestCity.state
        };
        
        // Add location button next to input
        this.addLocationButton();
      }
    } catch (error) {
      // Silently fail - geolocation not available or denied
      console.log('Location detection not available');
    }
  }
  
  findNearestCity(lat, lng) {
    let nearestCity = null;
    let minDistance = Infinity;
    
    majorCities.forEach(city => {
      const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    });
    
    // Only return if within reasonable distance (100km)
    return minDistance <= 100 ? nearestCity : null;
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
  
  addLocationButton() {
    // Check if button already exists
    if (document.querySelector('.od-location-detect')) return;
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'od-location-detect';
    button.title = 'Aktuellen Standort verwenden';
    button.innerHTML = `
      <svg class="od-icon" width="20" height="20" viewBox="0 0 20 20">
        <path fill="currentColor" d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm0-12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/>
      </svg>
    `;
    
    button.addEventListener('click', () => {
      if (this.currentLocation) {
        this.selectSuggestion({
          type: 'current',
          name: this.currentLocation.city,
          value: this.currentLocation.city,
          data: this.currentLocation
        });
      }
    });
    
    // Insert after input
    this.locationInput.parentElement.appendChild(button);
  }
  
  updateLocationBasedSearch() {
    // This method can be called when radius changes
    // It will trigger a new search with the updated radius
    const event = new Event('change', { bubbles: true });
    this.radiusSelect.dispatchEvent(event);
  }
  
  updateMapView(suggestion) {
    // Placeholder for map integration
    // This would update a map view to show the selected location
    if (!this.mapContainer) return;
    
    let center, zoom;
    
    switch (suggestion.type) {
      case 'city':
        center = { lat: suggestion.data.lat, lng: suggestion.data.lng };
        zoom = 12;
        break;
        
      case 'state':
        const state = germanStates[suggestion.key];
        if (state) {
          center = {
            lat: (state.bounds.north + state.bounds.south) / 2,
            lng: (state.bounds.east + state.bounds.west) / 2
          };
          zoom = 8;
        }
        break;
        
      case 'current':
        center = { lat: suggestion.data.lat, lng: suggestion.data.lng };
        zoom = 11;
        break;
    }
    
    // Dispatch custom event for map update
    if (center) {
      const event = new CustomEvent('locationSelected', {
        detail: { center, zoom, suggestion }
      });
      window.dispatchEvent(event);
    }
  }
  
  // Public method to get cities within radius of selected location
  getCitiesInRadius(radiusKm) {
    if (!this.selectedLocation) return [];
    
    return getCitiesWithinRadius(
      this.selectedLocation.lat,
      this.selectedLocation.lng,
      radiusKm
    );
  }
  
  // Public method to calculate distance from selected location
  getDistanceFromSelected(lat, lng) {
    if (!this.selectedLocation) return null;
    
    return this.calculateDistance(
      this.selectedLocation.lat,
      this.selectedLocation.lng,
      lat,
      lng
    );
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LocationSearch();
  });
} else {
  new LocationSearch();
}

// Export for use in other modules
export default LocationSearch;

// Add styles for suggestions dropdown
const style = document.createElement('style');
style.textContent = `
  .od-location-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid var(--od-gray-300);
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-height: 280px;
    overflow-y: auto;
    z-index: 100;
  }
  
  .od-location-suggestions__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.15s;
  }
  
  .od-location-suggestions__item:hover,
  .od-location-suggestions__item--active {
    background-color: var(--od-gray-50);
  }
  
  .od-location-suggestions__item .od-icon {
    color: var(--od-gray-600);
    flex-shrink: 0;
  }
  
  .od-location-suggestions__text {
    flex: 1;
    font-size: 14px;
    color: var(--od-gray-900);
  }
  
  .od-location-detect {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--od-primary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.15s;
  }
  
  .od-location-detect:hover {
    background-color: var(--od-gray-100);
  }
  
  .od-location-detect .od-icon {
    display: block;
  }
`;
document.head.appendChild(style);