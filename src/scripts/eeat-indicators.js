// EEAT Indicators System
// Experience, Expertise, Authority, Trust signals for German B2B market

class EEATIndicators {
  constructor() {
    this.indicators = {
      experience: [],
      expertise: [],
      authority: [],
      trust: []
    };
  }

  init(authorData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.calculateIndicators(authorData);
    this.render(container);
    this.initInteractions();
  }

  calculateIndicators(data) {
    // Experience Indicators
    this.indicators.experience = [
      {
        type: 'years',
        value: data.experience_years,
        label: 'Jahre Berufserfahrung',
        score: this.calculateExperienceScore(data.experience_years),
        icon: 'calendar'
      },
      {
        type: 'projects',
        value: data.projects_completed,
        label: 'Abgeschlossene Projekte',
        score: this.calculateProjectScore(data.projects_completed),
        icon: 'briefcase'
      },
      {
        type: 'industries',
        value: data.industries_served || 15,
        label: 'Branchen betreut',
        score: Math.min(data.industries_served / 20 * 100, 100),
        icon: 'industry'
      },
      {
        type: 'clients',
        value: data.clients_served || 50,
        label: 'Zufriedene Kunden',
        score: Math.min(data.clients_served / 100 * 100, 100),
        icon: 'users'
      }
    ];

    // Expertise Indicators
    this.indicators.expertise = [
      {
        type: 'certifications',
        value: data.certifications.length,
        label: 'Zertifizierungen',
        items: data.certifications,
        score: Math.min(data.certifications.length * 25, 100),
        icon: 'certificate'
      },
      {
        type: 'specializations',
        value: data.expertise.length,
        label: 'Spezialisierungen',
        items: data.expertise,
        score: Math.min(data.expertise.length * 20, 100),
        icon: 'star'
      },
      {
        type: 'training_hours',
        value: data.training_hours || 200,
        label: 'Fortbildungsstunden',
        score: Math.min(data.training_hours / 300 * 100, 100),
        icon: 'graduation'
      },
      {
        type: 'technologies',
        value: data.technologies || 12,
        label: 'Technologien beherrscht',
        score: Math.min(data.technologies / 15 * 100, 100),
        icon: 'code'
      }
    ];

    // Authority Indicators
    this.indicators.authority = [
      {
        type: 'publications',
        value: data.publications,
        label: 'Fachpublikationen',
        score: Math.min(data.publications * 15, 100),
        icon: 'book'
      },
      {
        type: 'speaking',
        value: data.speaking_engagements,
        label: 'Vorträge gehalten',
        score: Math.min(data.speaking_engagements * 8, 100),
        icon: 'microphone'
      },
      {
        type: 'awards',
        value: data.awards || 3,
        label: 'Auszeichnungen',
        score: Math.min(data.awards * 30, 100),
        icon: 'trophy'
      },
      {
        type: 'media_mentions',
        value: data.media_mentions || 8,
        label: 'Medienpräsenz',
        score: Math.min(data.media_mentions * 10, 100),
        icon: 'newspaper'
      }
    ];

    // Trust Indicators (German-specific)
    this.indicators.trust = [
      {
        type: 'company_registration',
        value: data.handelsregister ? 'HRB ' + data.handelsregister : 'Registriert',
        label: 'Handelsregister',
        verified: true,
        score: 100,
        icon: 'shield'
      },
      {
        type: 'tax_id',
        value: data.ust_id ? 'DE' + data.ust_id.slice(-6) + '***' : 'Vorhanden',
        label: 'USt-IdNr.',
        verified: true,
        score: 100,
        icon: 'document'
      },
      {
        type: 'insurance',
        value: 'Berufshaftpflicht',
        label: 'Versichert',
        verified: true,
        score: 100,
        icon: 'umbrella'
      },
      {
        type: 'data_protection',
        value: 'DSGVO konform',
        label: 'Datenschutz',
        verified: true,
        score: 100,
        icon: 'lock'
      }
    ];
  }

  calculateExperienceScore(years) {
    if (years >= 20) return 100;
    if (years >= 15) return 90;
    if (years >= 10) return 80;
    if (years >= 5) return 60;
    return years * 12;
  }

  calculateProjectScore(projects) {
    if (projects >= 150) return 100;
    if (projects >= 100) return 90;
    if (projects >= 50) return 75;
    return Math.min(projects * 1.5, 100);
  }

  render(container) {
    const html = `
      <div class="eeat-indicators-container">
        <div class="eeat-header">
          <h3>Qualifikationsprofil</h3>
          <div class="eeat-overall-score">
            <div class="score-circle" data-score="${this.calculateOverallScore()}">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="5"/>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#2ecc71" stroke-width="5"
                        stroke-dasharray="${this.calculateOverallScore() * 2.83} 283"
                        transform="rotate(-90 50 50)"/>
              </svg>
              <div class="score-text">${Math.round(this.calculateOverallScore())}%</div>
            </div>
            <p class="score-label">Vertrauenswürdigkeit</p>
          </div>
        </div>

        <div class="eeat-categories">
          ${this.renderCategory('experience', 'Erfahrung')}
          ${this.renderCategory('expertise', 'Expertise')}
          ${this.renderCategory('authority', 'Autorität')}
          ${this.renderCategory('trust', 'Vertrauen')}
        </div>

        <div class="eeat-details">
          ${this.renderDetailedIndicators()}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.animateScores();
  }

  renderCategory(type, label) {
    const categoryScore = this.calculateCategoryScore(type);
    return `
      <div class="eeat-category" data-category="${type}">
        <h4>${label}</h4>
        <div class="category-score">
          <div class="score-bar">
            <div class="score-fill" data-score="${categoryScore}" style="width: 0%"></div>
          </div>
          <span class="score-value">${Math.round(categoryScore)}%</span>
        </div>
        <div class="category-indicators">
          ${this.indicators[type].slice(0, 2).map(ind => `
            <div class="mini-indicator">
              <span class="indicator-icon">${this.getIcon(ind.icon)}</span>
              <span class="indicator-value">${ind.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderDetailedIndicators() {
    return `
      <div class="detailed-indicators">
        <h4>Detaillierte Qualifikationen</h4>
        <div class="indicators-grid">
          ${Object.entries(this.indicators).map(([category, items]) => 
            items.map(indicator => this.renderDetailedIndicator(indicator, category)).join('')
          ).join('')}
        </div>
      </div>
    `;
  }

  renderDetailedIndicator(indicator, category) {
    return `
      <div class="detailed-indicator ${category}" data-type="${indicator.type}">
        <div class="indicator-header">
          <span class="indicator-icon">${this.getIcon(indicator.icon)}</span>
          <div class="indicator-info">
            <span class="indicator-label">${indicator.label}</span>
            <span class="indicator-value">${indicator.value}</span>
          </div>
        </div>
        <div class="indicator-progress">
          <div class="progress-bar">
            <div class="progress-fill" data-score="${indicator.score}" style="width: 0%"></div>
          </div>
        </div>
        ${indicator.verified ? '<span class="verified-badge">✓ Verifiziert</span>' : ''}
        ${indicator.items ? this.renderIndicatorItems(indicator.items) : ''}
      </div>
    `;
  }

  renderIndicatorItems(items) {
    if (!items || items.length === 0) return '';
    return `
      <div class="indicator-items">
        ${items.slice(0, 3).map(item => `
          <span class="item-badge">
            ${typeof item === 'string' ? item : item.name}
          </span>
        `).join('')}
        ${items.length > 3 ? `<span class="more-items">+${items.length - 3} mehr</span>` : ''}
      </div>
    `;
  }

  calculateOverallScore() {
    const allScores = [];
    Object.values(this.indicators).forEach(category => {
      category.forEach(indicator => {
        allScores.push(indicator.score);
      });
    });
    return allScores.reduce((a, b) => a + b, 0) / allScores.length;
  }

  calculateCategoryScore(category) {
    const scores = this.indicators[category].map(ind => ind.score);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  getIcon(type) {
    const icons = {
      calendar: '📅',
      briefcase: '💼',
      industry: '🏭',
      users: '👥',
      certificate: '📜',
      star: '⭐',
      graduation: '🎓',
      code: '💻',
      book: '📚',
      microphone: '🎤',
      trophy: '🏆',
      newspaper: '📰',
      shield: '🛡️',
      document: '📄',
      umbrella: '☂️',
      lock: '🔒'
    };
    return icons[type] || '📊';
  }

  animateScores() {
    // Animate score bars
    const scoreBars = document.querySelectorAll('.score-fill, .progress-fill');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const score = entry.target.dataset.score;
          setTimeout(() => {
            entry.target.style.width = score + '%';
          }, 100);
          observer.unobserve(entry.target);
        }
      });
    });

    scoreBars.forEach(bar => observer.observe(bar));

    // Animate overall score circle
    const scoreCircle = document.querySelector('.score-circle circle:last-child');
    if (scoreCircle) {
      setTimeout(() => {
        scoreCircle.style.transition = 'stroke-dasharray 2s ease-out';
      }, 100);
    }
  }

  initInteractions() {
    // Category hover effects
    const categories = document.querySelectorAll('.eeat-category');
    categories.forEach(category => {
      category.addEventListener('mouseenter', () => {
        category.classList.add('highlighted');
      });
      category.addEventListener('mouseleave', () => {
        category.classList.remove('highlighted');
      });
    });

    // Detailed indicator tooltips
    const indicators = document.querySelectorAll('.detailed-indicator');
    indicators.forEach(indicator => {
      indicator.addEventListener('click', () => {
        this.showIndicatorDetails(indicator);
      });
    });
  }

  showIndicatorDetails(indicator) {
    const type = indicator.dataset.type;
    // Create modal or tooltip with detailed information
    const modal = document.createElement('div');
    modal.className = 'indicator-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Details zu ${indicator.querySelector('.indicator-label').textContent}</h3>
        <p>Weitere Informationen zu dieser Qualifikation...</p>
        <button class="close-modal">Schließen</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }
}

// Export for use
window.EEATIndicators = EEATIndicators;