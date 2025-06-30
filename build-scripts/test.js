#!/usr/bin/env node

/**
 * Comprehensive test suite for German Odoo Directory
 * Tests all major components and validates build output
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 German Odoo Directory - Comprehensive Test Suite\n');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();

    for (const test of this.tests) {
      try {
        console.log(`\n📋 ${test.name}`);
        await test.fn();
        this.passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${test.name} - FAILED`);
        console.error(`   Error: ${error.message}`);
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '=' .repeat(60));
    console.log('📊 Test Summary:');
    console.log(`   Total Tests: ${this.tests.length}`);
    console.log(`   ✅ Passed: ${this.passed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log('=' .repeat(60));

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// Utility functions
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFile(filePath) {
  return await fs.readFile(filePath, 'utf-8');
}

async function getDirectoryFiles(dirPath) {
  try {
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

// Initialize test runner
const runner = new TestRunner();

// Test 1: Project Structure
runner.test('Project Structure Validation', async () => {
  const requiredDirs = [
    'src',
    'src/assets',
    'src/scripts',
    'src/styles',
    'src/templates',
    'src/templates/components',
    'src/templates/layouts',
    'src/templates/pages',
    'build-scripts',
    'config'
  ];

  for (const dir of requiredDirs) {
    const dirPath = path.join(projectRoot, dir);
    if (!await fileExists(dirPath)) {
      throw new Error(`Missing required directory: ${dir}`);
    }
  }
});

// Test 2: Required Files
runner.test('Required Files Check', async () => {
  const requiredFiles = [
    'package.json',
    'config/site-config.js',
    'config/supabase-config.js',
    'src/scripts/main.js',
    'src/scripts/article-processor.js',
    'src/scripts/partner-search.js',
    'src/scripts/seo-processor.js',
    'src/styles/base.css',
    'src/styles/components.css',
    'src/templates/layouts/base.html',
    'build-scripts/build.js'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(projectRoot, file);
    if (!await fileExists(filePath)) {
      throw new Error(`Missing required file: ${file}`);
    }
  }
});

// Test 3: Configuration Validation
runner.test('Configuration Files', async () => {
  // Check site config
  const siteConfigPath = path.join(projectRoot, 'config/site-config.js');
  const { siteConfig } = await import(siteConfigPath);
  
  if (!siteConfig.siteName) {
    throw new Error('Site configuration missing siteName');
  }
  
  if (!siteConfig.siteUrl) {
    throw new Error('Site configuration missing siteUrl');
  }

  // Check supabase config
  const supabaseConfigPath = path.join(projectRoot, 'config/supabase-config.js');
  const { supabase, testConnection } = await import(supabaseConfigPath);
  
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    throw new Error('Supabase connection test failed');
  }
});

// Test 4: Script Processors
runner.test('Script Processors', async () => {
  const { stdout, stderr } = await execAsync('npm run test:processors', { cwd: projectRoot });
  
  if (stderr && !stderr.includes('DeprecationWarning')) {
    throw new Error(`Processor tests failed: ${stderr}`);
  }
  
  if (!stdout.includes('All processors tested successfully')) {
    throw new Error('Processor tests did not complete successfully');
  }
});

// Test 5: Build Process
runner.test('Build Process', async () => {
  console.log('   Running build setup...');
  await execAsync('npm run setup', { cwd: projectRoot });
  
  const distPath = path.join(projectRoot, 'dist');
  if (!await fileExists(distPath)) {
    throw new Error('Build setup failed - dist directory not created');
  }
});

// Test 6: HTML Structure Validation
runner.test('HTML Structure Validation', async () => {
  const distPath = path.join(projectRoot, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (await fileExists(indexPath)) {
    const content = await readFile(indexPath);
    
    // Check for required meta tags
    if (!content.includes('<meta charset="UTF-8">')) {
      throw new Error('Missing UTF-8 charset meta tag');
    }
    
    if (!content.includes('<meta name="viewport"')) {
      throw new Error('Missing viewport meta tag');
    }
    
    // Check for SEO tags
    if (!content.includes('<meta name="description"')) {
      throw new Error('Missing meta description tag');
    }
    
    // Check for Open Graph tags
    if (!content.includes('property="og:')) {
      throw new Error('Missing Open Graph tags');
    }
    
    // Check for structured data
    if (!content.includes('application/ld+json')) {
      throw new Error('Missing structured data');
    }
  }
});

// Test 7: CSS Files
runner.test('CSS Files Validation', async () => {
  const cssFiles = [
    'dist/css/base.css'
  ];
  
  for (const cssFile of cssFiles) {
    const cssPath = path.join(projectRoot, cssFile);
    if (await fileExists(cssPath)) {
      const content = await readFile(cssPath);
      
      // Check for custom properties
      if (!content.includes('--od-')) {
        console.warn(`   Warning: ${cssFile} missing custom properties`);
      }
      
      // Check for responsive styles
      if (!content.includes('@media')) {
        console.warn(`   Warning: ${cssFile} missing media queries`);
      }
    }
  }
});

// Test 8: JavaScript Files
runner.test('JavaScript Files Validation', async () => {
  const jsFiles = await getDirectoryFiles(path.join(projectRoot, 'dist/js'));
  
  if (jsFiles.length === 0) {
    throw new Error('No JavaScript files found in dist/js');
  }
  
  // Check main.js
  const mainJsPath = path.join(projectRoot, 'dist/js/main.js');
  if (await fileExists(mainJsPath)) {
    const content = await readFile(mainJsPath);
    
    // Check for module initialization
    if (!content.includes('DOMContentLoaded') && !content.includes('load')) {
      console.warn('   Warning: main.js may not have proper initialization');
    }
  }
});

// Test 9: Image Assets
runner.test('Image Assets Check', async () => {
  const imgPath = path.join(projectRoot, 'dist/assets/img');
  if (await fileExists(imgPath)) {
    const images = await getDirectoryFiles(imgPath);
    
    // Check for logo
    const hasLogo = images.some(img => img.includes('logo'));
    if (!hasLogo) {
      console.warn('   Warning: No logo image found');
    }
    
    // Check for favicon
    const faviconPath = path.join(projectRoot, 'dist/favicon.ico');
    if (!await fileExists(faviconPath)) {
      console.warn('   Warning: No favicon.ico found');
    }
  }
});

// Test 10: Partner Directory
runner.test('Partner Directory Generation', async () => {
  const partnersPath = path.join(projectRoot, 'dist/partners');
  
  if (await fileExists(partnersPath)) {
    const partnerFiles = await getDirectoryFiles(partnersPath);
    
    if (partnerFiles.includes('index.html')) {
      const content = await readFile(path.join(partnersPath, 'index.html'));
      
      // Check for search functionality
      if (!content.includes('od-search') && !content.includes('partner-search')) {
        throw new Error('Partner directory missing search functionality');
      }
      
      // Check for filter options
      if (!content.includes('od-filter') && !content.includes('filter-option')) {
        console.warn('   Warning: Partner directory missing filter options');
      }
    }
  }
});

// Test 11: Blog Section
runner.test('Blog Section Generation', async () => {
  const blogPath = path.join(projectRoot, 'dist/blog');
  
  if (await fileExists(blogPath)) {
    const blogFiles = await getDirectoryFiles(blogPath);
    
    if (blogFiles.includes('index.html')) {
      const content = await readFile(path.join(blogPath, 'index.html'));
      
      // Check for article cards
      if (!content.includes('od-article-card') && !content.includes('blog-card')) {
        console.warn('   Warning: Blog listing missing article cards');
      }
      
      // Check for pagination
      if (!content.includes('pagination') && !content.includes('od-pagination')) {
        console.warn('   Warning: Blog listing missing pagination');
      }
    }
  }
});

// Test 12: Sitemap Generation
runner.test('Sitemap Validation', async () => {
  const sitemapPath = path.join(projectRoot, 'dist/sitemap.xml');
  
  if (await fileExists(sitemapPath)) {
    const content = await readFile(sitemapPath);
    
    // Check XML structure
    if (!content.includes('<?xml version="1.0"')) {
      throw new Error('Invalid sitemap XML structure');
    }
    
    if (!content.includes('<urlset')) {
      throw new Error('Sitemap missing urlset element');
    }
    
    // Check for URLs
    const urlCount = (content.match(/<url>/g) || []).length;
    if (urlCount === 0) {
      throw new Error('Sitemap contains no URLs');
    }
    
    console.log(`   Found ${urlCount} URLs in sitemap`);
  } else {
    console.warn('   Warning: No sitemap.xml found');
  }
});

// Test 13: Performance Check
runner.test('Performance Validation', async () => {
  const distPath = path.join(projectRoot, 'dist');
  
  // Check for minified files
  const cssFiles = await getDirectoryFiles(path.join(distPath, 'assets/css'));
  const jsFiles = await getDirectoryFiles(path.join(distPath, 'assets/js'));
  
  let minifiedCount = 0;
  
  for (const file of [...cssFiles, ...jsFiles]) {
    if (file.includes('.min.') || file.endsWith('.min.css') || file.endsWith('.min.js')) {
      minifiedCount++;
    }
  }
  
  if (minifiedCount === 0) {
    console.warn('   Warning: No minified assets found');
  } else {
    console.log(`   Found ${minifiedCount} minified assets`);
  }
});

// Test 14: Security Headers
runner.test('Security Configuration', async () => {
  // Check for security headers in HTML
  const indexPath = path.join(projectRoot, 'dist/index.html');
  
  if (await fileExists(indexPath)) {
    const content = await readFile(indexPath);
    
    // Check CSP
    if (!content.includes('Content-Security-Policy')) {
      console.warn('   Warning: Missing Content Security Policy meta tag');
    }
    
    // Check for external link security
    if (content.includes('target="_blank"') && !content.includes('rel="noopener')) {
      console.warn('   Warning: External links missing rel="noopener"');
    }
  }
});

// Test 15: Accessibility
runner.test('Accessibility Checks', async () => {
  const indexPath = path.join(projectRoot, 'dist/index.html');
  
  if (await fileExists(indexPath)) {
    const content = await readFile(indexPath);
    
    // Check for lang attribute
    if (!content.includes('lang="de"')) {
      throw new Error('Missing lang attribute on HTML element');
    }
    
    // Check for alt attributes on images
    const imgTags = content.match(/<img[^>]*>/g) || [];
    const missingAlt = imgTags.filter(tag => !tag.includes('alt=')).length;
    
    if (missingAlt > 0) {
      console.warn(`   Warning: ${missingAlt} images missing alt attributes`);
    }
    
    // Check for ARIA labels
    if (!content.includes('aria-')) {
      console.warn('   Warning: No ARIA attributes found');
    }
  }
});

// Run all tests
await runner.run();