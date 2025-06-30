// Homepage Modern Interactive Elements

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all homepage components
    initQuickSearch();
    initCounterAnimations();
    initNewsletterForm();
    initSmoothScrolling();
    initLoadingStates();
});

// Quick Search with Autocomplete
function initQuickSearch() {
    const locationInput = document.querySelector('[data-autocomplete="location"]');
    const locationSuggestions = document.querySelector('[data-suggestions="location"]');
    
    if (!locationInput || !locationSuggestions) return;
    
    // German cities data
    const germanCities = [
        'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt am Main',
        'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig',
        'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg',
        'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',
        'Karlsruhe', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Mönchengladbach',
        'Gelsenkirchen', 'Aachen', 'Braunschweig', 'Kiel', 'Chemnitz',
        'Magdeburg', 'Freiburg im Breisgau', 'Krefeld', 'Mainz', 'Lübeck',
        'Erfurt', 'Oberhausen', 'Rostock', 'Kassel', 'Hagen',
        'Potsdam', 'Saarbrücken', 'Hamm', 'Ludwigshafen', 'Mülheim',
        'Oldenburg', 'Osnabrück', 'Leverkusen', 'Heidelberg', 'Solingen',
        'Darmstadt', 'Herne', 'Regensburg', 'Neuss', 'Paderborn',
        'Ingolstadt', 'Offenbach', 'Fürth', 'Würzburg', 'Ulm',
        'Heilbronn', 'Pforzheim', 'Wolfsburg', 'Göttingen', 'Bottrop',
        'Reutlingen', 'Koblenz', 'Bergisch Gladbach', 'Recklinghausen', 'Erlangen',
        'Bremerhaven', 'Remscheid', 'Trier', 'Jena', 'Moers',
        'Cottbus', 'Hildesheim', 'Siegen', 'Salzgitter', 'Gütersloh'
    ];
    
    let currentFocus = -1;
    
    locationInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        
        if (value.length < 2) {
            locationSuggestions.classList.remove('od-quick-search__suggestions--active');
            return;
        }
        
        const matches = germanCities.filter(city => 
            city.toLowerCase().includes(value)
        ).slice(0, 8);
        
        if (matches.length > 0) {
            locationSuggestions.innerHTML = matches.map((city, index) => `
                <div class="od-quick-search__suggestion" data-index="${index}" data-value="${city}">
                    <svg class="od-quick-search__suggestion-icon" width="16" height="16" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M8 1C4.1 1 1 4.1 1 8c0 5.3 7 7 7 7s7-1.7 7-7c0-3.9-3.1-7-7-7zm0 10c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
                    </svg>
                    <span>${highlightMatch(city, value)}</span>
                </div>
            `).join('');
            
            locationSuggestions.classList.add('od-quick-search__suggestions--active');
        } else {
            locationSuggestions.classList.remove('od-quick-search__suggestions--active');
        }
    });
    
    // Keyboard navigation
    locationInput.addEventListener('keydown', function(e) {
        const suggestions = locationSuggestions.querySelectorAll('.od-quick-search__suggestion');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            addActive(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            addActive(suggestions);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus > -1 && suggestions[currentFocus]) {
                suggestions[currentFocus].click();
            }
        } else if (e.key === 'Escape') {
            locationSuggestions.classList.remove('od-quick-search__suggestions--active');
        }
    });
    
    function addActive(suggestions) {
        if (!suggestions) return;
        removeActive(suggestions);
        
        if (currentFocus >= suggestions.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = suggestions.length - 1;
        
        if (suggestions[currentFocus]) {
            suggestions[currentFocus].classList.add('od-quick-search__suggestion--active');
        }
    }
    
    function removeActive(suggestions) {
        suggestions.forEach(s => s.classList.remove('od-quick-search__suggestion--active'));
    }
    
    // Click handler for suggestions
    locationSuggestions.addEventListener('click', function(e) {
        const suggestion = e.target.closest('.od-quick-search__suggestion');
        if (suggestion) {
            locationInput.value = suggestion.dataset.value;
            locationSuggestions.classList.remove('od-quick-search__suggestions--active');
        }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.od-quick-search__field--location')) {
            locationSuggestions.classList.remove('od-quick-search__suggestions--active');
        }
    });
}

// Helper function to highlight matching text
function highlightMatch(text, search) {
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

// Counter Animations
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');
    
    if (counters.length === 0) return;
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.dataset.counter);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString('de-DE') + '+';
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString('de-DE') + '+';
            }
        };
        
        updateCounter();
    };
    
    // Intersection Observer for triggering animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Newsletter Form
function initNewsletterForm() {
    const form = document.querySelector('[data-newsletter-form]');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = form.querySelector('input[type="email"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="od-loading"></span>';
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success state
        submitButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm-1 15l-4-4 1.4-1.4L9 12.2l5.6-5.6L16 8l-7 7z"/>
            </svg>
            Erfolgreich!
        `;
        submitButton.style.background = 'var(--od-accent)';
        
        // Reset form after delay
        setTimeout(() => {
            emailInput.value = '';
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.style.background = '';
        }, 3000);
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Loading States for Dynamic Content
function initLoadingStates() {
    // Simulate loading featured partners
    const partnersGrid = document.querySelector('.od-featured-partners__grid');
    
    if (partnersGrid && partnersGrid.children.length === 0) {
        // Show skeleton loaders
        partnersGrid.innerHTML = Array(3).fill('').map(() => `
            <div class="od-partner-card od-skeleton">
                <div class="od-skeleton" style="height: 200px; margin-bottom: 1rem;"></div>
                <div class="od-skeleton" style="height: 24px; width: 70%; margin-bottom: 0.5rem;"></div>
                <div class="od-skeleton" style="height: 16px; margin-bottom: 1rem;"></div>
                <div class="od-skeleton" style="height: 16px; width: 80%;"></div>
            </div>
        `).join('');
        
        // Simulate data loading
        setTimeout(() => {
            // This would be replaced with actual data fetching
            partnersGrid.innerHTML = `
                <p style="text-align: center; grid-column: 1/-1; color: var(--od-gray-600);">
                    Partner-Daten werden geladen...
                </p>
            `;
        }, 2000);
    }
    
    // Similar for blog posts
    const blogGrid = document.querySelector('.od-blog-section__grid');
    
    if (blogGrid && blogGrid.children.length === 0) {
        blogGrid.innerHTML = Array(3).fill('').map(() => `
            <div class="od-blog-card od-skeleton">
                <div class="od-skeleton" style="height: 180px;"></div>
                <div style="padding: 1.5rem;">
                    <div class="od-skeleton" style="height: 20px; margin-bottom: 0.5rem;"></div>
                    <div class="od-skeleton" style="height: 16px; margin-bottom: 0.5rem;"></div>
                    <div class="od-skeleton" style="height: 16px; width: 80%;"></div>
                </div>
            </div>
        `).join('');
    }
}

// Add CSS for autocomplete suggestions
const style = document.createElement('style');
style.textContent = `
    .od-quick-search__suggestion {
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .od-quick-search__suggestion:hover,
    .od-quick-search__suggestion--active {
        background: var(--od-gray-50);
    }
    
    .od-quick-search__suggestion-icon {
        color: var(--od-gray-400);
        flex-shrink: 0;
    }
    
    .od-quick-search__suggestion strong {
        color: var(--od-primary);
        font-weight: 600;
    }
`;
document.head.appendChild(style);