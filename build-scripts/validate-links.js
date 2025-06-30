#!/usr/bin/env node

/**
 * Link validation script for German Odoo Directory
 * Checks all internal and external links in the built site
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const distPath = path.join(projectRoot, 'dist');

class LinkValidator {
  constructor() {
    this.internalLinks = new Set();
    this.externalLinks = new Set();
    this.brokenLinks = [];
    this.filesChecked = 0;
    this.totalLinks = 0;
  }

  async validateDirectory(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await this.validateDirectory(fullPath);
      } else if (entry.name.endsWith('.html')) {
        await this.validateFile(fullPath);
      }
    }
  }

  async validateFile(filePath) {
    this.filesChecked++;
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(distPath, filePath);
    
    console.log(`📄 Checking: ${relativePath}`);
    
    // Extract all links
    const linkPatterns = [
      /<a[^>]+href=["']([^"']+)["'][^>]*>/g,
      /<link[^>]+href=["']([^"']+)["'][^>]*>/g,
      /<script[^>]+src=["']([^"']+)["'][^>]*>/g,
      /<img[^>]+src=["']([^"']+)["'][^>]*>/g
    ];
    
    for (const pattern of linkPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const link = match[1];
        this.totalLinks++;
        
        if (this.isExternalLink(link)) {
          this.validateExternalLink(link, relativePath, content);
        } else {
          await this.validateInternalLink(link, filePath, relativePath);
        }
      }
    }
    
    // Check for proper link classes
    this.checkLinkClasses(content, relativePath);
  }

  isExternalLink(link) {
    return link.startsWith('http://') || 
           link.startsWith('https://') || 
           link.startsWith('//');
  }

  validateExternalLink(link, file, content) {
    this.externalLinks.add(link);
    
    // Check if external link has proper attributes
    const linkRegex = new RegExp(`<a[^>]*href=["']${link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'g');
    const linkMatch = content.match(linkRegex);
    
    if (linkMatch) {
      const linkTag = linkMatch[0];
      
      // Check for target="_blank"
      if (linkTag.includes('target="_blank"')) {
        // Check for rel="noopener noreferrer"
        if (!linkTag.includes('rel=') || 
            (!linkTag.includes('noopener') && !linkTag.includes('noreferrer'))) {
          this.brokenLinks.push({
            file,
            link,
            issue: 'External link with target="_blank" missing rel="noopener noreferrer"'
          });
        }
      }
      
      // Check for proper class
      if (!linkTag.includes('od-external-link')) {
        this.brokenLinks.push({
          file,
          link,
          issue: 'External link missing "od-external-link" class'
        });
      }
    }
  }

  async validateInternalLink(link, filePath, relativeFilePath) {
    // Skip anchors and special links
    if (link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) {
      return;
    }
    
    this.internalLinks.add(link);
    
    // Resolve the link path
    let targetPath;
    
    if (link.startsWith('/')) {
      // Absolute path
      targetPath = path.join(distPath, link);
    } else {
      // Relative path
      targetPath = path.join(path.dirname(filePath), link);
    }
    
    // Handle directory links (add index.html)
    if (!path.extname(targetPath)) {
      targetPath = path.join(targetPath, 'index.html');
    }
    
    // Check if file exists
    try {
      await fs.access(targetPath);
    } catch {
      this.brokenLinks.push({
        file: relativeFilePath,
        link,
        issue: 'Internal link target not found'
      });
    }
  }

  checkLinkClasses(content, file) {
    // Check internal links have proper class
    const internalLinkPattern = /<a[^>]+href=["'](?!http|\/\/|#|mailto:|tel:)([^"']+)["'][^>]*>/g;
    let match;
    
    while ((match = internalLinkPattern.exec(content)) !== null) {
      const linkTag = match[0];
      if (!linkTag.includes('od-internal-link')) {
        this.brokenLinks.push({
          file,
          link: match[1],
          issue: 'Internal link missing "od-internal-link" class'
        });
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Link Validation Report');
    console.log('='.repeat(60));
    
    console.log(`\n📁 Files checked: ${this.filesChecked}`);
    console.log(`🔗 Total links found: ${this.totalLinks}`);
    console.log(`  - Internal links: ${this.internalLinks.size}`);
    console.log(`  - External links: ${this.externalLinks.size}`);
    
    if (this.brokenLinks.length > 0) {
      console.log(`\n❌ Issues found: ${this.brokenLinks.length}`);
      console.log('\nDetailed Issues:');
      console.log('-'.repeat(60));
      
      // Group by file
      const issuesByFile = {};
      for (const issue of this.brokenLinks) {
        if (!issuesByFile[issue.file]) {
          issuesByFile[issue.file] = [];
        }
        issuesByFile[issue.file].push(issue);
      }
      
      for (const [file, issues] of Object.entries(issuesByFile)) {
        console.log(`\n📄 ${file}:`);
        for (const issue of issues) {
          console.log(`   ⚠️  ${issue.link}`);
          console.log(`      ${issue.issue}`);
        }
      }
    } else {
      console.log('\n✅ All links validated successfully!');
    }
    
    // List external domains
    if (this.externalLinks.size > 0) {
      console.log('\n🌐 External domains referenced:');
      const domains = new Set();
      for (const link of this.externalLinks) {
        try {
          const url = new URL(link);
          domains.add(url.hostname);
        } catch {
          // Invalid URL
        }
      }
      
      for (const domain of Array.from(domains).sort()) {
        console.log(`   - ${domain}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    return this.brokenLinks.length === 0;
  }
}

// Main execution
async function main() {
  console.log('🔍 Starting link validation for German Odoo Directory\n');
  
  // Check if dist directory exists
  try {
    await fs.access(distPath);
  } catch {
    console.error('❌ Error: dist directory not found. Please run the build first.');
    process.exit(1);
  }
  
  const validator = new LinkValidator();
  
  try {
    await validator.validateDirectory(distPath);
    const success = validator.generateReport();
    
    if (!success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    process.exit(1);
  }
}

// Run the validator
main().catch(console.error);