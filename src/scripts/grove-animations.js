// Grove Animations - Minimal and Smooth

document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('grove-animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.grove-services, .grove-partners, .grove-stats, .grove-insights, .grove-testimonial, .grove-cta');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Smooth counter animation for stats
    const animateValue = (element, start, end, duration) => {
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    };

    // Trigger counter animation when stats section is visible
    const statsSection = document.querySelector('.grove-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statValues = entry.target.querySelectorAll('.grove-stat__value');
                    statValues.forEach(stat => {
                        const text = stat.textContent;
                        const match = text.match(/\d+/);
                        if (match) {
                            const target = parseInt(match[0]);
                            const hasPlus = text.includes('+');
                            const hasPercent = text.includes('%');
                            
                            animateValue(stat, 0, target, 2000);
                            
                            // Add back symbols after animation
                            setTimeout(() => {
                                if (hasPlus) stat.textContent += '+';
                                if (hasPercent) stat.textContent += '%';
                            }, 2000);
                        }
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        statsObserver.observe(statsSection);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

    // Search input focus effects
    const searchInput = document.querySelector('.grove-search__input');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.closest('.grove-search').classList.add('grove-search--focused');
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.closest('.grove-search').classList.remove('grove-search--focused');
        });
    }

    // Hover effects for cards
    const cards = document.querySelectorAll('.grove-service-card, .grove-partner-card, .grove-blog-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});