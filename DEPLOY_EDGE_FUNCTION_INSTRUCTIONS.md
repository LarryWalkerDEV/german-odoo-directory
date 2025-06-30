# 🚀 Edge Function Deployment Instructions

Since the Supabase CLI isn't installed, here are two ways to deploy the edge function:

## Option 1: Deploy via Supabase Dashboard (Recommended)

### 1. Set OpenAI API Key Secret
1. Go to https://supabase.com/dashboard
2. Select your project (coaqbzaadmujuewxfhel)
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Click **Add new secret**
5. Add:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
6. Click **Save**

### 2. Deploy Edge Function via Dashboard
1. In your project dashboard, go to **Edge Functions**
2. Click **Create new function**
3. Name it: `generate-blog-images`
4. Copy the entire content from `/home/eugen/Odoo 2.0/odoo-directory/supabase/functions/generate-blog-images/index.ts`
5. Paste it into the function editor
6. Click **Deploy**

### 3. Create Storage Bucket
1. Go to **Storage** in your dashboard
2. Click **Create bucket**
3. Configure:
   - Name: `blog-images`
   - Public: ✅ Yes (toggle on)
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`
4. Click **Create bucket**

## Option 2: Install Supabase CLI and Deploy

### 1. Install Supabase CLI
```bash
# For Linux/WSL
npm install -g supabase

# Or download binary
wget -qO- https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xvz
sudo mv supabase /usr/local/bin/
```

### 2. Login and Link Project
```bash
cd /home/eugen/Odoo\ 2.0/odoo-directory

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref coaqbzaadmujuewxfhel
```

### 3. Set OpenAI Secret and Deploy
```bash
# Set OpenAI API key as secret
supabase secrets set OPENAI_API_KEY=your-openai-api-key

# Deploy the function
supabase functions deploy generate-blog-images
```

### 4. Create Storage Bucket via SQL
```bash
# Run SQL in Supabase dashboard SQL editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);
```

## 🧪 Test the Deployment

After deployment, test the edge function:

```bash
cd /home/eugen/Odoo\ 2.0/odoo-directory
npm run test:edge-function
```

Expected output:
```
🧪 Testing Supabase Edge Function...
📡 Calling edge function at: https://coaqbzaadmujuewxfhel.supabase.co/functions/v1/generate-blog-images
✅ Edge function called successfully!
```

## 🎨 Generate Images for All Articles

Once the edge function is deployed and tested:

```bash
# Generate images for all 129 articles
npm run generate:images:secure

# This will:
# - Process articles in batches of 10
# - Show progress updates
# - Save state in .image-generation-progress.json
# - Total estimated time: 45-60 minutes
# - Total estimated cost: ~$5.16
```

## 📊 Monitor Progress

Check generation progress:
```bash
cat .image-generation-progress.json
```

View logs (if using Supabase CLI):
```bash
supabase functions logs generate-blog-images
```

## 🏗️ Build Site with Images

After images are generated:
```bash
npm run build
```

The site will now use the generated images from Supabase storage!

## ⚠️ Important Notes

1. **API Key Security**: Never commit your OpenAI API key to git
2. **Rate Limits**: The script includes delays to respect OpenAI rate limits
3. **Resume Capability**: If interrupted, the script will resume from where it left off
4. **Storage URLs**: Images are accessible at:
   ```
   https://coaqbzaadmujuewxfhel.supabase.co/storage/v1/object/public/blog-images/[article-slug]/hero.jpg
   ```

## 🆘 Troubleshooting

### Edge Function Not Found (404)
- Ensure the function is deployed with exact name: `generate-blog-images`
- Check deployment status in Supabase dashboard

### Authentication Error (401)
- Verify your SUPABASE_ANON_KEY in .env file
- Ensure the key matches your project

### Image Generation Fails
- Check OpenAI API key is set correctly in Supabase secrets
- Verify you have credits in your OpenAI account
- Check edge function logs for specific errors

Ready to deploy! Choose Option 1 (Dashboard) or Option 2 (CLI) based on your preference.