import { supabase } from '../config/supabase-config.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listBlogImages() {
  console.log('🔍 Fetching blog images from Supabase storage...\n');
  
  try {
    // List all files in the blog-images bucket
    const { data: files, error } = await supabase.storage
      .from('blog-images')
      .list('', {
        limit: 1000,
        offset: 0
      });
    
    if (error) {
      throw new Error(`Failed to list images: ${error.message}`);
    }
    
    if (!files || files.length === 0) {
      console.log('No images found in blog-images bucket');
      return;
    }
    
    console.log(`Found ${files.length} items in blog-images bucket:\n`);
    
    // Group files by directory (article slug)
    const imagesBySlug = {};
    
    for (const file of files) {
      // Skip if it's a directory
      if (file.id && !file.name) continue;
      
      // Extract slug from path
      const pathParts = file.name.split('/');
      if (pathParts.length > 0) {
        const slug = pathParts[0];
        if (!imagesBySlug[slug]) {
          imagesBySlug[slug] = [];
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(file.name);
        
        imagesBySlug[slug].push({
          name: file.name,
          size: file.metadata?.size || 0,
          mimetype: file.metadata?.mimetype || 'unknown',
          publicUrl: publicUrl
        });
      }
    }
    
    // Display organized results
    const slugs = Object.keys(imagesBySlug).sort();
    console.log(`📁 Found images for ${slugs.length} articles:\n`);
    
    for (const slug of slugs) {
      console.log(`\n📄 ${slug}:`);
      for (const image of imagesBySlug[slug]) {
        const sizeKB = (image.size / 1024).toFixed(2);
        console.log(`   - ${image.name} (${sizeKB} KB)`);
        console.log(`     URL: ${image.publicUrl}`);
      }
    }
    
    // Save to JSON file for reference
    const outputPath = path.join(__dirname, '../.blog-images-list.json');
    await fs.writeFile(outputPath, JSON.stringify(imagesBySlug, null, 2));
    console.log(`\n💾 Full list saved to: ${outputPath}`);
    
    // Summary statistics
    const totalImages = Object.values(imagesBySlug).reduce((sum, images) => sum + images.length, 0);
    console.log('\n📊 Summary:');
    console.log(`   Total articles with images: ${slugs.length}`);
    console.log(`   Total image files: ${totalImages}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
listBlogImages().catch(console.error);