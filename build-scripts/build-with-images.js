#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateArticleImages } from './generate-article-images.js';
import { fetchAuthorImages } from './fetch-author-images.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration for image generation
const IMAGE_GENERATION_CONFIG = {
  skipImageGeneration: process.env.SKIP_IMAGE_GENERATION === 'true',
  maxArticlesToProcess: process.env.MAX_ARTICLES_TO_PROCESS ? parseInt(process.env.MAX_ARTICLES_TO_PROCESS) : null,
  forceRegenerate: process.env.FORCE_REGENERATE === 'true'
};

// Check if we have necessary API keys
function checkAPIKeys() {
  if (!process.env.OPENAI_API_KEY && !IMAGE_GENERATION_CONFIG.skipImageGeneration) {
    console.log('⚠️  Warning: OPENAI_API_KEY not set. Image generation will be skipped.');
    console.log('   To enable image generation, add OPENAI_API_KEY to your .env file');
    console.log('   Or set SKIP_IMAGE_GENERATION=true to suppress this warning\n');
    return false;
  }
  return true;
}

// Main build process with image generation
async function buildWithImages() {
  console.log('🚀 Starting enhanced build process with image generation\n');
  
  try {
    // Step 1: Run the standard build to fetch data
    console.log('📦 Step 1: Running standard build process...');
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Standard build complete\n');
    
    // Step 2: Check if we should generate images
    const hasAPIKey = checkAPIKeys();
    
    if (!IMAGE_GENERATION_CONFIG.skipImageGeneration && hasAPIKey) {
      // Step 3: Generate article images
      console.log('🎨 Step 2: Generating unique images for articles...');
      console.log('   This may take a while and will incur OpenAI API costs');
      console.log('   Estimated cost: ~$5.16 for 129 articles\n');
      
      if (IMAGE_GENERATION_CONFIG.forceRegenerate) {
        console.log('⚠️  Force regenerate enabled - clearing image cache\n');
        const cacheFile = path.join(rootDir, '.image-cache', 'generated-images.json');
        if (fs.existsSync(cacheFile)) {
          fs.unlinkSync(cacheFile);
        }
      }
      
      await generateArticleImages();
      console.log('✅ Article image generation complete\n');
    } else {
      console.log('⏭️  Skipping article image generation\n');
    }
    
    // Step 4: Fetch author images from Supabase
    console.log('👤 Step 3: Fetching author images...');
    await fetchAuthorImages();
    console.log('✅ Author images fetched\n');
    
    // Step 5: Regenerate blog pages with images
    console.log('📄 Step 4: Regenerating blog pages with images...');
    execSync('node build-scripts/generate-blog.js', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Blog regeneration complete\n');
    
    // Step 6: Generate image sitemap
    console.log('🗺️  Step 5: Generating image sitemap...');
    generateImageSitemap();
    console.log('✅ Image sitemap generated\n');
    
    // Final summary
    console.log('✨ Build with images complete!');
    console.log('   - Blog articles have unique AI-generated images');
    console.log('   - Meta descriptions include URL keywords');
    console.log('   - Author images are loaded from Supabase');
    console.log('   - Image sitemap generated for SEO\n');
    
    // Cost reminder
    if (!IMAGE_GENERATION_CONFIG.skipImageGeneration && hasAPIKey) {
      const cacheFile = path.join(rootDir, '.image-cache', 'generated-images.json');
      if (fs.existsSync(cacheFile)) {
        const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        const generatedCount = Object.keys(cache).filter(k => cache[k].generated).length;
        const estimatedCost = generatedCount * 0.04;
        console.log(`💰 Estimated total API cost: $${estimatedCost.toFixed(2)} for ${generatedCount} images`);
      }
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Generate image sitemap for SEO
function generateImageSitemap() {
  const articles = JSON.parse(fs.readFileSync(path.join(rootDir, 'dist', 'data', 'blog-articles.json'), 'utf8'));
  const imageEntries = [];
  
  articles.forEach(article => {
    const imagePath = `/assets/images/blog/articles/${article.slug}/${article.slug}-hero.jpg`;
    const fullPath = path.join(rootDir, 'dist', imagePath.substring(1));
    
    if (fs.existsSync(fullPath)) {
      imageEntries.push(`
    <url>
      <loc>https://odoo-directory.de/blog/${article.slug}/</loc>
      <image:image>
        <image:loc>https://odoo-directory.de${imagePath}</image:loc>
        <image:title>${escapeXml(article.title)}</image:title>
        <image:caption>${escapeXml(article.excerpt || article.title)}</image:caption>
      </image:image>
    </url>`);
    }
  });
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageEntries.join('\n')}
</urlset>`;
  
  fs.writeFileSync(path.join(rootDir, 'dist', 'sitemap-images.xml'), sitemap);
}

function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Environment variable help
function showHelp() {
  console.log(`
Enhanced Build Script with Image Generation
==========================================

This script builds the site and generates unique AI images for each blog article.

Environment Variables:
  OPENAI_API_KEY         - Required for image generation (set in .env file)
  SKIP_IMAGE_GENERATION  - Set to 'true' to skip image generation
  MAX_ARTICLES_TO_PROCESS - Limit the number of articles to process (for testing)
  FORCE_REGENERATE       - Set to 'true' to regenerate all images (ignores cache)

Usage:
  npm run build:images              - Run full build with image generation
  SKIP_IMAGE_GENERATION=true npm run build:images - Skip image generation
  MAX_ARTICLES_TO_PROCESS=5 npm run build:images  - Process only 5 articles

Cost Estimate:
  Each image costs approximately $0.04 (DALL-E 3 standard quality)
  Full generation for 129 articles: ~$5.16
  `);
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the build
buildWithImages();