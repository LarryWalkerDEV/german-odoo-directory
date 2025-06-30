# Secure Image Generation with Supabase Edge Functions

This guide explains how to set up the secure image generation system using Supabase Edge Functions.

## Prerequisites

1. Supabase project with Edge Functions enabled
2. OpenAI API key
3. Supabase CLI installed locally

## Setup Steps

### 1. Deploy the Edge Function

First, install the Supabase CLI if you haven't already:

```bash
npm install -g supabase
```

Login to your Supabase project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

### 2. Set OpenAI API Key as Secret

Add your OpenAI API key as a secret in Supabase:

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Deploy the Edge Function

Deploy the generate-blog-images function:

```bash
cd /home/eugen/Odoo 2.0/odoo-directory
supabase functions deploy generate-blog-images
```

### 4. Create Storage Bucket

Create the blog-images storage bucket in your Supabase dashboard:

1. Go to Storage in your Supabase project
2. Click "Create bucket"
3. Name: `blog-images`
4. Public bucket: Yes
5. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
6. Max file size: 5MB

Or use SQL Editor:

```sql
-- Create blog-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Set up RLS policy for public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND 
  auth.role() = 'authenticated'
);
```

### 5. Environment Variables

Ensure your `.env` file has these variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key (optional, for admin operations)
```

## Usage

### Generate Images for All Articles

Run the secure image generation script:

```bash
npm run generate:images:secure
```

This will:
- Fetch all blog articles from Supabase
- Process them in batches of 10
- Call the edge function to generate images
- Save progress to allow resuming
- Store images in Supabase storage

### Progress Tracking

The script creates a `.image-generation-progress.json` file to track:
- Successfully processed articles
- Failed articles
- Last processed index

To retry failed articles:
1. Edit `.image-generation-progress.json`
2. Remove article IDs from the "failed" array
3. Run the script again

### Image URLs

Generated images are available at:
```
https://[your-project].supabase.co/storage/v1/object/public/blog-images/[article-slug]/hero.jpg
```

## Rate Limits and Costs

- OpenAI DALL-E 3: ~$0.04 per image (standard quality)
- Rate limit: Respects OpenAI's rate limits with delays
- Batch size: 10 articles at a time
- Total for 129 articles: ~$5.16

## Monitoring

Check Edge Function logs:

```bash
supabase functions logs generate-blog-images
```

## Troubleshooting

### Edge Function Not Found
- Ensure the function is deployed: `supabase functions list`
- Check function name matches exactly

### OpenAI API Errors
- Verify API key is set: `supabase secrets list`
- Check OpenAI account has credits
- Review rate limit errors in logs

### Storage Errors
- Ensure bucket exists and is public
- Check bucket policies allow uploads
- Verify file size limits

### Resume After Failure
- Check `.image-generation-progress.json`
- Remove failed IDs to retry
- Run script again

## Security Notes

- API keys are never exposed in client code
- Edge function handles all OpenAI communication
- Storage bucket uses RLS policies
- No hardcoded credentials