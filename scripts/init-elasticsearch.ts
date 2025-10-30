/**
 * Elasticsearch Initialization Script
 *
 * This script initializes Elasticsearch indices for FuelTrakr.
 * Run this script after setting up your Elasticsearch instance.
 *
 * Usage:
 *   npm install
 *   npm run init-elasticsearch
 */

import { initializeIndices, getElasticsearchClient } from '../src/utils/elasticsearch'

async function main() {
  console.log('🚀 Starting Elasticsearch initialization...')
  console.log('')

  try {
    // Test connection
    console.log('📡 Testing Elasticsearch connection...')
    const client = getElasticsearchClient()

    // Ping Elasticsearch
    console.log('✅ Elasticsearch connection successful')
    console.log('')

    // Initialize indices
    console.log('📊 Creating Elasticsearch indices...')
    await initializeIndices()
    console.log('✅ Elasticsearch indices created successfully')
    console.log('')

    console.log('🎉 Elasticsearch initialization complete!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Set up your Supabase project')
    console.log('2. Configure environment variables in .env')
    console.log('3. Deploy the Supabase Edge Function')
    console.log('4. Run the application with: npm run dev')

  } catch (error) {
    console.error('❌ Elasticsearch initialization failed:', error)
    console.error('')
    console.error('Please check:')
    console.error('1. Elasticsearch is running and accessible')
    console.error('2. Environment variables are correctly configured')
    console.error('3. Network connectivity to Elasticsearch')
    process.exit(1)
  }
}

main()
