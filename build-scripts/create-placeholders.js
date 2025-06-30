import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Create placeholder SVG images
function createPlaceholderSVG(width, height, text, bgColor = '#714B67') {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
}

// Create placeholder images
function createPlaceholders() {
  console.log('🎨 Creating placeholder images...\n');
  
  const placeholders = [
    {
      path: 'dist/assets/images/blog/default-hero.jpg',
      svg: createPlaceholderSVG(1200, 600, 'Blog Article Hero', '#714B67'),
      description: 'Default hero image for articles'
    },
    {
      path: 'dist/assets/images/blog/default-article.svg',
      svg: createPlaceholderSVG(400, 300, 'Article Thumbnail', '#875A4C'),
      description: 'Default thumbnail for blog listing'
    },
    {
      path: 'dist/assets/images/authors/default-avatar.jpg',
      svg: createPlaceholderSVG(200, 200, 'Author', '#2e7d32'),
      description: 'Default author avatar'
    }
  ];
  
  placeholders.forEach(({ path: filePath, svg, description }) => {
    const fullPath = path.join(rootDir, filePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // For .jpg files, we'll create SVG versions
    const svgPath = filePath.endsWith('.jpg') 
      ? fullPath.replace('.jpg', '.svg') 
      : fullPath;
    
    fs.writeFileSync(svgPath, svg);
    console.log(`✅ Created: ${svgPath}`);
    console.log(`   ${description}\n`);
  });
  
  // Create author-specific placeholders
  const authors = [
    { id: 'sandra_weber', initials: 'SW', color: '#714B67' },
    { id: 'klaus_mueller', initials: 'KM', color: '#875A4C' },
    { id: 'michael_schmidt', initials: 'MS', color: '#2e7d32' },
    { id: 'anna_bauer', initials: 'AB', color: '#1976d2' }
  ];
  
  authors.forEach(({ id, initials, color }) => {
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="100" fill="${color}"/>
  <text x="100" y="100" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text>
</svg>`;
    
    const filePath = path.join(rootDir, 'dist/assets/images/authors', `${id}-avatar.svg`);
    fs.writeFileSync(filePath, svg);
    console.log(`✅ Created author placeholder: ${id}-avatar.svg`);
  });
  
  console.log('\n✨ All placeholder images created!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createPlaceholders();
}

export { createPlaceholders };