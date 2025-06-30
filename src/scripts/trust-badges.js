// Trust Badges System for German B2B Market
// Displays certifications, compliance badges, and trust signals

class TrustBadges {
  constructor() {
    this.badges = [];
    this.verificationAPIs = {
      tuv: 'https://www.tuv.com/verify/',
      ihk: 'https://www.ihk.de/verify/',
      iso: 'https://www.iso.org/verify/'
    };
  }

  init(badgeData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.badges = this.processBadgeData(badgeData);
    this.render(container);
    this.initVerification();
    this.initAnimations();
  }

  processBadgeData(data) {
    return [
      // German Certifications
      {
        id: 'tuv-cert',
        name: 'TÜV Zertifiziert',
        type: 'certification',
        icon: 'tuv',
        verificationUrl: data.tuv_verification_url,
        verificationNumber: data.tuv_cert_number,
        validUntil: data.tuv_valid_until,
        description: 'TÜV Rheinland zertifizierter ERP-Berater',
        priority: 1
      },
      {
        id: 'dsgvo-compliant',
        name: 'DSGVO Konform',
        type: 'compliance',
        icon: 'dsgvo',
        verified: true,
        description: 'Vollständig DSGVO-konforme Prozesse',
        features: [
          'Datenschutz-Folgenabschätzung',
          'Verschlüsselte Datenübertragung',
          'Löschkonzept implementiert'
        ],
        priority: 1
      },
      {
        id: 'iso-27001',
        name: 'ISO 27001',
        type: 'certification',
        icon: 'iso',
        verificationUrl: data.iso_verification_url,
        validUntil: data.iso_valid_until,
        description: 'Informationssicherheits-Managementsystem',
        priority: 2
      },
      {
        id: 'ihk-member',
        name: 'IHK Mitglied',
        type: 'membership',
        icon: 'ihk',
        memberNumber: data.ihk_member_number,
        chamber: 'IHK München und Oberbayern',
        description: 'Eingetragenes Mitglied der IHK',
        priority: 3
      },
      {
        id: 'odoo-partner',
        name: data.odoo_partner_level + ' Partner',
        type: 'partnership',
        icon: 'odoo',
        level: data.odoo_partner_level,
        verificationUrl: 'https://www.odoo.com/partners/' + data.company_slug,
        description: 'Offizieller Odoo Partner',
        achievements: [
          data.odoo_implementations + ' Implementierungen',
          data.odoo_certified_consultants + ' zertifizierte Berater',
          'Seit ' + data.odoo_partner_since
        ],
        priority: 2
      },
      {
        id: 'years-business',
        name: data.years_in_business + ' Jahre',
        type: 'experience',
        icon: 'years',
        value: data.years_in_business,
        founded: data.company_founded,
        description: 'Jahre Geschäftserfahrung',
        milestones: [
          'Gegründet ' + data.company_founded,
          data.total_clients + '+ zufriedene Kunden',
          data.team_size + ' Mitarbeiter'
        ],
        priority: 4
      },
      {
        id: 'insurance',
        name: 'Versichert',
        type: 'security',
        icon: 'insurance',
        coverage: 'Berufshaftpflichtversicherung',
        amount: '5 Mio. EUR',
        provider: 'Allianz',
        description: 'Umfassender Versicherungsschutz',
        priority: 5
      },
      {
        id: 'handelsregister',
        name: 'Handelsregister',
        type: 'legal',
        icon: 'register',
        registerNumber: data.handelsregister,
        court: data.registergericht,
        description: 'Eingetragen im Handelsregister',
        priority: 5
      }
    ].filter(badge => badge.verificationUrl || badge.verified || badge.value);
  }

  render(container) {
    const html = `
      <div class="trust-badges-container">
        <div class="badges-header">
          <h3>Vertrauen & Sicherheit</h3>
          <p class="badges-subtitle">Zertifizierte Qualität für Ihr Unternehmen</p>
        </div>
        
        <div class="badges-grid">
          ${this.badges
            .sort((a, b) => a.priority - b.priority)
            .map(badge => this.renderBadge(badge))
            .join('')}
        </div>
        
        <div class="badges-verification">
          <p class="verification-note">
            <svg class="verify-icon" viewBox="0 0 24 24" width="16" height="16">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Alle Zertifikate sind verifizierbar und aktuell gültig
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  renderBadge(badge) {
    const isClickable = badge.verificationUrl || badge.type === 'certification';
    const element = isClickable ? 'a' : 'div';
    const attributes = isClickable ? `href="${badge.verificationUrl || '#'}" target="_blank" rel="noopener"` : '';

    return `
      <${element} class="trust-badge-card ${badge.type}" data-badge-id="${badge.id}" ${attributes}>
        <div class="badge-icon-wrapper">
          ${this.getBadgeIcon(badge.icon)}
          ${badge.verified ? '<span class="verified-checkmark">✓</span>' : ''}
        </div>
        
        <div class="badge-content">
          <h4 class="badge-name">${badge.name}</h4>
          <p class="badge-description">${badge.description}</p>
          
          ${badge.validUntil ? `
            <div class="badge-validity">
              <span class="validity-label">Gültig bis:</span>
              <span class="validity-date">${this.formatDate(badge.validUntil)}</span>
            </div>
          ` : ''}
          
          ${badge.features ? `
            <ul class="badge-features">
              ${badge.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${badge.achievements ? `
            <div class="badge-achievements">
              ${badge.achievements.map(achievement => `
                <span class="achievement-item">${achievement}</span>
              `).join('')}
            </div>
          ` : ''}
          
          ${badge.milestones ? `
            <div class="badge-milestones">
              ${badge.milestones.map(milestone => `
                <span class="milestone-item">${milestone}</span>
              `).join('')}
            </div>
          ` : ''}
          
          ${badge.verificationUrl ? `
            <span class="verification-link">
              Verifizieren
              <svg class="external-icon" viewBox="0 0 24 24" width="12" height="12">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </span>
          ` : ''}
        </div>
        
        ${badge.type === 'experience' ? `
          <div class="badge-counter" data-target="${badge.value}">
            <span class="counter-number">0</span>
            <span class="counter-label">Jahre</span>
          </div>
        ` : ''}
      </${element}>
    `;
  }

  getBadgeIcon(type) {
    const icons = {
      tuv: `<svg viewBox="0 0 100 100" class="badge-icon tuv-icon">
        <circle cx="50" cy="50" r="45" fill="#005AAA"/>
        <text x="50" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold">TÜV</text>
        <text x="50" y="65" text-anchor="middle" fill="white" font-size="14">Rheinland</text>
      </svg>`,
      
      dsgvo: `<svg viewBox="0 0 24 24" class="badge-icon dsgvo-icon">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>`,
      
      iso: `<svg viewBox="0 0 100 100" class="badge-icon iso-icon">
        <rect x="10" y="30" width="80" height="40" fill="#ED1C24" rx="5"/>
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="20" font-weight="bold">ISO</text>
      </svg>`,
      
      ihk: `<svg viewBox="0 0 100 100" class="badge-icon ihk-icon">
        <rect x="10" y="30" width="80" height="40" fill="#004B87" rx="5"/>
        <text x="50" y="55" text-anchor="middle" fill="white" font-size="20" font-weight="bold">IHK</text>
      </svg>`,
      
      odoo: `<svg viewBox="0 0 24 24" class="badge-icon odoo-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#714B67"/>
        <circle cx="12" cy="12" r="5" fill="#714B67"/>
      </svg>`,
      
      years: `<svg viewBox="0 0 24 24" class="badge-icon years-icon">
        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
      </svg>`,
      
      insurance: `<svg viewBox="0 0 24 24" class="badge-icon insurance-icon">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12V11c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V6.3l7-3.12zM11 7h2v2h-2zm0 4h2v6h-2z"/>
      </svg>`,
      
      register: `<svg viewBox="0 0 24 24" class="badge-icon register-icon">
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>`
    };
    
    return icons[type] || icons.odoo;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  initVerification() {
    const verifiableBadges = this.container.querySelectorAll('.trust-badge-card[href]');
    verifiableBadges.forEach(badge => {
      badge.addEventListener('click', (e) => {
        if (badge.dataset.badgeId.includes('cert')) {
          e.preventDefault();
          this.showVerificationModal(badge.dataset.badgeId);
        }
      });
    });
  }

  showVerificationModal(badgeId) {
    const badge = this.badges.find(b => b.id === badgeId);
    if (!badge) return;

    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Zertifikat Verifizierung</h3>
        <div class="verification-details">
          <p><strong>Zertifikat:</strong> ${badge.name}</p>
          <p><strong>Nummer:</strong> ${badge.verificationNumber || 'N/A'}</p>
          <p><strong>Gültig bis:</strong> ${this.formatDate(badge.validUntil)}</p>
        </div>
        <div class="verification-actions">
          <a href="${badge.verificationUrl}" target="_blank" class="verify-button">
            Online verifizieren
          </a>
          <button class="close-modal">Schließen</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }

  initAnimations() {
    // Animate counters
    const counters = document.querySelectorAll('.badge-counter');
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    counters.forEach(counter => counterObserver.observe(counter));

    // Badge hover effects
    const badges = document.querySelectorAll('.trust-badge-card');
    badges.forEach(badge => {
      badge.addEventListener('mouseenter', () => {
        badge.style.transform = 'translateY(-5px)';
      });
      badge.addEventListener('mouseleave', () => {
        badge.style.transform = 'translateY(0)';
      });
    });

    // Pulse animation for verified badges
    const verifiedBadges = document.querySelectorAll('.verified-checkmark');
    verifiedBadges.forEach(checkmark => {
      checkmark.style.animation = 'pulse 2s infinite';
    });
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const numberElement = element.querySelector('.counter-number');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        numberElement.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        numberElement.textContent = target;
      }
    };

    updateCounter();
  }

  // Client testimonial integration
  async loadTestimonials(authorId) {
    // In production, fetch from Supabase
    const testimonials = [
      {
        client: "BMW Group",
        text: "Exzellente Beratung und professionelle Umsetzung.",
        rating: 5,
        logo: "/images/clients/bmw.svg"
      },
      {
        client: "Siemens AG",
        text: "Sehr kompetent in allen Aspekten der ERP-Implementierung.",
        rating: 5,
        logo: "/images/clients/siemens.svg"
      }
    ];

    return testimonials;
  }

  renderTestimonialBadge(testimonials) {
    const avgRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
    
    return `
      <div class="testimonial-badge">
        <div class="testimonial-header">
          <h4>Kundenstimmen</h4>
          <div class="rating">
            <span class="stars">${'★'.repeat(Math.round(avgRating))}</span>
            <span class="rating-value">${avgRating.toFixed(1)}</span>
          </div>
        </div>
        <div class="testimonial-logos">
          ${testimonials.slice(0, 3).map(t => 
            `<img src="${t.logo}" alt="${t.client}" class="client-logo" />`
          ).join('')}
          ${testimonials.length > 3 ? `<span class="more-clients">+${testimonials.length - 3}</span>` : ''}
        </div>
      </div>
    `;
  }
}

// Export for use
window.TrustBadges = TrustBadges;