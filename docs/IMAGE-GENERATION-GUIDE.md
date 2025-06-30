# Image Generation System for Odoo Directory Blog

This guide explains how to use the batch image generation system to create unique images for all blog articles.

## Overview

The image generation system creates unique, AI-generated images for each of the 129 blog articles, optimized for cost efficiency through batch processing.

## Features

- **Batch Processing**: Processes 10 images at a time to manage API costs
- **Smart Caching**: Skips already generated images to avoid duplicate costs
- **Multiple Sizes**: Generates hero (1200x600), thumbnail (400x300), and social (1200x630) versions
- **Keyword-Based Prompts**: Creates contextually relevant images based on article slugs
- **SEO Optimization**: Includes keywords from URLs in meta descriptions
- **Author Images**: Fetches author avatars from Supabase storage

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OpenAI API Key

Add your OpenAI API key to the `.env` file:

```env
OPENAI_API_KEY=your-api-key-here
```

### 3. Configure Supabase (for author images)

Ensure your Supabase credentials are set:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## Usage

### Full Build with Images

Run the complete build process including image generation:

```bash
npm run build:images
```

### Generate Images Only

To generate images without rebuilding the entire site:

```bash
npm run generate:images
```

### Fetch Author Images Only

To fetch author images from Supabase:

```bash
npm run fetch:author-images
```

### Skip Image Generation

To run the build without generating new images:

```bash
SKIP_IMAGE_GENERATION=true npm run build:images
```

### Test with Limited Articles

To test with only a few articles:

```bash
MAX_ARTICLES_TO_PROCESS=5 npm run build:images
```

### Force Regenerate All Images

To regenerate all images (ignoring cache):

```bash
FORCE_REGENERATE=true npm run build:images
```

## Cost Estimation

- Each image costs approximately $0.04 (DALL-E 3 standard quality)
- Full generation for 129 articles: ~$5.16
- The system uses caching to avoid regenerating existing images

## Image Specifications

### Generated Sizes

1. **Hero Image**: 1200x600px - Used at the top of article pages
2. **Thumbnail**: 400x300px - Used in blog listing cards
3. **Social Image**: 1200x630px - Used for Open Graph/social sharing

### Image Style

Images are generated with:
- Professional business photography aesthetic
- German office environments
- Blue and purple color scheme (#714B67 and #875A4C accents)
- Clean, minimalist style
- No text or logos

### Context-Aware Generation

The system analyzes article slugs to create relevant imagery:
- "odoo-19" articles get futuristic dashboard visualizations
- "dsgvo" articles get data security imagery
- "ai/ki" articles get AI/neural network visualizations
- "roi-calculator" articles get financial charts
- "hosting" articles get server/cloud imagery
- "migration" articles get data transfer visualizations

## File Structure

```
dist/
├── assets/
│   └── images/
│       ├── blog/
│       │   └── articles/
│       │       ├── odoo-19-demo-preview/
│       │       │   ├── odoo-19-demo-preview-hero.jpg
│       │       │   ├── odoo-19-demo-preview-thumbnail.jpg
│       │       │   └── odoo-19-demo-preview-social.jpg
│       │       └── ... (other articles)
│       └── authors/
│           ├── sandra_weber-avatar.jpg
│           ├── klaus_mueller-avatar.jpg
│           └── default-avatar.jpg
```

## Cache Management

The system maintains a cache file at `.image-cache/generated-images.json` to track:
- Which images have been generated
- Generation timestamps
- Prompts used
- File paths

## SEO Enhancements

### Meta Descriptions

The system automatically enhances meta descriptions by:
1. Extracting keywords from article slugs
2. Including these keywords in meta descriptions
3. Example: "odoo-19-roi-calculator" → Keywords: "odoo, 19, roi, calculator"

### Image Sitemap

The build process generates `sitemap-images.xml` for better SEO, including:
- Image locations
- Image titles
- Image captions

## Troubleshooting

### Missing API Key

If you see "OpenAI API key not found", ensure:
1. The `.env` file exists in the root directory
2. `OPENAI_API_KEY` is set correctly
3. The key has sufficient credits

### Rate Limits

The system includes:
- 5-second delays between batches
- Automatic retry logic (up to 3 retries)
- Exponential backoff for failed requests

### Image Quality Issues

If images don't match expectations:
1. Check the generated prompts in the cache file
2. Adjust prompt generation logic in `generateImagePrompt()`
3. Consider using "hd" quality instead of "standard" (higher cost)

## Development

### Adding New Image Types

To add new image sizes or types:

1. Update `IMAGE_SIZES` in `generate-article-images.js`
2. Modify the prompt generation logic if needed
3. Update the blog templates to use new image types

### Customizing Prompts

Edit the `generateImagePrompt()` function to:
- Add new keyword patterns
- Change style preferences
- Include specific visual elements

## Best Practices

1. **Test First**: Always test with a small batch before full generation
2. **Monitor Costs**: Check your OpenAI dashboard for usage
3. **Cache Wisely**: Don't delete the cache file unless necessary
4. **Backup Images**: Regularly backup the generated images
5. **Quality Control**: Review generated images and regenerate if needed

## Support

For issues or questions:
1. Check the console output for detailed error messages
2. Review the cache file for generation history
3. Ensure all dependencies are correctly installed
4. Verify API keys and permissions