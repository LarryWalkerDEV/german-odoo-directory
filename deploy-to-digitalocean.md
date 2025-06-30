# Deploy to DigitalOcean App Platform

Since the MCP server requires GitHub OAuth authentication which we don't have configured, you'll need to deploy manually through the DigitalOcean web interface.

## Steps to Deploy:

1. **Go to DigitalOcean App Platform**
   - Visit: https://cloud.digitalocean.com/apps
   - Click "Create App"

2. **Connect GitHub Repository**
   - Choose "GitHub" as your source
   - Authorize DigitalOcean to access your GitHub account
   - Select repository: `LarryWalkerDEV/german-odoo-directory`
   - Branch: `main`

3. **Configure App**
   - The app will automatically detect the `.do/app.yaml` configuration
   - Review the settings:
     - Name: `german-odoo-directory`
     - Region: Frankfurt (fra)
     - Build Command: `npm install && npm run build`
     - Output Directory: `dist`

4. **Environment Variables**
   The following environment variables are already configured in app.yaml:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. **Deploy**
   - Click "Next" through the review steps
   - Choose the free Starter plan ($0/month for static sites)
   - Click "Create Resources"

6. **Wait for Deployment**
   - The first deployment will take 5-10 minutes
   - DigitalOcean will:
     - Clone your repository
     - Run `npm install && npm run build`
     - Deploy the `dist` folder as a static site

## After Deployment:

Your app will be available at:
- `https://german-odoo-directory-[random-id].ondigitalocean.app`

You can configure a custom domain later in the app settings.

## Automatic Deployments:

With `deploy_on_push: true` in the configuration, any push to the `main` branch will automatically trigger a new deployment.