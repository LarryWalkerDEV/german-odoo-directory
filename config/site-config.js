// German Odoo Directory Site Configuration

export const siteConfig = {
  // Site metadata
  siteName: 'Deutsche Odoo Experten',
  siteUrl: 'https://odoo-experten-deutschland.de',
  language: 'de',
  locale: 'de_DE',
  
  // SEO defaults
  defaultTitle: 'Deutsche Odoo Experten - Finden Sie Ihren Odoo Partner',
  defaultDescription: 'Deutschlands führendes Verzeichnis für zertifizierte Odoo Partner. Finden Sie Experten für ERP-Implementierung, DSGVO-Compliance und Odoo Support.',
  
  // German business context
  businessContext: {
    certifications: ['TÜV', 'DSGVO', 'ISO 27001', 'GoBD'],
    regions: [
      'Baden-Württemberg',
      'Bayern',
      'Berlin',
      'Brandenburg',
      'Bremen',
      'Hamburg',
      'Hessen',
      'Mecklenburg-Vorpommern',
      'Niedersachsen',
      'Nordrhein-Westfalen',
      'Rheinland-Pfalz',
      'Saarland',
      'Sachsen',
      'Sachsen-Anhalt',
      'Schleswig-Holstein',
      'Thüringen'
    ],
    cities: [
      'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt',
      'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig',
      'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg'
    ]
  },
  
  // Partner categories (German)
  partnerCategories: {
    'erp-implementation': {
      name: 'ERP Implementierung',
      description: 'Experten für die Einführung von Odoo ERP-Systemen'
    },
    'odoo-hosting': {
      name: 'Odoo Hosting',
      description: 'Sichere und DSGVO-konforme Hosting-Lösungen'
    },
    'dsgvo-compliance': {
      name: 'DSGVO Compliance',
      description: 'Datenschutz und DSGVO-Beratung für Odoo'
    },
    'support-maintenance': {
      name: 'Support & Wartung',
      description: 'Professioneller Support und Wartungsdienstleistungen'
    },
    'custom-development': {
      name: 'Individuelle Entwicklung',
      description: 'Maßgeschneiderte Odoo Anpassungen und Module'
    }
  },
  
  // Subscription tiers
  subscriptionTiers: {
    starter: {
      name: 'Starter',
      price: 49,
      features: [
        'Basis-Eintrag im Verzeichnis',
        'Kontaktinformationen',
        'Bis zu 3 Spezialisierungen',
        'Regionale Sichtbarkeit'
      ]
    },
    premium: {
      name: 'Premium',
      price: 149,
      features: [
        'Hervorgehobener Eintrag',
        'Erweiterte Kontaktoptionen',
        'Unbegrenzte Spezialisierungen',
        'Deutschlandweite Sichtbarkeit',
        'Zertifizierungs-Badges',
        'Direkte Anfragen'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: 349,
      features: [
        'Top-Platzierung im Verzeichnis',
        'Vollständiges Unternehmensprofil',
        'Case Studies & Referenzen',
        'Lead-Generierung',
        'Monatliche Performance-Reports',
        'Dedizierter Account Manager'
      ]
    }
  },
  
  // EEAT indicators
  eeatIndicators: {
    experience: {
      label: 'Jahre Erfahrung',
      icon: 'calendar',
      minYears: 5
    },
    expertise: {
      label: 'Zertifizierungen',
      icon: 'certificate',
      badges: ['Odoo Partner', 'TÜV geprüft', 'DSGVO Experte']
    },
    authority: {
      label: 'Referenzen',
      icon: 'star',
      minProjects: 10
    },
    trust: {
      label: 'Vertrauen',
      icon: 'shield',
      indicators: ['Impressum vorhanden', 'USt-ID verifiziert', 'Handelsregister']
    }
  },
  
  // Content processing
  contentSettings: {
    linkProcessing: {
      internalClass: 'od-internal-link',
      externalClass: 'od-external-link',
      externalTarget: '_blank',
      externalRel: 'noopener noreferrer'
    },
    svgSanitization: {
      allowedTags: ['svg', 'path', 'rect', 'circle', 'line', 'text', 'g', 'defs', 'pattern'],
      allowedAttributes: ['d', 'fill', 'stroke', 'stroke-width', 'transform', 'viewBox', 'width', 'height', 'x', 'y', 'rx', 'ry', 'cx', 'cy', 'r']
    }
  },
  
  // Animation settings (Grove.ai inspired)
  animationSettings: {
    intersectionThreshold: 0.3,
    rootMargin: '-50px',
    staggerDelay: 200,
    counterDuration: 2000,
    transitionDuration: 300
  }
};

// Export helper functions
export function getPartnerCategoryName(slug) {
  return siteConfig.partnerCategories[slug]?.name || slug;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

export function getCertificationBadge(certification) {
  const badges = {
    'TÜV': { color: '#0066CC', icon: '✓' },
    'DSGVO': { color: '#00A36C', icon: '🛡️' },
    'ISO 27001': { color: '#FF6B35', icon: '🏆' },
    'GoBD': { color: '#7B68EE', icon: '📋' }
  };
  return badges[certification] || { color: '#666', icon: '•' };
}