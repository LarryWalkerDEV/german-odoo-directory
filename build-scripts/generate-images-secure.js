import { supabase, supabaseAdmin } from '../config/supabase-config.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BATCH_SIZE = 3; // Process 3 articles at a time to avoid timeouts
const PROGRESS_FILE = path.join(__dirname, '../.image-generation-progress.json');

/**
 * Load progress from file
 */
async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      processed: [],
      failed: [],
      lastProcessedIndex: -1
    };
  }
}

/**
 * Save progress to file
 */
async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Fetch all blog articles from Supabase
 */
async function fetchArticles() {
  console.log('📚 Fetching blog articles from Supabase...');
  
  const { data: articles, error } = await supabase
    .from('blog_articles')
    .select('id, article_data, seo_data')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  // Extract fields from JSONB columns
  const processedArticles = (articles || []).map(article => ({
    id: article.id,
    title: article.article_data?.title || 'Untitled Article',
    slug: article.article_data?.slug || '',
    keywords: article.seo_data?.keywords || [],
    meta_description: article.seo_data?.meta_description || ''
  }));

  console.log(`✅ Found ${processedArticles.length} articles`);
  return processedArticles;
}

/**
 * Check if article already has an image
 */
async function checkExistingImage(slug) {
  const { data, error } = await supabase.storage
    .from('blog-images')
    .list(slug);
  
  if (error) {
    console.error(`Error checking image for ${slug}:`, error);
    return false;
  }
  
  return data && data.length > 0;
}

/**
 * Call Supabase Edge Function to generate images
 */
async function generateImagesForBatch(articles) {
  const edgeFunctionUrl = `${process.env.SUPABASE_URL}/functions/v1/generate-blog-images`;
  
  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ articles }),
    timeout: 300000 // 5 minute timeout
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error(`❌ Edge function returned ${response.status}: ${responseText}`);
    throw new Error(`Edge function error: ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('❌ Failed to parse response:', responseText);
    throw new Error('Invalid response from edge function');
  }
}

/**
 * Create blog-images storage bucket if it doesn't exist
 */
async function ensureStorageBucket() {
  if (!supabaseAdmin) {
    console.warn('⚠️  Admin client not available, cannot create bucket');
    console.log('ℹ️  Please ensure "blog-images" bucket exists with public access');
    return;
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'blog-images');
    
    if (!bucketExists) {
      console.log('🪣 Creating blog-images storage bucket...');
      
      const { data, error } = await supabaseAdmin.storage.createBucket('blog-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('✅ Storage bucket created successfully');
      }
    } else {
      console.log('✅ Storage bucket already exists');
    }
  } catch (error) {
    console.error('Error managing storage bucket:', error);
  }
}

/**
 * Main function to generate images for all articles
 */
async function generateImages() {
  console.log('🚀 Starting secure image generation process...\n');

  try {
    // Ensure storage bucket exists
    await ensureStorageBucket();

    // Load progress
    const progress = await loadProgress();
    console.log(`📊 Previous progress: ${progress.processed.length} processed, ${progress.failed.length} failed\n`);

    // Fetch articles
    const allArticles = await fetchArticles();
    
    // Filter out already processed articles
    const remainingArticles = allArticles.filter(
      article => !progress.processed.includes(article.id) && !progress.failed.includes(article.id)
    );

    console.log(`📸 Need to generate images for ${remainingArticles.length} articles\n`);

    if (remainingArticles.length === 0) {
      console.log('✅ All articles already have images!');
      return;
    }

    // Process in batches
    let processedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < remainingArticles.length; i += BATCH_SIZE) {
      const batch = remainingArticles.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(remainingArticles.length / BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} articles)...`);
      
      // Check which articles already have images
      const articlesToProcess = [];
      for (const article of batch) {
        const hasImage = await checkExistingImage(article.slug);
        if (!hasImage) {
          articlesToProcess.push(article);
        } else {
          console.log(`✓ ${article.slug} already has an image`);
          progress.processed.push(article.id);
        }
      }

      if (articlesToProcess.length === 0) {
        console.log('All articles in this batch already have images');
        continue;
      }

      try {
        // Call edge function
        console.log(`🎨 Generating ${articlesToProcess.length} images via edge function...`);
        const result = await generateImagesForBatch(articlesToProcess);
        
        // Process results
        for (const item of result.results) {
          if (item.success) {
            console.log(`✅ Generated image for: ${item.slug}`);
            progress.processed.push(item.articleId);
            processedCount++;
          } else {
            console.error(`❌ Failed for ${item.slug}: ${item.error}`);
            progress.failed.push(item.articleId);
            failedCount++;
          }
        }
        
        // Save progress after each batch
        progress.lastProcessedIndex = i + batch.length;
        await saveProgress(progress);
        
        // Wait between batches to respect rate limits
        if (i + BATCH_SIZE < remainingArticles.length) {
          console.log('\n⏳ Waiting 15 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 15000));
        }
        
      } catch (error) {
        console.error(`❌ Batch processing error:`, error);
        
        // Mark all articles in batch as failed
        for (const article of articlesToProcess) {
          progress.failed.push(article.id);
          failedCount++;
        }
        
        await saveProgress(progress);
        
        // Continue with next batch
        console.log('⚠️  Continuing with next batch...');
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully generated: ${processedCount} images`);
    console.log(`❌ Failed: ${failedCount} images`);
    console.log(`📁 Total processed: ${progress.processed.length} articles`);
    console.log('='.repeat(60));

    // Retry failed articles info
    if (progress.failed.length > 0) {
      console.log('\nℹ️  To retry failed articles, delete them from .image-generation-progress.json');
      console.log('   and run this script again.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
generateImages().catch(console.error);