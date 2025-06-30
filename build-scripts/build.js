#!/usr/bin/env node

import { setup } from './setup.js';
import { fetchAllData } from './fetch-data.js';
import { generateAllPages } from './generate-pages.js';
import { testConnection } from '../config/supabase-config.js';

console.log('🏗️  Deutsche Odoo Experten - Build Process\n');

async function build() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Supabase');
    }
    
    // Setup directories and copy assets
    console.log('\n🔧 Setting up build environment...');
    await setup();
    
    // Fetch data from Supabase
    console.log('\n📥 Fetching data from database...');
    await fetchAllData();
    
    // Generate all pages
    console.log('\n📝 Generating static pages...');
    await generateAllPages();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Build completed successfully in ${duration}s!`);
    console.log('\n📁 Output directory: ./dist');
    console.log('🚀 Site is ready for deployment!\n');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build
build();