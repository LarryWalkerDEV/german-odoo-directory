#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyPlaceholderImages() {
  console.log('📸 Setting up placeholder images for all blog articles...\n');
  
  try {
    // Load blog articles data
    const articlesPath = path.join(__dirname, '..', 'dist', 'data', 'blog-articles.json');
    const articlesData = await fs.readFile(articlesPath, 'utf-8');
    const articles = JSON.parse(articlesData);
    
    // Create articles directory
    const articlesImgDir = path.join(__dirname, '..', 'dist', 'assets', 'images', 'blog', 'articles');
    await fs.mkdir(articlesImgDir, { recursive: true });
    
    // Source placeholder image
    const placeholderSrc = path.join(__dirname, '..', 'dist', 'assets', 'images', 'blog', 'default-hero.jpg');
    
    // Copy placeholder for each article
    let copied = 0;
    for (const article of articles) {
      if (article.slug) {
        const articleDir = path.join(articlesImgDir, article.slug);
        await fs.mkdir(articleDir, { recursive: true });
        
        const destPath = path.join(articleDir, 'hero.jpg');
        try {
          await fs.copyFile(placeholderSrc, destPath);
          copied++;
        } catch (err) {
          console.error(`Failed to copy image for ${article.slug}:`, err.message);
        }
      }
    }
    
    console.log(`✅ Created placeholder images for ${copied} articles`);
    console.log('📁 Images directory: dist/assets/images/blog/articles/\n');
    
  } catch (error) {
    console.error('❌ Error setting up placeholder images:', error);
    process.exit(1);
  }
}

// Run the script
copyPlaceholderImages();