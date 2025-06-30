import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ArticleData {
  id: string
  title: string
  slug: string
  keywords?: string[]
  meta_description?: string
}

interface BatchRequest {
  articles: ArticleData[]
}

// Generate a professional prompt for DALL-E based on article data
function generateImagePrompt(article: ArticleData): string {
  const keywords = article.keywords?.join(', ') || 'business technology'
  const title = article.title || 'Technology Solutions'
  
  // Extract key themes from title and keywords
  const hasAI = title.toLowerCase().includes('ai') || title.toLowerCase().includes('ki') || keywords.toLowerCase().includes('ai')
  const hasAutomation = title.toLowerCase().includes('automat') || keywords.toLowerCase().includes('automat')
  const hasIntegration = title.toLowerCase().includes('integration') || keywords.toLowerCase().includes('integration')
  const hasMigration = title.toLowerCase().includes('migration') || keywords.toLowerCase().includes('migration')
  const hasROI = title.toLowerCase().includes('roi') || title.toLowerCase().includes('kosten') || keywords.toLowerCase().includes('cost')
  
  let visualElements = 'flowing data streams, abstract geometric patterns, modern tech visualization'
  
  if (hasAI) {
    visualElements = 'neural network patterns, AI brain visualization, glowing circuits, futuristic interfaces'
  } else if (hasAutomation) {
    visualElements = 'interconnected gears, robotic arms, automated workflows, efficiency symbols'
  } else if (hasIntegration) {
    visualElements = 'puzzle pieces connecting, network nodes linking, API connections, system integration'
  } else if (hasMigration) {
    visualElements = 'transformation arrows, data flow migration, cloud transition, modernization symbols'
  } else if (hasROI) {
    visualElements = 'upward trending graphs, financial growth charts, ROI calculations, success metrics'
  }
  
  return `Create a visually striking hero image for a professional German tech blog that will make viewers want to click and read more.

Article Title: ${title}
Key Topics: ${keywords}

Visual Requirements:
- Eye-catching modern design with vibrant gradient background
- Incorporate visual metaphors for: ${visualElements}
- Use a color palette with electric purple (#714B67), bright teal, modern orange accents
- Add subtle particle effects or glowing elements for tech feel
- Include abstract 3D elements or isometric designs
- Create depth with layered elements and soft shadows
- Ensure high visual impact while maintaining corporate professionalism

Style: Modern tech aesthetic, clean but dynamic, visually engaging
Mood: Innovative, cutting-edge, trustworthy, must-click appeal
Composition: Wide banner format (16:9), focal point slightly off-center
Avoid: Human faces, any text or numbers, specific brand logos, clichéd stock photos

Make it visually compelling enough that someone scrolling would stop and want to click!`
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OpenAI')
    if (!openaiApiKey) {
      throw new Error('OpenAI not configured')
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { articles }: BatchRequest = await req.json()
    
    if (!articles || !Array.isArray(articles)) {
      throw new Error('Invalid request: articles array required')
    }

    // Limit batch size to prevent timeouts
    const batchSize = Math.min(articles.length, 10)
    const batch = articles.slice(0, batchSize)
    
    console.log(`Processing ${batch.length} articles`)

    const results = []
    
    // Process each article
    for (const article of batch) {
      try {
        // Generate prompt
        const prompt = generateImagePrompt(article)
        
        // Call OpenAI DALL-E API
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1792x1024',
            quality: 'standard',
            style: 'natural'
          }),
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(`OpenAI API error: ${error}`)
        }

        const data = await response.json()
        const imageUrl = data.data[0].url
        
        // Download the image
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to download generated image')
        }
        
        const imageBlob = await imageResponse.blob()
        const arrayBuffer = await imageBlob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Upload to Supabase storage
        const fileName = `${article.slug}/hero.jpg`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, uint8Array, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName)

        results.push({
          articleId: article.id,
          slug: article.slug,
          success: true,
          imageUrl: publicUrl,
          prompt: prompt
        })

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`Error processing article ${article.slug}:`, error)
        results.push({
          articleId: article.id,
          slug: article.slug,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results: results 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})