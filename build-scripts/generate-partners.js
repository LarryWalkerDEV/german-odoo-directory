import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { siteConfig, getPartnerCategoryName, getCertificationBadge } from '../config/site-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'dist', 'data');
const partnerDir = path.join(rootDir, 'dist', 'partner');

// Ensure partner directory exists
if (!fs.existsSync(partnerDir)) {
  fs.mkdirSync(partnerDir, { recursive: true });
}

// Load partner data
function loadPartnerData() {
  const partners = JSON.parse(fs.readFileSync(path.join(dataDir, 'partners.json'), 'utf8'));
  return partners;
}

// Generate partner-specific CSS
function generatePartnerStyles() {
  const partnerStyles = `
/* Partner-specific styles */
.partner-hero {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 4rem 0;
  margin-bottom: 3rem;
}

.partner-hero h1 {
  color: white;
  margin-bottom: 1rem;
}

.partner-filters {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.partner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.partner-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
}

.partner-card.premium {
  border-color: #ffc107;
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.2);
}

.partner-card.enterprise {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.partner-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tier-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.tier-badge.premium {
  background: #ffc107;
  color: #000;
}

.tier-badge.enterprise {
  background: #4caf50;
  color: white;
}

.partner-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.partner-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;
  margin-bottom: 3rem;
}

.partner-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.info-section {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
}

.info-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.certification-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.cert-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  border: 2px solid;
}

.service-list {
  list-style: none;
  padding: 0;
}

.service-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.service-list li:last-child {
  border-bottom: none;
}

.contact-section {
  background: #1e3c72;
  color: white;
  padding: 3rem;
  border-radius: 8px;
  text-align: center;
}

.contact-section h3 {
  color: white;
  margin-bottom: 1.5rem;
}

.contact-button {
  display: inline-block;
  background: white;
  color: #1e3c72;
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.contact-button:hover {
  transform: scale(1.05);
}

.map-container {
  height: 400px;
  background: #f0f0f0;
  border-radius: 8px;
  margin: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}
`;
  
  const cssPath = path.join(rootDir, 'dist', 'css', 'partners.css');
  fs.writeFileSync(cssPath, partnerStyles);
  console.log('✅ Partner styles generated');
}

// Generate partner directory page with filtering
function generatePartnerDirectory(partners) {
  console.log('🏢 Generating partner directory...');
  
  // Group partners by various criteria
  const partnersByState = groupBy(partners, p => p.location.state || 'Andere');
  const partnersByService = {};
  const allServices = new Set();
  const allCertifications = new Set();
  
  partners.forEach(partner => {
    partner.services.forEach(service => {
      allServices.add(service);
      if (!partnersByService[service]) {
        partnersByService[service] = [];
      }
      partnersByService[service].push(partner);
    });
    
    partner.certifications.forEach(cert => {
      allCertifications.add(cert);
    });
  });
  
  const content = `
    <div class="partner-hero">
      <div class="container">
        <h1>Odoo Partner Verzeichnis</h1>
        <p>Finden Sie den perfekten Odoo Partner für Ihr Unternehmen in Deutschland</p>
      </div>
    </div>
    
    <div class="container">
      <div class="partner-directory-layout">
        <aside class="partner-filters">
          <h3>Filter</h3>
          
          <div class="filter-group">
            <label for="state-filter">Bundesland</label>
            <select id="state-filter" class="filter-select">
              <option value="">Alle Bundesländer</option>
              ${siteConfig.businessContext.regions.map(region => 
                `<option value="${region}">${region}</option>`
              ).join('')}
            </select>
          </div>
          
          <div class="filter-group">
            <label for="service-filter">Dienstleistung</label>
            <select id="service-filter" class="filter-select">
              <option value="">Alle Dienstleistungen</option>
              ${Array.from(allServices).sort().map(service => 
                `<option value="${service}">${service}</option>`
              ).join('')}
            </select>
          </div>
          
          <div class="filter-group">
            <label for="cert-filter">Zertifizierung</label>
            <select id="cert-filter" class="filter-select">
              <option value="">Alle Zertifizierungen</option>
              ${Array.from(allCertifications).sort().map(cert => 
                `<option value="${cert}">${cert}</option>`
              ).join('')}
            </select>
          </div>
          
          <button id="reset-filters" class="btn btn-secondary">Filter zurücksetzen</button>
        </aside>
        
        <main class="partner-listing">
          <div class="listing-header">
            <h2>Alle Partner</h2>
            <p>${partners.length} Partner gefunden</p>
          </div>
          
          <div class="partner-grid" id="partner-grid">
            ${partners.map(partner => generatePartnerCard(partner)).join('')}
          </div>
        </main>
      </div>
    </div>
    
    <script>
      // Simple filtering functionality
      document.addEventListener('DOMContentLoaded', function() {
        const stateFilter = document.getElementById('state-filter');
        const serviceFilter = document.getElementById('service-filter');
        const certFilter = document.getElementById('cert-filter');
        const resetButton = document.getElementById('reset-filters');
        const partnerCards = document.querySelectorAll('.partner-card');
        
        function filterPartners() {
          const selectedState = stateFilter.value;
          const selectedService = serviceFilter.value;
          const selectedCert = certFilter.value;
          
          partnerCards.forEach(card => {
            const state = card.dataset.state;
            const services = card.dataset.services.split(',');
            const certs = card.dataset.certifications.split(',');
            
            const matchesState = !selectedState || state === selectedState;
            const matchesService = !selectedService || services.includes(selectedService);
            const matchesCert = !selectedCert || certs.includes(selectedCert);
            
            if (matchesState && matchesService && matchesCert) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        }
        
        stateFilter.addEventListener('change', filterPartners);
        serviceFilter.addEventListener('change', filterPartners);
        certFilter.addEventListener('change', filterPartners);
        
        resetButton.addEventListener('click', function() {
          stateFilter.value = '';
          serviceFilter.value = '';
          certFilter.value = '';
          filterPartners();
        });
      });
    </script>
  `;
  
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Odoo Partner Verzeichnis - ${siteConfig.siteName}</title>
    <meta name="description" content="Vollständiges Verzeichnis zertifizierter Odoo Partner in Deutschland. Finden Sie Experten für ERP-Implementierung, DSGVO-Compliance und Odoo Support.">
    <!-- CSS Files in correct order -->
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/components.css">
    <link rel="stylesheet" href="/css/animations.css">
    <link rel="stylesheet" href="/css/partner-search.css">
    <link rel="stylesheet" href="/css/author-bio.css">
    <link rel="stylesheet" href="/css/responsive.css">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <h1><a href="/">${siteConfig.siteName}</a></h1>
            <nav>
                <a href="/">Home</a>
                <a href="/blog/">Blog</a>
                <a href="/partner/" class="active">Partner</a>
            </nav>
        </div>
    </header>
    
    <main>
        ${content}
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${siteConfig.siteName}. Alle Rechte vorbehalten.</p>
        </div>
    </footer>
    
    <!-- JavaScript Files -->
    <script src="/js/main.js" defer></script>
    <script src="/js/partner-search.js" defer></script>
    <script src="/js/animations.js" defer></script>
    <script src="/js/filter-manager.js" defer></script>
    <script src="/js/location-search.js" defer></script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(partnerDir, 'index.html'), html);
  console.log('✅ Partner directory generated');
}

// Generate individual partner card
function generatePartnerCard(partner) {
  const tierClass = partner.subscription_tier || 'starter';
  const tierName = siteConfig.subscriptionTiers[tierClass]?.name || 'Starter';
  
  return `
    <div class="partner-card ${tierClass}" 
         data-state="${partner.location.state || ''}"
         data-services="${partner.services.join(',')}"
         data-certifications="${partner.certifications.join(',')}">
      ${tierClass !== 'starter' ? `<span class="tier-badge ${tierClass}">${tierName}</span>` : ''}
      <h3><a href="/partner/${partner.slug}/">${partner.company_name}</a></h3>
      <p class="location">${partner.location.city}, ${partner.location.state}</p>
      
      <div class="partner-meta">
        ${partner.years_experience ? `
          <div class="experience">
            <strong>${partner.years_experience}</strong> Jahre Erfahrung
          </div>
        ` : ''}
        
        ${partner.project_count ? `
          <div class="projects">
            <strong>${partner.project_count}+</strong> Projekte
          </div>
        ` : ''}
      </div>
      
      <div class="services">
        <h4>Dienstleistungen:</h4>
        <div class="tag-list">
          ${partner.services.slice(0, 3).map(service => 
            `<span class="tag">${service}</span>`
          ).join('')}
          ${partner.services.length > 3 ? `<span class="tag">+${partner.services.length - 3} mehr</span>` : ''}
        </div>
      </div>
      
      ${partner.certifications.length > 0 ? `
        <div class="certifications">
          ${partner.certifications.slice(0, 3).map(cert => {
            const badge = getCertificationBadge(cert);
            return `<span class="cert-badge" style="color: ${badge.color}">${badge.icon} ${cert}</span>`;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Generate individual partner profile page
function generatePartnerProfile(partner) {
  const metaTags = `
    <meta property="og:type" content="business.business">
    <meta property="og:title" content="${partner.company_name} - Odoo Partner">
    <meta property="og:description" content="${partner.description || `${partner.company_name} - Zertifizierter Odoo Partner in ${partner.location.city}`}">
    <meta property="business:contact_data:street_address" content="${partner.location.street || ''}">
    <meta property="business:contact_data:locality" content="${partner.location.city}">
    <meta property="business:contact_data:region" content="${partner.location.state}">
    <meta property="business:contact_data:country_name" content="Deutschland">
    <link rel="stylesheet" href="/css/partners.css">
  `;
  
  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": partner.company_name,
    "description": partner.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": partner.location.city,
      "addressRegion": partner.location.state,
      "addressCountry": "DE"
    },
    "geo": partner.location.latitude && partner.location.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": partner.location.latitude,
      "longitude": partner.location.longitude
    } : undefined,
    "url": partner.website,
    "telephone": partner.contact_info.phone,
    "email": partner.contact_info.email,
    "priceRange": siteConfig.subscriptionTiers[partner.subscription_tier]?.price ? "€€" : "€"
  };
  
  const content = `
    <div class="partner-profile">
      <header class="partner-header">
        <div>
          <h1>${partner.company_name}</h1>
          <p class="location">${partner.location.city}, ${partner.location.state}</p>
          ${partner.subscription_tier !== 'starter' ? `
            <span class="tier-badge ${partner.subscription_tier}">
              ${siteConfig.subscriptionTiers[partner.subscription_tier]?.name} Partner
            </span>
          ` : ''}
        </div>
        
        <div class="quick-stats">
          ${partner.years_experience ? `
            <div class="stat">
              <strong>${partner.years_experience}</strong>
              <span>Jahre Erfahrung</span>
            </div>
          ` : ''}
          ${partner.project_count ? `
            <div class="stat">
              <strong>${partner.project_count}+</strong>
              <span>Projekte</span>
            </div>
          ` : ''}
          ${partner.team_size ? `
            <div class="stat">
              <strong>${partner.team_size}</strong>
              <span>Mitarbeiter</span>
            </div>
          ` : ''}
        </div>
      </header>
      
      <section class="partner-description">
        <h2>Über uns</h2>
        <p>${partner.description || 'Keine Beschreibung verfügbar.'}</p>
      </section>
      
      <div class="partner-info">
        <section class="info-section">
          <h3>Unsere Dienstleistungen</h3>
          <ul class="service-list">
            ${partner.services.map(service => `
              <li>${getPartnerCategoryName(service) || service}</li>
            `).join('')}
          </ul>
        </section>
        
        <section class="info-section">
          <h3>Branchen-Expertise</h3>
          ${partner.industries.length > 0 ? `
            <ul class="service-list">
              ${partner.industries.map(industry => `<li>${industry}</li>`).join('')}
            </ul>
          ` : '<p>Branchenübergreifende Expertise</p>'}
        </section>
      </div>
      
      ${partner.certifications.length > 0 ? `
        <section class="certifications-section">
          <h3>Zertifizierungen & Qualifikationen</h3>
          <div class="certification-grid">
            ${partner.certifications.map(cert => {
              const badge = getCertificationBadge(cert);
              return `
                <div class="cert-item" style="border-color: ${badge.color}">
                  <span style="font-size: 2rem;">${badge.icon}</span>
                  <h4>${cert}</h4>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}
      
      ${partner.location.latitude && partner.location.longitude ? `
        <section class="location-section">
          <h3>Standort</h3>
          <div class="map-container" data-lat="${partner.location.latitude}" data-lng="${partner.location.longitude}">
            <p>Karte wird geladen...</p>
          </div>
        </section>
      ` : ''}
      
      <section class="contact-section">
        <h3>Kontaktieren Sie uns</h3>
        <p>Bereit für Ihr Odoo Projekt? Nehmen Sie Kontakt mit uns auf!</p>
        
        <div class="contact-info">
          ${partner.contact_info.email ? `
            <a href="mailto:${partner.contact_info.email}" class="contact-button">
              E-Mail senden
            </a>
          ` : ''}
          
          ${partner.contact_info.phone ? `
            <a href="tel:${partner.contact_info.phone}" class="contact-button">
              ${partner.contact_info.phone}
            </a>
          ` : ''}
          
          ${partner.website ? `
            <a href="${partner.website}" target="_blank" rel="noopener" class="contact-button">
              Website besuchen
            </a>
          ` : ''}
        </div>
      </section>
    </div>
    
    <script type="application/ld+json">
      ${JSON.stringify(structuredData, null, 2)}
    </script>
  `;
  
  return { content, metaTags };
}

// Helper function to group array by key
function groupBy(array, keyFn) {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}

// Main partner generation function
export async function generatePartners() {
  console.log('🚀 Starting partner generation...\n');
  
  try {
    // Load data
    const partners = loadPartnerData();
    
    // Generate partner styles
    generatePartnerStyles();
    
    // Generate partner directory
    generatePartnerDirectory(partners);
    
    // Generate individual partner pages
    console.log('🏢 Generating partner profiles...');
    let generatedCount = 0;
    
    partners.forEach(partner => {
      const partnerSlugDir = path.join(partnerDir, partner.slug);
      if (!fs.existsSync(partnerSlugDir)) {
        fs.mkdirSync(partnerSlugDir, { recursive: true });
      }
      
      const { content, metaTags } = generatePartnerProfile(partner);
      
      const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${partner.company_name} - Odoo Partner - ${siteConfig.siteName}</title>
    <meta name="description" content="${partner.description || `${partner.company_name} - Zertifizierter Odoo Partner in ${partner.location.city}. ${partner.services.slice(0, 3).join(', ')}.`}">
    <!-- CSS Files in correct order -->
    <link rel="stylesheet" href="/css/base.css">
    <link rel="stylesheet" href="/css/components.css">
    <link rel="stylesheet" href="/css/animations.css">
    <link rel="stylesheet" href="/css/partner-search.css">
    <link rel="stylesheet" href="/css/author-bio.css">
    <link rel="stylesheet" href="/css/responsive.css">
    ${metaTags}
</head>
<body>
    <header class="site-header">
        <div class="container">
            <h1><a href="/">${siteConfig.siteName}</a></h1>
            <nav>
                <a href="/">Home</a>
                <a href="/blog/">Blog</a>
                <a href="/partner/">Partner</a>
            </nav>
        </div>
    </header>
    
    <main>
        ${content}
    </main>
    
    <footer class="site-footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${siteConfig.siteName}. Alle Rechte vorbehalten.</p>
            <nav>
                <a href="/impressum/">Impressum</a>
                <a href="/datenschutz/">Datenschutz</a>
            </nav>
        </div>
    </footer>
    
    <!-- JavaScript Files -->
    <script src="/js/main.js" defer></script>
    <script src="/js/partner-search.js" defer></script>
    <script src="/js/animations.js" defer></script>
    <script src="/js/filter-manager.js" defer></script>
    <script src="/js/location-search.js" defer></script>
</body>
</html>`;
      
      fs.writeFileSync(path.join(partnerSlugDir, 'index.html'), html);
      generatedCount++;
    });
    
    console.log(`✅ Generated ${generatedCount} partner profiles`);
    
    // Generate partner sitemap
    generatePartnerSitemap(partners);
    
    console.log('\n✨ Partner generation complete!');
    return true;
  } catch (error) {
    console.error('\n❌ Partner generation error:', error.message);
    return false;
  }
}

// Generate partner-specific sitemap
function generatePartnerSitemap(partners) {
  console.log('🗺️ Generating partner sitemap...');
  
  const urls = partners.map(partner => ({
    loc: `/partner/${partner.slug}/`,
    lastmod: partner.updated_at || partner.created_at,
    priority: partner.subscription_tier === 'enterprise' ? 0.8 : 
              partner.subscription_tier === 'premium' ? 0.7 : 0.6
  }));
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteConfig.siteUrl}/partner/</loc>
    <priority>0.9</priority>
  </url>
${urls.map(url => `
  <url>
    <loc>${siteConfig.siteUrl}${url.loc}</loc>
    <lastmod>${new Date(url.lastmod).toISOString().split('T')[0]}</lastmod>
    <priority>${url.priority}</priority>
  </url>
`).join('')}
</urlset>`;
  
  fs.writeFileSync(path.join(partnerDir, 'sitemap.xml'), sitemap);
  console.log('✅ Partner sitemap generated');
}

// Run generation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePartners();
}