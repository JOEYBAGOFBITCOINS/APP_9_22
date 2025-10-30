/**
 * Deno-compatible Elasticsearch client using fetch API
 * Works with Supabase Edge Functions (Deno runtime)
 */

interface ElasticsearchConfig {
  node: string
  auth?: {
    apiKey?: string
    username?: string
    password?: string
  }
  cloudId?: string
}

class DenoElasticsearchClient {
  private config: ElasticsearchConfig
  private baseUrl: string
  private authHeader: string

  constructor(config: ElasticsearchConfig) {
    this.config = config

    // Determine base URL
    if (config.cloudId) {
      // Decode cloud ID to get the URL
      const decoded = atob(config.cloudId.split(':')[1])
      const [domain, uuid] = decoded.split('$')
      this.baseUrl = `https://${uuid}.${domain}`
    } else {
      this.baseUrl = config.node
    }

    // Setup authentication
    if (config.auth?.apiKey) {
      this.authHeader = `ApiKey ${config.auth.apiKey}`
    } else if (config.auth?.username && config.auth?.password) {
      const credentials = btoa(`${config.auth.username}:${config.auth.password}`)
      this.authHeader = `Basic ${credentials}`
    } else {
      this.authHeader = ''
    }
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const url = `${this.baseUrl}${path}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (this.authHeader) {
      headers['Authorization'] = this.authHeader
    }

    const options: RequestInit = {
      method,
      headers
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok && response.status !== 404) {
      const error = await response.text()
      throw new Error(`Elasticsearch error: ${response.status} - ${error}`)
    }

    if (response.status === 404 && method === 'GET') {
      return null
    }

    return await response.json()
  }

  // Index operations
  async indexExists(index: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${index}`, {
        method: 'HEAD',
        headers: this.authHeader ? { 'Authorization': this.authHeader } : {}
      })
      return response.status === 200
    } catch {
      return false
    }
  }

  async createIndex(index: string, mappings: any): Promise<any> {
    return await this.request('PUT', `/${index}`, {
      mappings,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1
      }
    })
  }

  // Document operations
  async index(params: { index: string; id: string; document: any }): Promise<any> {
    return await this.request('PUT', `/${params.index}/_doc/${params.id}?refresh=wait_for`, params.document)
  }

  async get(params: { index: string; id: string }): Promise<any> {
    return await this.request('GET', `/${params.index}/_doc/${params.id}`)
  }

  async update(params: { index: string; id: string; doc: any }): Promise<any> {
    return await this.request('POST', `/${params.index}/_update/${params.id}?refresh=wait_for`, { doc: params.doc })
  }

  async delete(params: { index: string; id: string }): Promise<any> {
    return await this.request('DELETE', `/${params.index}/_doc/${params.id}?refresh=wait_for`)
  }

  async search(params: { index: string; body: any }): Promise<any> {
    return await this.request('POST', `/${params.index}/_search`, params.body)
  }

  async deleteByQuery(params: { index: string; body: any }): Promise<any> {
    return await this.request('POST', `/${params.index}/_delete_by_query?refresh=true`, params.body)
  }

  async exists(params: { index: string; id: string }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${params.index}/_doc/${params.id}`, {
        method: 'HEAD',
        headers: this.authHeader ? { 'Authorization': this.authHeader } : {}
      })
      return response.status === 200
    } catch {
      return false
    }
  }
}

// Configuration from environment
const getElasticsearchConfig = (): ElasticsearchConfig => {
  const cloudId = Deno.env.get('ELASTICSEARCH_CLOUD_ID')
  const node = Deno.env.get('ELASTICSEARCH_NODE') || 'http://localhost:9200'
  const apiKey = Deno.env.get('ELASTICSEARCH_API_KEY')
  const username = Deno.env.get('ELASTICSEARCH_USERNAME')
  const password = Deno.env.get('ELASTICSEARCH_PASSWORD')

  return {
    cloudId,
    node,
    auth: apiKey
      ? { apiKey }
      : username && password
        ? { username, password }
        : undefined
  }
}

// Singleton client
let esClient: DenoElasticsearchClient | null = null

export const getElasticsearchClient = (): DenoElasticsearchClient => {
  if (!esClient) {
    const config = getElasticsearchConfig()
    esClient = new DenoElasticsearchClient(config)
  }
  return esClient
}

// Index names
const indexPrefix = Deno.env.get('ELASTICSEARCH_INDEX_PREFIX') || 'fueltrakr'

export const getIndexName = (type: 'users' | 'fuel_entries'): string => {
  return `${indexPrefix}_${type}`
}

// Index mappings
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
      const exists = await client.indexExists(indexName)

      if (!exists) {
        await client.createIndex(indexName, mapping)
        console.log(`✅ Created Elasticsearch index: ${indexName}`)
      } else {
        console.log(`ℹ️  Elasticsearch index already exists: ${indexName}`)
      }
    } catch (error) {
      console.error(`❌ Failed to create index ${indexName}:`, error)
    }
  }
}

export type { DenoElasticsearchClient }
