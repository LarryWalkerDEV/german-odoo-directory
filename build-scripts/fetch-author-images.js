import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase-config.js';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Author image directory
const authorImageDir = path.join(rootDir, 'dist', 'assets', 'images', 'authors');

// Ensure directory exists
if (!fs.existsSync(authorImageDir)) {
  fs.mkdirSync(authorImageDir, { recursive: true });
}

// Fetch and save author images from Supabase storage
async function fetchAuthorImages() {
  console.log('🖼️  Fetching author images from Supabase storage...\n');
  
  try {
    // Load author data
    const authorsPath = path.join(rootDir, 'dist', 'data', 'author-personas.json');
    const authors = JSON.parse(fs.readFileSync(authorsPath, 'utf8'));
    
    console.log(`Found ${authors.length} authors\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const author of authors) {
      const authorId = author.id || author.persona_id;
      const authorName = author.name || author.author_name;
      
      if (!authorId) {
        console.log(`⚠️  Skipping author without ID: ${authorName}`);
        continue;
      }
      
      try {
        // Check if author has an avatar URL in Supabase storage
        const avatarFileName = `${authorId}-avatar.jpg`;
        const localPath = path.join(authorImageDir, avatarFileName);
        
        // Skip if already downloaded
        if (fs.existsSync(localPath)) {
          console.log(`✅ Already have image for ${authorName}`);
          successCount++;
          continue;
        }
        
        // Try to get public URL from Supabase storage
        const { data: publicUrl } = supabase.storage
          .from('author-avatars')
          .getPublicUrl(avatarFileName);
        
        if (publicUrl && publicUrl.publicUrl) {
          // Download the image
          const response = await fetch(publicUrl.publicUrl);
          
          if (response.ok) {
            const buffer = await response.buffer();
            fs.writeFileSync(localPath, buffer);
            console.log(`✅ Downloaded image for ${authorName}`);
            successCount++;
            
            // Update author data with local path
            author.local_avatar_path = `/assets/images/authors/${avatarFileName}`;
          } else {
            console.log(`❌ No image found for ${authorName} in Supabase storage`);
            errorCount++;
          }
        } else {
          console.log(`❌ Could not generate public URL for ${authorName}`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error fetching image for ${authorName}:`, error.message);
        errorCount++;
      }
    }
    
    // Save updated author data with local paths
    fs.writeFileSync(authorsPath, JSON.stringify(authors, null, 2));
    
    console.log('\n📊 Summary:');
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📁 Images saved to: ${authorImageDir}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Create placeholder images for authors without photos
async function createPlaceholderImages() {
  console.log('\n🎨 Creating placeholder images for authors without photos...\n');
  
  const authors = JSON.parse(fs.readFileSync(path.join(rootDir, 'dist', 'data', 'author-personas.json'), 'utf8'));
  
  // Define author initials and colors
  const authorStyles = {
    'sandra_weber': { initials: 'SW', color: '#714B67' },
    'klaus_mueller': { initials: 'KM', color: '#875A4C' },
    'michael_schmidt': { initials: 'MS', color: '#2e7d32' },
    'anna_bauer': { initials: 'AB', color: '#1976d2' }
  };
  
  // For now, we'll use the default avatar for all
  // In production, you could generate SVG avatars with initials
  const defaultAvatarPath = path.join(authorImageDir, 'default-avatar.jpg');
  
  if (!fs.existsSync(defaultAvatarPath)) {
    console.log('📝 Note: Default avatar image needed at:', defaultAvatarPath);
  }
}

// Export functions
export { fetchAuthorImages, createPlaceholderImages };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAuthorImages().then(() => createPlaceholderImages());
}