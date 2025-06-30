// Author Bio System for German Odoo Directory
// Handles author data display with EEAT principles

class AuthorBio {
  constructor() {
    this.authorContainer = null;
    this.authorData = null;
  }

  async init(authorId, containerId) {
    this.authorContainer = document.getElementById(containerId);
    if (!this.authorContainer) return;

    try {
      // Fetch author data from Supabase
      this.authorData = await this.fetchAuthorData(authorId);
      if (this.authorData) {
        this.render();
        this.initAnimations();
        this.trackEngagement();
      }
    } catch (error) {
      console.error('Error initializing author bio:', error);
    }
  }

  async fetchAuthorData(authorId) {
    // In production, this would fetch from Supabase
    // For now, returning mock data structure
    return {
      id: authorId,
      name: "Dr. Klaus Müller",
      title: "Senior Odoo Consultant",
      company: "Deutsche Odoo Experten GmbH",
      headshot_url: "/images/authors/klaus-mueller.jpg",
      bio: "Über 20 Jahre Erfahrung in der erfolgreichen Implementierung von ERP-Systemen für mittelständische Unternehmen in Deutschland. Spezialisiert auf Odoo-Anpassungen für deutsche Geschäftsprozesse und DSGVO-konforme Lösungen.",
      experience_years: 20,
      certifications: [
        { 
          name: "TÜV Certified ERP Consultant", 
          verification_url: "https://tuv.de/verify/123456",
          icon: "tuv",
          issued_by: "TÜV Rheinland"
        },
        { 
          name: "DSGVO Experte", 
          issued_by: "IHK München",
          icon: "dsgvo",
          year: 2018
        },
        {
          name: "Odoo Gold Partner",
          verification_url: "https://odoo.com/partners/verify",
          icon: "odoo",
          level: "gold"
        }
      ],
      expertise: [
        "ERP-Implementierung",
        "DSGVO-Compliance", 
        "Prozessoptimierung",
        "Warenwirtschaft",
        "Finanzbuchhaltung"
      ],
      education: [
        { 
          degree: "Dr. rer. pol.", 
          university: "Technische Universität München", 
          year: 2003,
          field: "Wirtschaftsinformatik"
        }
      ],
      social_profiles: {
        linkedin: "https://linkedin.com/in/klaus-mueller",
        xing: "https://xing.com/profile/klaus_mueller",
        email: "k.mueller@deutsche-odoo.de",
        phone: "+49 89 123456789"
      },
      publications: 5,
      speaking_engagements: 12,
      projects_completed: 150,
      client_satisfaction: 4.8,
      languages: ["Deutsch", "Englisch", "Französisch"]
    };
  }

  render() {
    const html = `
      <div class="author-bio-card" itemscope itemtype="https://schema.org/Person">
        <div class="author-header">
          ${this.renderHeadshot()}
          ${this.renderBasicInfo()}
        </div>
        
        <div class="author-credentials">
          ${this.renderExperienceCounters()}
          ${this.renderCertifications()}
        </div>
        
        <div class="author-expertise">
          ${this.renderExpertiseAreas()}
          ${this.renderEducation()}
        </div>
        
        <div class="author-bio-text">
          <p itemprop="description">${this.authorData.bio}</p>
        </div>
        
        <div class="author-contact">
          ${this.renderContactOptions()}
          ${this.renderSocialProfiles()}
        </div>
        
        <div class="author-trust-indicators">
          ${this.renderTrustBadges()}
        </div>
      </div>
    `;

    this.authorContainer.innerHTML = html;
    this.lazyLoadImages();
  }

  renderHeadshot() {
    return `
      <div class="author-headshot">
        <img 
          data-src="${this.authorData.headshot_url}" 
          alt="${this.authorData.name} - ${this.authorData.title}"
          class="headshot-img lazy"
          itemprop="image"
          loading="lazy"
        />
        <div class="headshot-badge">
          <span class="verified-icon" title="Verifiziertes Profil">✓</span>
        </div>
      </div>
    `;
  }

  renderBasicInfo() {
    return `
      <div class="author-basic-info">
        <h3 class="author-name" itemprop="name">${this.authorData.name}</h3>
        <p class="author-title" itemprop="jobTitle">${this.authorData.title}</p>
        <p class="author-company" itemprop="worksFor" itemscope itemtype="https://schema.org/Organization">
          <span itemprop="name">${this.authorData.company}</span>
        </p>
        <div class="author-languages">
          ${this.authorData.languages.map(lang => 
            `<span class="language-badge">${lang}</span>`
          ).join('')}
        </div>
      </div>
    `;
  }

  renderExperienceCounters() {
    return `
      <div class="experience-counters">
        <div class="counter-item">
          <span class="counter-value" data-target="${this.authorData.experience_years}">0</span>
          <span class="counter-label">Jahre Erfahrung</span>
        </div>
        <div class="counter-item">
          <span class="counter-value" data-target="${this.authorData.projects_completed}">0</span>
          <span class="counter-label">Projekte abgeschlossen</span>
        </div>
        <div class="counter-item">
          <span class="counter-value" data-target="${this.authorData.publications}">0</span>
          <span class="counter-label">Publikationen</span>
        </div>
        <div class="counter-item">
          <div class="rating-stars" data-rating="${this.authorData.client_satisfaction}">
            <span class="stars">★★★★★</span>
          </div>
          <span class="counter-label">Kundenzufriedenheit</span>
        </div>
      </div>
    `;
  }

  renderCertifications() {
    return `
      <div class="certifications-section">
        <h4>Zertifizierungen & Qualifikationen</h4>
        <div class="certifications-grid">
          ${this.authorData.certifications.map(cert => `
            <div class="certification-badge ${cert.icon}">
              ${cert.verification_url ? 
                `<a href="${cert.verification_url}" target="_blank" rel="noopener" class="cert-link">` : 
                '<div class="cert-content">'
              }
                <div class="cert-icon">
                  ${this.getCertificationIcon(cert.icon)}
                </div>
                <div class="cert-details">
                  <span class="cert-name">${cert.name}</span>
                  <span class="cert-issuer">${cert.issued_by}</span>
                  ${cert.year ? `<span class="cert-year">${cert.year}</span>` : ''}
                </div>
                ${cert.verification_url ? 
                  '<span class="verify-link">Verifizieren →</span>' : 
                  ''
                }
              ${cert.verification_url ? '</a>' : '</div>'}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderExpertiseAreas() {
    return `
      <div class="expertise-areas">
        <h4>Fachgebiete</h4>
        <div class="expertise-tags">
          ${this.authorData.expertise.map(area => 
            `<span class="expertise-tag" data-expertise="${area}">
              <span class="expertise-icon">◆</span>
              ${area}
            </span>`
          ).join('')}
        </div>
      </div>
    `;
  }

  renderEducation() {
    return `
      <div class="education-section">
        <h4>Ausbildung</h4>
        ${this.authorData.education.map(edu => `
          <div class="education-item">
            <span class="degree">${edu.degree}</span>
            <span class="university">${edu.university}</span>
            <span class="year">${edu.year}</span>
            ${edu.field ? `<span class="field">${edu.field}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderContactOptions() {
    const { email, phone } = this.authorData.social_profiles;
    return `
      <div class="contact-options">
        <button class="contact-btn email-btn" data-action="email" data-email="${email}">
          <svg class="contact-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          E-Mail senden
        </button>
        <button class="contact-btn phone-btn" data-action="phone" data-phone="${phone}">
          <svg class="contact-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          Anrufen
        </button>
      </div>
    `;
  }

  renderSocialProfiles() {
    const { linkedin, xing } = this.authorData.social_profiles;
    return `
      <div class="social-profiles">
        ${linkedin ? `
          <a href="${linkedin}" target="_blank" rel="noopener" class="social-link linkedin" title="LinkedIn Profil">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        ` : ''}
        ${xing ? `
          <a href="${xing}" target="_blank" rel="noopener" class="social-link xing" title="XING Profil">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M17.703 1c-.247 0-.462.106-.588.303l-6.035 10.724c-.032.057-.032.113 0 .17l3.859 7.068c.126.196.341.303.588.303h2.205c.152 0 .286-.072.372-.184.086-.112.107-.258.058-.394l-3.831-7.017 5.975-10.619c.049-.136.028-.282-.058-.394-.086-.112-.22-.184-.372-.184h-2.173zm-10.409 4.432c-.152 0-.286.072-.372.184-.086.112-.107.258-.058.394l1.733 3.097-2.7 4.517c-.049.136-.028.282.058.394.086.112.22.184.372.184h2.205c.247 0 .462-.106.588-.303l2.728-4.562c.032-.057.032-.113 0-.17l-1.761-3.147c-.126-.196-.341-.303-.588-.303h-2.205z"/>
            </svg>
          </a>
        ` : ''}
      </div>
    `;
  }

  renderTrustBadges() {
    return `
      <div class="trust-badges-mini">
        <span class="trust-badge" title="Verifizierter Experte">
          <svg class="badge-icon" viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          Verifiziert
        </span>
        <span class="trust-badge" title="DSGVO konform">
          <svg class="badge-icon" viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          DSGVO
        </span>
      </div>
    `;
  }

  getCertificationIcon(type) {
    const icons = {
      tuv: '<svg viewBox="0 0 24 24" width="40" height="40"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      dsgvo: '<svg viewBox="0 0 24 24" width="40" height="40"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
      odoo: '<svg viewBox="0 0 24 24" width="40" height="40"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
    };
    return icons[type] || icons.odoo;
  }

  initAnimations() {
    // Animate counters
    const counters = this.authorContainer.querySelectorAll('.counter-value');
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

    // Initialize rating stars
    this.initRatingStars();

    // Add hover effects to expertise tags
    this.initExpertiseHovers();

    // Initialize contact buttons
    this.initContactButtons();
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  }

  initRatingStars() {
    const ratingElement = this.authorContainer.querySelector('.rating-stars');
    if (ratingElement) {
      const rating = parseFloat(ratingElement.dataset.rating);
      const percentage = (rating / 5) * 100;
      const stars = ratingElement.querySelector('.stars');
      stars.style.background = `linear-gradient(90deg, #FFD700 ${percentage}%, #E0E0E0 ${percentage}%)`;
      stars.style.webkitBackgroundClip = 'text';
      stars.style.webkitTextFillColor = 'transparent';
    }
  }

  initExpertiseHovers() {
    const expertiseTags = this.authorContainer.querySelectorAll('.expertise-tag');
    expertiseTags.forEach(tag => {
      tag.addEventListener('mouseenter', () => {
        tag.style.transform = 'translateY(-2px)';
      });
      tag.addEventListener('mouseleave', () => {
        tag.style.transform = 'translateY(0)';
      });
    });
  }

  initContactButtons() {
    const contactBtns = this.authorContainer.querySelectorAll('.contact-btn');
    contactBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        if (action === 'email') {
          this.handleEmailClick(btn.dataset.email);
        } else if (action === 'phone') {
          this.handlePhoneClick(btn.dataset.phone);
        }
      });
    });
  }

  handleEmailClick(email) {
    // Track engagement
    this.trackEngagement('email_click');
    
    // Show privacy notice
    if (confirm('Möchten Sie eine E-Mail senden? Ihre E-Mail-Adresse wird dem Empfänger sichtbar sein.')) {
      window.location.href = `mailto:${email}`;
    }
  }

  handlePhoneClick(phone) {
    // Track engagement
    this.trackEngagement('phone_click');
    
    // Show phone number with privacy notice
    const modal = document.createElement('div');
    modal.className = 'contact-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Telefonnummer</h3>
        <p class="phone-number">${phone}</p>
        <p class="privacy-notice">Bitte beachten Sie unsere Datenschutzrichtlinien beim Kontakt.</p>
        <button class="close-modal">Schließen</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }

  lazyLoadImages() {
    const images = this.authorContainer.querySelectorAll('img.lazy');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  trackEngagement(action) {
    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'author_engagement', {
        event_category: 'Author Bio',
        event_label: action,
        author_id: this.authorData.id
      });
    }
  }
}

// Export for use
window.AuthorBio = AuthorBio;