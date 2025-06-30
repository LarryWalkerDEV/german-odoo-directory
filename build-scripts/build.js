#!/usr/bin/env node

import { setup } from './setup.js';
import { fetchAllData } from './fetch-data.js';
import { generateAllPages } from './generate-pages.js';
import { testConnection } from '../config/supabase-config.js';

console.log('🏗️  Deutsche Odoo Experten - Build Process\n');

async function build() {
  const startTime = Date.now();
  
  try {
    // Setup directories and copy assets first
    console.log('🔧 Setting up build environment...');
    await setup();
    
    // Test database connection
    console.log('\n📡 Testing database connection...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Fetch data from Supabase
      console.log('\n📥 Fetching data from database...');
      await fetchAllData();
    } else {
      console.log('\n⚠️  Supabase connection not available');
      console.log('📝 Building with sample data...');
      // The generateAllPages function will use sample data if no data is fetched
    }
    
    // Generate all pages
    console.log('\n📝 Generating static pages...');
    await generateAllPages();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Build completed successfully in ${duration}s!`);
    console.log('\n📁 Output directory: ./dist');
    console.log('🚀 Site is ready for deployment!\n');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run build
build();