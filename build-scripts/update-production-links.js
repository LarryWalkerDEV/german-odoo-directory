#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');

const PRODUCTION_DOMAIN = 'https://odoo-experten-deutschland.de';
const LOCAL_PATTERNS = [
  /href="\/(?!\/)/g,  // Matches href="/ but not href="//
  /href='\/(?!\/)/g,  // Matches href='/ but not href='//
  /src="\/(?!\/)/g,   // Matches src="/ but not src="//
  /src='\/(?!\/)/g,   // Matches src='/ but not src='//
  /url\(\/(?!\/)/g,   // Matches url(/ but not url(//
  /localhost:8080/g,
  /127\.0\.0\.1:8080/g,
  /localhost:3000/g,
  /127\.0\.0\.1:3000/g
];

async function findFiles(dir, extensions) {
  const files = [];
  
  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(path.relative(dir, fullPath));
      }
    }
  }
  
  await walk(dir);
  return files;
}

async function updateProductionLinks() {
  console.log('🔗 Updating all links to production domain...\n');
  
  try {
    // Find all HTML and CSS files
    const allFiles = await findFiles(distDir, ['.html', '.css']);
    
    let totalUpdates = 0;
    
    for (const file of allFiles) {
      const filePath = path.join(distDir, file);
      let content = await fs.readFile(filePath, 'utf-8');
      let updates = 0;
      
      // Replace local patterns with production domain
      LOCAL_PATTERNS.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          updates += matches.length;
          if (pattern.source.includes('href')) {
            content = content.replace(pattern, `href="${PRODUCTION_DOMAIN}/`);
          } else if (pattern.source.includes('src')) {
            content = content.replace(pattern, `src="${PRODUCTION_DOMAIN}/`);
          } else if (pattern.source.includes('url')) {
            content = content.replace(pattern, `url(${PRODUCTION_DOMAIN}/`);
          } else {
            content = content.replace(pattern, PRODUCTION_DOMAIN);
          }
        }
      });
      
      // Update canonical URLs
      content = content.replace(
        /<link\s+rel="canonical"\s+href="\/([^"]*)">/g,
        `<link rel="canonical" href="${PRODUCTION_DOMAIN}/$1">`
      );
      
      // Update meta og:url
      content = content.replace(
        /<meta\s+property="og:url"\s+content="\/([^"]*)">/g,
        `<meta property="og:url" content="${PRODUCTION_DOMAIN}/$1">`
      );
      
      if (updates > 0) {
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`✅ Updated ${updates} links in: ${file}`);
        totalUpdates += updates;
      }
    }
    
    console.log(`\n✨ Total updates: ${totalUpdates} links in ${allFiles.length} files`);
    
  } catch (error) {
    console.error('❌ Error updating links:', error);
    process.exit(1);
  }
}

// Run the update
updateProductionLinks();