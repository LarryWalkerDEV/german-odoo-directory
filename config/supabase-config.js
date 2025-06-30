import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file if it exists
dotenv.config();

// Log environment variables for debugging (without exposing keys)
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Environment variables missing!');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '[REDACTED]' : 'undefined');
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client for public access
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create Supabase client for server-side operations (with service key)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// Test connection function
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
}

// Helper function to fetch table schema
export async function getTableSchema(tableName) {
  if (!supabaseAdmin) {
    console.warn('Service key not available, cannot fetch schema');
    return null;
  }
  
  try {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(0);
    
    if (error) {
      console.error(`Error fetching schema for ${tableName}:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Error accessing ${tableName}:`, err);
    return null;
  }
}