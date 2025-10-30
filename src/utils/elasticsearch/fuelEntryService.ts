import { getElasticsearchClient, getIndexName } from './client'

export interface FuelEntry {
  id: string
  user_id: string
  stock_number: string
  vin: string | null
  gallons: number
  price_per_gallon: number
  total_amount: number
  odometer: number
  fuel_type: string
  location: string
  latitude?: number | null
  longitude?: number | null
  receipt_photo?: string | null
  vin_photo?: string | null
  notes?: string | null
  timestamp: string
  created_at: string
}

export interface FuelEntryInsert {
  user_id: string
  stock_number: string
  vin?: string | null
  gallons: number
  price_per_gallon: number
  total_amount: number
  odometer: number
  fuel_type: string
  location: string
  latitude?: number | null
  longitude?: number | null
  receipt_photo?: string | null
  vin_photo?: string | null
  notes?: string | null
  timestamp: string
}

export interface FuelEntrySearchParams {
  userId?: string
  stockNumber?: string
  vin?: string
  fuelType?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  limit?: number
  offset?: number
}

export class FuelEntryElasticsearchService {
  private client = getElasticsearchClient()
  private indexName = getIndexName('fuel_entries')

  /**
   * Create a new fuel entry
   */
  async createFuelEntry(entry: FuelEntryInsert): Promise<FuelEntry> {
    const newEntry: FuelEntry = {
      id: crypto.randomUUID(),
      ...entry,
      created_at: new Date().toISOString()
    }

    // If latitude and longitude are provided, create geo_point
    const document: any = { ...newEntry }
    if (newEntry.latitude && newEntry.longitude) {
      document.geo_location = {
        lat: newEntry.latitude,
        lon: newEntry.longitude
      }
    }

    await this.client.index({
      index: this.indexName,
      id: newEntry.id,
      document,
      refresh: 'wait_for'
    })

    return newEntry
  }

  /**
   * Get fuel entry by ID
   */
  async getFuelEntryById(entryId: string): Promise<FuelEntry | null> {
    try {
      const result = await this.client.get({
        index: this.indexName,
        id: entryId
      })

      return result._source as FuelEntry
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Get fuel entries by user ID
   */
  async getFuelEntriesByUserId(userId: string, limit = 100): Promise<FuelEntry[]> {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            term: {
              user_id: userId
            }
          },
          sort: [{ timestamp: 'desc' }],
          size: limit
        }
      })

      return result.hits.hits.map(hit => hit._source as FuelEntry)
    } catch (error) {
      console.error('Error fetching fuel entries by user ID:', error)
      throw error
    }
  }

  /**
   * Get all fuel entries (for admin)
   */
  async getAllFuelEntries(limit = 1000): Promise<FuelEntry[]> {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            match_all: {}
          },
          sort: [{ timestamp: 'desc' }],
          size: limit
        }
      })

      return result.hits.hits.map(hit => hit._source as FuelEntry)
    } catch (error) {
      console.error('Error fetching all fuel entries:', error)
      throw error
    }
  }

  /**
   * Search fuel entries with filters
   */
  async searchFuelEntries(params: FuelEntrySearchParams): Promise<FuelEntry[]> {
    const must: any[] = []

    if (params.userId) {
      must.push({ term: { user_id: params.userId } })
    }

    if (params.stockNumber) {
      must.push({ term: { stock_number: params.stockNumber } })
    }

    if (params.vin) {
      must.push({ term: { vin: params.vin } })
    }

    if (params.fuelType) {
      must.push({ term: { fuel_type: params.fuelType } })
    }

    if (params.startDate || params.endDate) {
      const range: any = {}
      if (params.startDate) range.gte = params.startDate
      if (params.endDate) range.lte = params.endDate
      must.push({ range: { timestamp: range } })
    }

    if (params.minAmount !== undefined || params.maxAmount !== undefined) {
      const range: any = {}
      if (params.minAmount !== undefined) range.gte = params.minAmount
      if (params.maxAmount !== undefined) range.lte = params.maxAmount
      must.push({ range: { total_amount: range } })
    }

    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: must.length > 0 ? { bool: { must } } : { match_all: {} },
          sort: [{ timestamp: 'desc' }],
          size: params.limit || 100,
          from: params.offset || 0
        }
      })

      return result.hits.hits.map(hit => hit._source as FuelEntry)
    } catch (error) {
      console.error('Error searching fuel entries:', error)
      throw error
    }
  }

  /**
   * Delete fuel entry
   */
  async deleteFuelEntry(entryId: string): Promise<boolean> {
    try {
      await this.client.delete({
        index: this.indexName,
        id: entryId,
        refresh: 'wait_for'
      })
      return true
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Delete all fuel entries for a user
   */
  async deleteFuelEntriesByUserId(userId: string): Promise<number> {
    try {
      const result = await this.client.deleteByQuery({
        index: this.indexName,
        body: {
          query: {
            term: {
              user_id: userId
            }
          }
        },
        refresh: true
      })

      return result.deleted || 0
    } catch (error) {
      console.error('Error deleting fuel entries by user ID:', error)
      throw error
    }
  }

  /**
   * Get fuel entry statistics for a user
   */
  async getUserFuelStats(userId: string): Promise<{
    totalEntries: number
    totalGallons: number
    totalAmount: number
    averagePricePerGallon: number
  }> {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            term: {
              user_id: userId
            }
          },
          aggs: {
            total_gallons: { sum: { field: 'gallons' } },
            total_amount: { sum: { field: 'total_amount' } },
            avg_price: { avg: { field: 'price_per_gallon' } }
          },
          size: 0
        }
      })

      return {
        totalEntries: result.hits.total?.valueOf() as number || 0,
        totalGallons: result.aggregations?.total_gallons.value || 0,
        totalAmount: result.aggregations?.total_amount.value || 0,
        averagePricePerGallon: result.aggregations?.avg_price.value || 0
      }
    } catch (error) {
      console.error('Error getting user fuel stats:', error)
      throw error
    }
  }

  /**
   * Get fuel entries by stock number
   */
  async getFuelEntriesByStockNumber(stockNumber: string): Promise<FuelEntry[]> {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            term: {
              stock_number: stockNumber
            }
          },
          sort: [{ timestamp: 'desc' }]
        }
      })

      return result.hits.hits.map(hit => hit._source as FuelEntry)
    } catch (error) {
      console.error('Error fetching fuel entries by stock number:', error)
      throw error
    }
  }
}

// Export singleton instance
export const fuelEntryService = new FuelEntryElasticsearchService()
