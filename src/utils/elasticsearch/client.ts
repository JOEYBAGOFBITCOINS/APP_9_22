import { Client } from '@elastic/elasticsearch'

// Elasticsearch configuration from environment variables
const getElasticsearchConfig = () => {
  const env = import.meta.env || {}

  // Cloud ID takes precedence (Elastic Cloud deployments)
  if (env.VITE_ELASTICSEARCH_CLOUD_ID) {
    return {
      cloud: {
        id: env.VITE_ELASTICSEARCH_CLOUD_ID
      },
      auth: env.VITE_ELASTICSEARCH_API_KEY
        ? { apiKey: env.VITE_ELASTICSEARCH_API_KEY }
        : {
            username: env.VITE_ELASTICSEARCH_USERNAME || 'elastic',
            password: env.VITE_ELASTICSEARCH_PASSWORD || ''
          }
    }
  }

  // Self-hosted or custom Elasticsearch instance
  return {
    node: env.VITE_ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: env.VITE_ELASTICSEARCH_API_KEY
      ? { apiKey: env.VITE_ELASTICSEARCH_API_KEY }
      : env.VITE_ELASTICSEARCH_USERNAME
        ? {
            username: env.VITE_ELASTICSEARCH_USERNAME,
            password: env.VITE_ELASTICSEARCH_PASSWORD || ''
          }
        : undefined
  }
}

// Create Elasticsearch client
export const createElasticsearchClient = () => {
  try {
    const config = getElasticsearchConfig()
    return new Client(config)
  } catch (error) {
    console.error('Failed to create Elasticsearch client:', error)
    throw new Error('Elasticsearch client initialization failed')
  }
}

// Singleton instance
let esClient: Client | null = null

export const getElasticsearchClient = (): Client => {
  if (!esClient) {
    esClient = createElasticsearchClient()
  }
  return esClient
}

// Index names with prefix from environment
export const getIndexName = (indexType: 'users' | 'fuel_entries'): string => {
  const prefix = import.meta.env.VITE_ELASTICSEARCH_INDEX_PREFIX || 'fueltrakr'
  return `${prefix}_${indexType}`
}

// Index configurations
export const INDEX_MAPPINGS = {
  users: {
    properties: {
      id: { type: 'keyword' },
      email: { type: 'keyword' },
      name: { type: 'text' },
      role: { type: 'keyword' },
      created_at: { type: 'date' },
      updated_at: { type: 'date' }
    }
  },
  fuel_entries: {
    properties: {
      id: { type: 'keyword' },
      user_id: { type: 'keyword' },
      stock_number: { type: 'keyword' },
      vin: { type: 'keyword' },
      gallons: { type: 'float' },
      price_per_gallon: { type: 'float' },
      total_amount: { type: 'float' },
      odometer: { type: 'integer' },
      fuel_type: { type: 'keyword' },
      location: { type: 'text' },
      latitude: { type: 'geo_point' },
      longitude: { type: 'geo_point' },
      geo_location: { type: 'geo_point' },
      receipt_photo: { type: 'keyword' },
      vin_photo: { type: 'keyword' },
      notes: { type: 'text' },
      timestamp: { type: 'date' },
      created_at: { type: 'date' }
    }
  }
}

// Initialize indices
export const initializeIndices = async (): Promise<void> => {
  const client = getElasticsearchClient()

  for (const [indexType, mapping] of Object.entries(INDEX_MAPPINGS)) {
    const indexName = getIndexName(indexType as 'users' | 'fuel_entries')

    try {
      const exists = await client.indices.exists({ index: indexName })

      if (!exists) {
        await client.indices.create({
          index: indexName,
          body: {
            mappings: mapping,
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1
            }
          }
        })
        console.log(`Created index: ${indexName}`)
      } else {
        console.log(`Index already exists: ${indexName}`)
      }
    } catch (error) {
      console.error(`Failed to create index ${indexName}:`, error)
      throw error
    }
  }
}

export type { Client as ElasticsearchClient }
