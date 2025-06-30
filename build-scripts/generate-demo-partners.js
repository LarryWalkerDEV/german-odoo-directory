import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate demo partner data
const demoPartners = [
  {
    id: "1",
    company_name: "Digital Solutions GmbH",
    slug: "digital-solutions-gmbh",
    location: {
      city: "München",
      state: "Bayern",
      country: "Deutschland"
    },
    description: "Ihr führender Odoo Gold Partner in München. Über 15 Jahre Erfahrung in der Implementierung komplexer ERP-Lösungen für den deutschen Mittelstand.",
    services: ["erp_implementation", "customization", "migration", "support", "training"],
    industries: ["Fertigung", "Handel", "Dienstleistung"],
    certifications: ["Odoo Gold Partner", "ISO 27001", "DSGVO/GDPR Compliant"],
    years_in_business: 15,
    project_count: 250,
    subscription_tier: "enterprise",
    rating: 4.8,
    contact_info: {
      email: "info@digital-solutions.de",
      phone: "+49 89 123456"
    },
    website: "https://digital-solutions.de"
  },
  {
    id: "2",
    company_name: "ERP Experts Berlin",
    slug: "erp-experts-berlin",
    location: {
      city: "Berlin",
      state: "Berlin",
      country: "Deutschland"
    },
    description: "Spezialisiert auf Odoo-Migrationen und Cloud-Lösungen. Wir bringen Ihr Unternehmen sicher in die digitale Zukunft.",
    services: ["migration", "customization", "support", "consulting", "integration"],
    industries: ["E-Commerce", "Startup", "Technologie"],
    certifications: ["Odoo Silver Partner", "Microsoft Partner"],
    years_in_business: 8,
    project_count: 150,
    subscription_tier: "premium",
    rating: 4.7,
    contact_info: {
      email: "kontakt@erp-experts-berlin.de",
      phone: "+49 30 987654"
    },
    website: "https://erp-experts-berlin.de"
  },
  {
    id: "3",
    company_name: "Rhein IT Consulting",
    slug: "rhein-it-consulting",
    location: {
      city: "Düsseldorf",
      state: "Nordrhein-Westfalen",
      country: "Deutschland"
    },
    description: "Odoo-Experten für produzierende Unternehmen. Prozessoptimierung und Industrie 4.0 mit modernster ERP-Technologie.",
    services: ["erp_implementation", "support", "training", "development"],
    industries: ["Produktion", "Logistik", "Automotive"],
    certifications: ["Odoo Gold Partner", "DSGVO/GDPR Compliant"],
    years_in_business: 12,
    project_count: 180,
    subscription_tier: "enterprise",
    rating: 4.9,
    contact_info: {
      email: "info@rhein-it.de",
      phone: "+49 211 456789"
    },
    website: "https://rhein-it.de"
  },
  {
    id: "4",
    company_name: "Hamburg Digital Services",
    slug: "hamburg-digital-services",
    location: {
      city: "Hamburg",
      state: "Hamburg",
      country: "Deutschland"
    },
    description: "Maritime und Logistik-Expertise trifft auf modernste ERP-Lösungen. Ihr Partner für digitale Transformation im Norden.",
    services: ["consulting", "erp_implementation", "integration", "support"],
    industries: ["Logistik", "Handel", "Import/Export"],
    certifications: ["Odoo Silver Partner", "ISO 27001"],
    years_in_business: 10,
    project_count: 120,
    subscription_tier: "premium",
    rating: 4.6,
    contact_info: {
      email: "info@hh-digital.de",
      phone: "+49 40 321654"
    },
    website: "https://hh-digital.de"
  },
  {
    id: "5",
    company_name: "Frankfurt Business Solutions",
    slug: "frankfurt-business-solutions",
    location: {
      city: "Frankfurt am Main",
      state: "Hessen",
      country: "Deutschland"
    },
    description: "Finanzbranche und Compliance im Fokus. Odoo-Lösungen für regulierte Märkte mit höchsten Sicherheitsstandards.",
    services: ["customization", "consulting", "support", "training"],
    industries: ["Finanzdienstleistung", "Beratung", "Immobilien"],
    certifications: ["Odoo Gold Partner", "DSGVO/GDPR Compliant", "ISO 27001"],
    years_in_business: 18,
    project_count: 300,
    subscription_tier: "enterprise",
    rating: 4.9,
    contact_info: {
      email: "contact@fbs-frankfurt.de",
      phone: "+49 69 789012"
    },
    website: "https://fbs-frankfurt.de"
  },
  {
    id: "6",
    company_name: "Stuttgart Tech Partners",
    slug: "stuttgart-tech-partners",
    location: {
      city: "Stuttgart",
      state: "Baden-Württemberg",
      country: "Deutschland"
    },
    description: "Engineering Excellence meets ERP. Spezialisiert auf Automotive und Maschinenbau mit tiefem Branchen-Know-how.",
    services: ["erp_implementation", "development", "customization", "integration"],
    industries: ["Automotive", "Maschinenbau", "Engineering"],
    certifications: ["Odoo Silver Partner", "Microsoft Partner"],
    years_in_business: 7,
    project_count: 90,
    subscription_tier: "premium",
    rating: 4.7,
    contact_info: {
      email: "info@stp-stuttgart.de",
      phone: "+49 711 345678"
    },
    website: "https://stp-stuttgart.de"
  }
];

// Write demo partners to file
const outputPath = path.join(__dirname, '..', 'dist', 'data', 'partners.json');
fs.writeFileSync(outputPath, JSON.stringify(demoPartners, null, 2));

console.log(`✅ Generated ${demoPartners.length} demo partners`);
console.log(`📁 Saved to: ${outputPath}`);