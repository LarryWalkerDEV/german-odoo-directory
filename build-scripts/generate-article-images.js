import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../config/supabase-config.js';
import fetch from 'node-fetch';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const BATCH_SIZE = 10; // Process 10 images per batch to manage API costs
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds delay between batches
const MAX_RETRIES = 3;
const IMAGE_SIZES = {
  hero: { width: 1200, height: 600 },
  thumbnail: { width: 400, height: 300 },
  social: { width: 1200, height: 630 } // For Open Graph
};

// Ensure image directories exist
const imageBaseDir = path.join(rootDir, 'dist', 'assets', 'images', 'blog', 'articles');
const cacheDir = path.join(rootDir, '.image-cache');
[imageBaseDir, cacheDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Load existing cache
function loadImageCache() {
  const cacheFile = path.join(cacheDir, 'generated-images.json');
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
  return {};
}

// Save cache
function saveImageCache(cache) {
  const cacheFile = path.join(cacheDir, 'generated-images.json');
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

// Get OpenAI API key from Supabase edge secrets
async function getOpenAIKey() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available. Please set SUPABASE_SERVICE_KEY.');
  }

  try {
    // In production, this would fetch from edge secrets
    // For now, we'll use environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      console.log('📝 Please set OPENAI_API_KEY in your .env file');
      throw new Error('OpenAI API key not configured');
    }
    return apiKey;
  } catch (error) {
    console.error('Error fetching OpenAI API key:', error);
    throw error;
  }
}

// Extract keywords from slug
function extractKeywordsFromSlug(slug) {
  return slug
    .split('-')
    .filter(word => word.length > 2) // Filter out small words
    .map(word => word.toLowerCase());
}

// Generate image prompt based on article data
function generateImagePrompt(article) {
  const keywords = extractKeywordsFromSlug(article.slug);
  const isOdoo19 = keywords.includes('odoo') && keywords.includes('19');
  const isDsgvo = keywords.includes('dsgvo') || keywords.includes('gdpr');
  const isAI = keywords.includes('ai') || keywords.includes('ki');
  
  // Base prompt for professional business imagery
  let prompt = "Professional business photograph, modern German office environment, ";
  
  // Add specific elements based on keywords
  if (isOdoo19) {
    prompt += "futuristic dashboard on computer screen showing ERP software, ";
  } else if (isDsgvo) {
    prompt += "data security visualization, lock icons, shield symbols, ";
  } else if (isAI) {
    prompt += "artificial intelligence visualization, neural networks, digital transformation, ";
  } else if (keywords.includes('roi') || keywords.includes('calculator')) {
    prompt += "financial charts and graphs, calculator, business analytics, ";
  } else if (keywords.includes('hosting')) {
    prompt += "server room, cloud computing visualization, network infrastructure, ";
  } else if (keywords.includes('migration')) {
    prompt += "data transfer visualization, arrows showing progression, ";
  } else {
    prompt += "business professionals in meeting, laptop with charts, ";
  }
  
  // Add consistent style elements
  prompt += "clean minimalist aesthetic, blue and purple color scheme (#714B67 and #875A4C accents), ";
  prompt += "high quality photography, professional lighting, shallow depth of field, ";
  prompt += "corporate environment, no text or logos";
  
  return prompt;
}

// Generate image using DALL-E 3
async function generateImage(prompt, apiKey, retries = 0) {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1792x1024", // DALL-E 3 supports this size
        quality: "standard", // Use "standard" to save costs, "hd" for higher quality
        style: "natural" // More photographic style
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`⚠️ Retry ${retries + 1}/${MAX_RETRIES} for image generation...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1)));
      return generateImage(prompt, apiKey, retries + 1);
    }
    throw error;
  }
}

// Download and process image
async function downloadAndProcessImage(imageUrl, slug) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
    
    const buffer = await response.buffer();
    const baseImage = sharp(buffer);
    
    // Create article-specific directory
    const articleDir = path.join(imageBaseDir, slug);
    if (!fs.existsSync(articleDir)) {
      fs.mkdirSync(articleDir, { recursive: true });
    }
    
    // Generate different sizes
    const processPromises = Object.entries(IMAGE_SIZES).map(async ([sizeName, dimensions]) => {
      const outputPath = path.join(articleDir, `${slug}-${sizeName}.jpg`);
      
      await baseImage
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toFile(outputPath);
      
      console.log(`  ✅ Created ${sizeName} image: ${outputPath}`);
      return { [sizeName]: outputPath };
    });
    
    const results = await Promise.all(processPromises);
    return Object.assign({}, ...results);
  } catch (error) {
    console.error(`Error processing image for ${slug}:`, error);
    throw error;
  }
}

// Process a batch of articles
async function processBatch(articles, apiKey, cache) {
  const results = [];
  
  for (const article of articles) {
    // Skip if already cached
    if (cache[article.slug] && cache[article.slug].generated) {
      console.log(`⏭️  Skipping ${article.slug} (already generated)`);
      results.push({ slug: article.slug, status: 'cached' });
      continue;
    }
    
    try {
      console.log(`\n🎨 Generating image for: ${article.title}`);
      console.log(`  Slug: ${article.slug}`);
      
      // Generate prompt
      const prompt = generateImagePrompt(article);
      console.log(`  Prompt: ${prompt.substring(0, 100)}...`);
      
      // Generate image
      const imageUrl = await generateImage(prompt, apiKey);
      console.log(`  ✅ Image generated successfully`);
      
      // Download and process
      const imagePaths = await downloadAndProcessImage(imageUrl, article.slug);
      
      // Update cache
      cache[article.slug] = {
        generated: true,
        timestamp: new Date().toISOString(),
        prompt: prompt,
        paths: imagePaths
      };
      
      // Save cache after each successful generation
      saveImageCache(cache);
      
      results.push({
        slug: article.slug,
        status: 'success',
        paths: imagePaths
      });
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error generating image for ${article.slug}:`, error.message);
      results.push({
        slug: article.slug,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}

// Main function
async function generateArticleImages() {
  console.log('🚀 Starting batch image generation for blog articles\n');
  
  try {
    // Load articles
    const articlesPath = path.join(rootDir, 'dist', 'data', 'blog-articles.json');
    const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    console.log(`📚 Found ${articles.length} articles\n`);
    
    // Get API key
    const apiKey = await getOpenAIKey();
    console.log('🔑 OpenAI API key loaded\n');
    
    // Load cache
    const cache = loadImageCache();
    const cachedCount = Object.keys(cache).filter(slug => cache[slug].generated).length;
    console.log(`💾 Cache loaded: ${cachedCount} images already generated\n`);
    
    // Filter articles that need images
    const articlesNeedingImages = articles.filter(article => 
      !cache[article.slug] || !cache[article.slug].generated
    );
    
    if (articlesNeedingImages.length === 0) {
      console.log('✨ All articles already have images generated!');
      return;
    }
    
    console.log(`📸 Need to generate images for ${articlesNeedingImages.length} articles\n`);
    
    // Process in batches
    const batches = [];
    for (let i = 0; i < articlesNeedingImages.length; i += BATCH_SIZE) {
      batches.push(articlesNeedingImages.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`📦 Processing in ${batches.length} batches of up to ${BATCH_SIZE} images each\n`);
    
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < batches.length; i++) {
      console.log(`\n═══════════════════════════════════════`);
      console.log(`📦 Processing batch ${i + 1}/${batches.length}`);
      console.log(`═══════════════════════════════════════`);
      
      const batchResults = await processBatch(batches[i], apiKey, cache);
      
      // Count results
      const successCount = batchResults.filter(r => r.status === 'success').length;
      const errorCount = batchResults.filter(r => r.status === 'error').length;
      const cachedCount = batchResults.filter(r => r.status === 'cached').length;
      
      totalProcessed += batchResults.length;
      totalSuccess += successCount;
      totalErrors += errorCount;
      
      console.log(`\n📊 Batch ${i + 1} complete:`);
      console.log(`  ✅ Success: ${successCount}`);
      console.log(`  ⏭️  Cached: ${cachedCount}`);
      console.log(`  ❌ Errors: ${errorCount}`);
      
      // Delay between batches (except for last batch)
      if (i < batches.length - 1) {
        console.log(`\n⏸️  Waiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    // Final summary
    console.log(`\n═══════════════════════════════════════`);
    console.log(`✨ Image generation complete!`);
    console.log(`═══════════════════════════════════════`);
    console.log(`📊 Final Statistics:`);
    console.log(`  Total articles: ${articles.length}`);
    console.log(`  Already cached: ${articles.length - articlesNeedingImages.length}`);
    console.log(`  Newly generated: ${totalSuccess}`);
    console.log(`  Errors: ${totalErrors}`);
    console.log(`  Total images: ${Object.keys(cache).filter(slug => cache[slug].generated).length}`);
    
    // Generate cost estimate
    const estimatedCost = totalSuccess * 0.04; // DALL-E 3 standard quality pricing
    console.log(`\n💰 Estimated API cost: $${estimatedCost.toFixed(2)}`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Export for use in build process
export { generateArticleImages, extractKeywordsFromSlug };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateArticleImages();
}