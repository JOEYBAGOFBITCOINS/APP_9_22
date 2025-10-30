// Elasticsearch client and configuration
export {
  getElasticsearchClient,
  createElasticsearchClient,
  getIndexName,
  initializeIndices,
  INDEX_MAPPINGS,
  type ElasticsearchClient
} from './client'

// User service
export {
  UserElasticsearchService,
  userService,
  type User,
  type UserInsert,
  type UserUpdate
} from './userService'

// Fuel entry service
export {
  FuelEntryElasticsearchService,
  fuelEntryService,
  type FuelEntry,
  type FuelEntryInsert,
  type FuelEntrySearchParams
} from './fuelEntryService'
