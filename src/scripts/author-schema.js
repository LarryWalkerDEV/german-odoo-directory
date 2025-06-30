// Author Schema Markup Generator
// Creates structured data for author profiles following Schema.org standards

class AuthorSchema {
  constructor() {
    this.schemaTypes = {
      person: 'https://schema.org/Person',
      organization: 'https://schema.org/Organization',
      professionalService: 'https://schema.org/ProfessionalService'
    };
  }

  generatePersonSchema(authorData) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `https://odoo-verzeichnis.de/author/${authorData.id}`,
      "name": authorData.name,
      "givenName": this.extractGivenName(authorData.name),
      "familyName": this.extractFamilyName(authorData.name),
      "honorificPrefix": this.extractTitle(authorData.name),
      "jobTitle": authorData.title,
      "description": authorData.bio,
      "image": {
        "@type": "ImageObject",
        "url": `https://odoo-verzeichnis.de${authorData.headshot_url}`,
        "width": 400,
        "height": 400
      },
      "worksFor": this.generateOrganizationSchema(authorData),
      "alumniOf": this.generateEducationSchema(authorData.education),
      "knowsAbout": authorData.expertise,
      "knowsLanguage": this.generateLanguageSchema(authorData.languages),
      "hasCredential": this.generateCredentialSchema(authorData.certifications),
      "sameAs": this.generateSameAsLinks(authorData.social_profiles),
      "contactPoint": this.generateContactSchema(authorData.social_profiles),
      "award": this.generateAwardsSchema(authorData),
      "memberOf": this.generateMembershipSchema(authorData),
      "performerIn": this.generateSpeakingSchema(authorData.speaking_engagements),
      "author": this.generatePublicationSchema(authorData.publications),
      "aggregateRating": this.generateRatingSchema(authorData),
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "DE",
        "addressRegion": authorData.region || "Bayern"
      }
    };

    // Add professional qualifications
    if (authorData.experience_years) {
      schema["yearsInBusiness"] = authorData.experience_years;
    }

    if (authorData.projects_completed) {
      schema["numberOfEmployees"] = {
        "@type": "QuantitativeValue",
        "value": authorData.projects_completed,
        "unitText": "completed projects"
      };
    }

    return this.cleanSchema(schema);
  }

  generateOrganizationSchema(authorData) {
    return {
      "@type": "Organization",
      "@id": `https://odoo-verzeichnis.de/company/${this.slugify(authorData.company)}`,
      "name": authorData.company,
      "url": authorData.company_url || `https://odoo-verzeichnis.de/company/${this.slugify(authorData.company)}`,
      "logo": authorData.company_logo || null,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "DE"
      },
      "vatID": authorData.ust_id ? `DE${authorData.ust_id}` : null,
      "leiCode": authorData.handelsregister || null,
      "foundingDate": authorData.company_founded || null,
      "numberOfEmployees": authorData.team_size || null,
      "slogan": authorData.company_slogan || null,
      "areaServed": {
        "@type": "Country",
        "name": "Deutschland"
      }
    };
  }

  generateEducationSchema(education) {
    if (!education || education.length === 0) return null;

    return education.map(edu => ({
      "@type": "EducationalOrganization",
      "name": edu.university,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "DE"
      }
    }));
  }

  generateLanguageSchema(languages) {
    if (!languages || languages.length === 0) return null;

    const languageMap = {
      'Deutsch': 'de-DE',
      'Englisch': 'en-US',
      'Französisch': 'fr-FR',
      'Spanisch': 'es-ES',
      'Italienisch': 'it-IT'
    };

    return languages.map(lang => ({
      "@type": "Language",
      "name": lang,
      "alternateName": languageMap[lang] || lang
    }));
  }

  generateCredentialSchema(certifications) {
    if (!certifications || certifications.length === 0) return null;

    return certifications.map(cert => ({
      "@type": "EducationalOccupationalCredential",
      "name": cert.name,
      "credentialCategory": this.categorizeCredential(cert.name),
      "recognizedBy": {
        "@type": "Organization",
        "name": cert.issued_by
      },
      "dateCreated": cert.year ? `${cert.year}-01-01` : null,
      "expires": cert.valid_until || null,
      "educationalLevel": this.determineEducationalLevel(cert.name),
      "competencyRequired": cert.competencies || null,
      "url": cert.verification_url || null
    }));
  }

  generateSameAsLinks(socialProfiles) {
    const links = [];
    
    if (socialProfiles.linkedin) {
      links.push(socialProfiles.linkedin);
    }
    if (socialProfiles.xing) {
      links.push(socialProfiles.xing);
    }
    if (socialProfiles.twitter) {
      links.push(socialProfiles.twitter);
    }
    if (socialProfiles.github) {
      links.push(socialProfiles.github);
    }
    
    return links.length > 0 ? links : null;
  }

  generateContactSchema(socialProfiles) {
    const contactPoints = [];

    if (socialProfiles.email) {
      contactPoints.push({
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": socialProfiles.email,
        "availableLanguage": ["German", "English"],
        "areaServed": "DE"
      });
    }

    if (socialProfiles.phone) {
      contactPoints.push({
        "@type": "ContactPoint",
        "contactType": "sales",
        "telephone": socialProfiles.phone,
        "availableLanguage": ["German", "English"],
        "areaServed": "DE",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      });
    }

    return contactPoints.length > 0 ? contactPoints : null;
  }

  generateAwardsSchema(authorData) {
    if (!authorData.awards || authorData.awards.length === 0) return null;

    return authorData.awards.map(award => ({
      "@type": "Award",
      "name": award.name,
      "description": award.description,
      "dateReceived": award.year ? `${award.year}-01-01` : null,
      "recognizedBy": {
        "@type": "Organization",
        "name": award.issuer
      }
    }));
  }

  generateMembershipSchema(authorData) {
    const memberships = [];

    if (authorData.professional_associations) {
      authorData.professional_associations.forEach(assoc => {
        memberships.push({
          "@type": "Organization",
          "name": assoc.name,
          "url": assoc.url,
          "membershipNumber": assoc.member_number
        });
      });
    }

    // Add standard German memberships
    if (authorData.ihk_member) {
      memberships.push({
        "@type": "Organization",
        "name": "IHK München und Oberbayern",
        "url": "https://www.ihk-muenchen.de",
        "membershipNumber": authorData.ihk_member_number
      });
    }

    return memberships.length > 0 ? memberships : null;
  }

  generateSpeakingSchema(speakingEngagements) {
    if (!speakingEngagements || speakingEngagements === 0) return null;

    return {
      "@type": "QuantitativeValue",
      "value": speakingEngagements,
      "unitText": "speaking engagements"
    };
  }

  generatePublicationSchema(publications) {
    if (!publications || publications === 0) return null;

    return {
      "@type": "QuantitativeValue",
      "value": publications,
      "unitText": "publications"
    };
  }

  generateRatingSchema(authorData) {
    if (!authorData.client_satisfaction) return null;

    return {
      "@type": "AggregateRating",
      "ratingValue": authorData.client_satisfaction,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": authorData.total_reviews || 50,
      "reviewCount": authorData.total_reviews || 50
    };
  }

  // Helper methods
  extractGivenName(fullName) {
    const parts = fullName.replace(/^(Dr\.|Prof\.|Dipl\.-Ing\.|Mag\.)\s+/, '').split(' ');
    return parts[0];
  }

  extractFamilyName(fullName) {
    const parts = fullName.replace(/^(Dr\.|Prof\.|Dipl\.-Ing\.|Mag\.)\s+/, '').split(' ');
    return parts[parts.length - 1];
  }

  extractTitle(fullName) {
    const match = fullName.match(/^(Dr\.|Prof\.|Dipl\.-Ing\.|Mag\.)/);
    return match ? match[1] : null;
  }

  categorizeCredential(credentialName) {
    if (credentialName.includes('TÜV')) return 'Quality Certification';
    if (credentialName.includes('ISO')) return 'International Standard';
    if (credentialName.includes('DSGVO') || credentialName.includes('GDPR')) return 'Data Protection';
    if (credentialName.includes('Odoo')) return 'Software Certification';
    return 'Professional Certification';
  }

  determineEducationalLevel(credentialName) {
    if (credentialName.includes('Dr.') || credentialName.includes('PhD')) return 'Doctoral';
    if (credentialName.includes('Master') || credentialName.includes('Dipl')) return 'Master';
    if (credentialName.includes('Bachelor')) return 'Bachelor';
    return 'Professional';
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[äöüß]/g, char => ({ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss'}[char]))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  cleanSchema(schema) {
    // Remove null values and empty arrays
    Object.keys(schema).forEach(key => {
      if (schema[key] === null || schema[key] === undefined || 
          (Array.isArray(schema[key]) && schema[key].length === 0)) {
        delete schema[key];
      } else if (typeof schema[key] === 'object' && !Array.isArray(schema[key])) {
        schema[key] = this.cleanSchema(schema[key]);
        if (Object.keys(schema[key]).length === 0) {
          delete schema[key];
        }
      }
    });
    return schema;
  }

  // Inject schema into page
  injectSchema(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  // Generate and inject all schemas for a page
  generatePageSchemas(authorData) {
    // Person schema
    const personSchema = this.generatePersonSchema(authorData);
    this.injectSchema(personSchema);

    // BreadcrumbList schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://odoo-verzeichnis.de"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Experten",
          "item": "https://odoo-verzeichnis.de/experten"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": authorData.name,
          "item": `https://odoo-verzeichnis.de/author/${authorData.id}`
        }
      ]
    };
    this.injectSchema(breadcrumbSchema);

    // Professional Service schema for the company
    if (authorData.company) {
      const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": authorData.company,
        "employee": {
          "@id": `https://odoo-verzeichnis.de/author/${authorData.id}`
        },
        "serviceType": "ERP Consulting",
        "areaServed": {
          "@type": "Country",
          "name": "Deutschland"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Odoo Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Odoo Implementation",
                "description": "Complete Odoo ERP implementation"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Odoo Customization",
                "description": "Custom module development"
              }
            }
          ]
        }
      };
      this.injectSchema(serviceSchema);
    }
  }
}

// Export for use
window.AuthorSchema = AuthorSchema;