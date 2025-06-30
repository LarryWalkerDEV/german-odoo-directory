import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'dist', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Fetch all blog articles
async function fetchBlogArticles() {
  console.log('📄 Fetching blog articles...');
  
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process articles to handle JSONB data
    const processedArticles = data.map(article => {
      // Extract data from JSONB columns
      const articleData = article.article_data || {};
      const seoData = article.seo_data || {};
      const personaData = article.persona_data || {};
      
      // Create URL-friendly slug from article title
      const title = articleData.title || 'Untitled Article';
      const slug = articleData.slug || createSlug(title);
      
      return {
        id: article.id,
        title: title,
        slug: slug,
        content: articleData.content || '',
        excerpt: articleData.excerpt || '',
        author: personaData,
        tags: articleData.tags || [],
        category: articleData.category || 'General',
        // Meta and SEO data
        meta_description: seoData.meta_description || '',
        keywords: seoData.keywords || [],
        faq_section: seoData.faq_section || [],
        // Article data structure
        article_data: articleData,
        seo_data: seoData,
        persona_data: personaData,
        // Dates
        published_at: article.created_at,
        updated_at: article.updated_at,
        status: article.status
      };
    });
    
    // Save to JSON file
    const filePath = path.join(dataDir, 'blog-articles.json');
    fs.writeFileSync(filePath, JSON.stringify(processedArticles, null, 2));
    console.log(`✅ Saved ${processedArticles.length} blog articles`);
    
    return processedArticles;
  } catch (error) {
    console.error('❌ Error fetching blog articles:', error.message);
    return [];
  }
}

// Fetch all partners
async function fetchPartners() {
  console.log('🏢 Fetching partners...');
  
  try {
    const { data, error } = await supabase
      .from('partner_directory')
      .select('*')
      .eq('status', 'active')
      .order('subscription_tier', { ascending: false })
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Process partners to handle JSONB data
    const processedPartners = data.map(partner => {
      // Extract data from JSONB columns
      const partnerData = partner.partner_data || {};
      const locationData = partner.location_data || {};
      const businessData = partner.business_data || {};
      const contentData = partner.content_data || {};
      
      const companyName = partnerData.company_name || 'Unknown Company';
      const slug = partnerData.slug || createSlug(companyName);
      
      return {
        id: partner.id,
        company_name: companyName,
        slug: slug,
        description: contentData.description || '',
        logo_url: partnerData.logo_url || '',
        website: partnerData.website || '',
        email: partnerData.contact_email || '',
        phone: partnerData.contact_phone || '',
        // Location data
        location: {
          city: locationData.city || '',
          state: locationData.state || '',
          country: locationData.country || 'Deutschland',
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address || ''
        },
        // Business data
        services: businessData.services || [],
        industries: businessData.industries || [],
        certifications: businessData.certifications || [],
        employees: businessData.employee_count || '',
        founded: businessData.founded_year || '',
        // Subscription data
        subscription_tier: partner.subscription_tier,
        is_featured: partner.is_featured,
        // Full JSONB data
        partner_data: partnerData,
        location_data: locationData,
        business_data: businessData,
        content_data: contentData,
        // Dates
        created_at: partner.created_at,
        updated_at: partner.updated_at,
        status: partner.status
      };
    });
    
    // Save to JSON file
    const filePath = path.join(dataDir, 'partners.json');
    fs.writeFileSync(filePath, JSON.stringify(processedPartners, null, 2));
    console.log(`✅ Saved ${processedPartners.length} partners`);
    
    return processedPartners;
  } catch (error) {
    console.error('❌ Error fetching partners:', error.message);
    return [];
  }
}

// Fetch all author personas
async function fetchAuthorPersonas() {
  console.log('👤 Fetching author personas...');
  
  try {
    const { data, error } = await supabase
      .from('author_personas')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Process author personas
    const processedAuthors = data.map(author => ({
      ...author,
      // Ensure arrays are properly parsed
      expertise: Array.isArray(author.expertise) ? author.expertise : [],
      // Parse JSONB fields
      social_links: author.social_links || {},
      // Format dates
      created_at: author.created_at ? new Date(author.created_at).toISOString() : null,
      updated_at: author.updated_at ? new Date(author.updated_at).toISOString() : null
    }));
    
    // Save to JSON file
    const filePath = path.join(dataDir, 'author-personas.json');
    fs.writeFileSync(filePath, JSON.stringify(processedAuthors, null, 2));
    console.log(`✅ Saved ${processedAuthors.length} author personas`);
    
    return processedAuthors;
  } catch (error) {
    console.error('❌ Error fetching author personas:', error.message);
    return [];
  }
}

// Helper function to create URL-friendly slugs
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Main fetch function
export async function fetchAllData() {
  console.log('🚀 Starting data fetch...\n');
  
  const startTime = Date.now();
  const results = {
    articles: [],
    partners: [],
    authors: [],
    errors: []
  };
  
  try {
    // Fetch all data types
    results.articles = await fetchBlogArticles();
    results.partners = await fetchPartners();
    results.authors = await fetchAuthorPersonas();
    
    // Create summary file
    const summary = {
      fetchedAt: new Date().toISOString(),
      counts: {
        articles: results.articles.length,
        partners: results.partners.length,
        authors: results.authors.length
      },
      duration: Date.now() - startTime
    };
    
    const summaryPath = path.join(dataDir, 'fetch-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n📊 Fetch Summary:');
    console.log(`   Articles: ${summary.counts.articles}`);
    console.log(`   Partners: ${summary.counts.partners}`);
    console.log(`   Authors: ${summary.counts.authors}`);
    console.log(`   Duration: ${summary.duration}ms`);
    console.log('\n✨ Data fetch complete!');
    
    return results;
  } catch (error) {
    console.error('\n❌ Fatal error during data fetch:', error.message);
    results.errors.push(error.message);
    return results;
  }
}

// Run fetch if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAllData();
}