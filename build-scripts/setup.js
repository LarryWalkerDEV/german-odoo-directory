import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Define directory structure
const directories = [
  'dist',
  'dist/css',
  'dist/js',
  'dist/images',
  'dist/blog',
  'dist/partner',
  'dist/data'
];

// Setup function
export async function setup() {
  console.log('🔧 Setting up build directories...');
  
  try {
    // Create directories
    for (const dir of directories) {
      const fullPath = path.join(rootDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created: ${dir}`);
      } else {
        console.log(`⏭️  Already exists: ${dir}`);
      }
    }
    
    // Copy static assets
    console.log('\n📁 Copying static assets...');
    
    // Copy ALL CSS files
    const srcStyles = path.join(rootDir, 'src/styles');
    const distCss = path.join(rootDir, 'dist/css');
    if (fs.existsSync(srcStyles)) {
      const cssFiles = fs.readdirSync(srcStyles).filter(file => file.endsWith('.css'));
      cssFiles.forEach(file => {
        const srcFile = path.join(srcStyles, file);
        const destFile = path.join(distCss, file);
        fs.copyFileSync(srcFile, destFile);
        console.log(`✅ Copied ${file}`);
      });
    }
    
    // Copy images if they exist
    const srcImages = path.join(rootDir, 'src/assets/images');
    if (fs.existsSync(srcImages)) {
      copyDirectory(srcImages, path.join(rootDir, 'dist/images'));
      console.log('✅ Copied images');
    }
    
    // Copy scripts if they exist
    const srcScripts = path.join(rootDir, 'src/scripts');
    if (fs.existsSync(srcScripts)) {
      copyDirectory(srcScripts, path.join(rootDir, 'dist/js'));
      console.log('✅ Copied scripts');
    }
    
    console.log('\n✨ Setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    return false;
  }
}

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setup();
}