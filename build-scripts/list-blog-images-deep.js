import { supabase } from '../config/supabase-config.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listAllBlogImages() {
  console.log('🔍 Deep scan for blog images in Supabase storage...\n');
  
  try {
    // First, let's check if the bucket exists
    console.log('Checking blog-images bucket...');
    
    // Try to list with recursive option
    const allImages = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const { data: files, error } = await supabase.storage
        .from('blog-images')
        .list('', {
          limit: limit,
          offset: offset,
          search: ''
        });
      
      if (error) {
        console.error(`Error listing files at offset ${offset}:`, error);
        break;
      }
      
      if (!files || files.length === 0) {
        break;
      }
      
      // For each item that looks like a directory, list its contents
      for (const item of files) {
        if (!item.name || item.name.includes('.')) {
          // It's a file
          allImages.push({
            path: item.name,
            metadata: item.metadata
          });
        } else {
          // It might be a directory, try to list its contents
          console.log(`Checking directory: ${item.name}`);
          const { data: subFiles, error: subError } = await supabase.storage
            .from('blog-images')
            .list(item.name, {
              limit: 100,
              offset: 0
            });
          
          if (!subError && subFiles) {
            for (const subFile of subFiles) {
              allImages.push({
                path: `${item.name}/${subFile.name}`,
                metadata: subFile.metadata
              });
            }
          }
        }
      }
      
      offset += limit;
      if (files.length < limit) break;
    }
    
    if (allImages.length === 0) {
      console.log('No images found in blog-images bucket\n');
      
      // Let's also check what buckets exist
      console.log('Checking available storage buckets...');
      // Note: This requires admin access, so it might fail
      try {
        const response = await fetch(`${process.env.SUPABASE_URL}/storage/v1/bucket`, {
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'apikey': process.env.SUPABASE_ANON_KEY
          }
        });
        
        if (response.ok) {
          const buckets = await response.json();
          console.log('\nAvailable buckets:', buckets.map(b => b.name).join(', '));
        }
      } catch (e) {
        console.log('Could not list buckets (requires admin access)');
      }
      
      return;
    }
    
    console.log(`\nFound ${allImages.length} images:\n`);
    
    // Group by article slug
    const imagesBySlug = {};
    
    for (const image of allImages) {
      const pathParts = image.path.split('/');
      const slug = pathParts[0];
      
      if (!imagesBySlug[slug]) {
        imagesBySlug[slug] = [];
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(image.path);
      
      imagesBySlug[slug].push({
        path: image.path,
        url: publicUrl,
        size: image.metadata?.size || 0
      });
    }
    
    // Display results
    for (const [slug, images] of Object.entries(imagesBySlug)) {
      console.log(`📄 ${slug}:`);
      for (const img of images) {
        const sizeKB = (img.size / 1024).toFixed(2);
        console.log(`   - ${img.path} (${sizeKB} KB)`);
        console.log(`     ${img.url}`);
      }
      console.log('');
    }
    
    // Save results
    const outputPath = path.join(__dirname, '../.blog-images-full-list.json');
    await fs.writeFile(outputPath, JSON.stringify(imagesBySlug, null, 2));
    console.log(`💾 Full list saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
listAllBlogImages().catch(console.error);