/**
 * API Client with retry logic and exponential backoff
 * Provides robust error handling and automatic retries for failed requests
 */

import { logger } from './logger';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  shouldRetry: (error: Error) => {
    // Retry on network errors or 5xx server errors
    return error.message.includes('Network') || error.message.includes('Failed to fetch');
  }
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (attempt: number, baseDelay: number, maxDelay: number): number => {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * Fetch with automatic retry logic
 */
export async function fetchWithRetry<T = unknown>(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      logger.debug(`Fetching ${url}`, { attempt, method: options?.method || 'GET' });

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      logger.debug(`Successfully fetched ${url}`, { attempt });
      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      logger.warn(`Request failed for ${url}`, {
        attempt,
        error: lastError.message,
        willRetry: attempt < config.maxRetries && config.shouldRetry(lastError)
      });

      // If this is the last attempt or we shouldn't retry, throw the error
      if (attempt >= config.maxRetries || !config.shouldRetry(lastError)) {
        throw lastError;
      }

      // Calculate delay and wait before retrying
      const delay = getRetryDelay(attempt, config.baseDelay, config.maxDelay);
      logger.debug(`Retrying after ${delay}ms`, { attempt, url });
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Request failed');
}

/**
 * Wrapper for common API operations
 */
export class ApiClient {
  constructor(private baseUrl: string, private defaultHeaders: HeadersInit = {}) {}

  private getHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...additionalHeaders
    };
  }

  async get<T>(
    endpoint: string,
    headers?: HeadersInit,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return fetchWithRetry<T>(
      url,
      {
        method: 'GET',
        headers: this.getHeaders(headers)
      },
      retryConfig
    );
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    headers?: HeadersInit,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return fetchWithRetry<T>(
      url,
      {
        method: 'POST',
        headers: this.getHeaders(headers),
        body: JSON.stringify(body)
      },
      retryConfig
    );
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    headers?: HeadersInit,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return fetchWithRetry<T>(
      url,
      {
        method: 'PUT',
        headers: this.getHeaders(headers),
        body: JSON.stringify(body)
      },
      retryConfig
    );
  }

  async delete<T>(
    endpoint: string,
    headers?: HeadersInit,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return fetchWithRetry<T>(
      url,
      {
        method: 'DELETE',
        headers: this.getHeaders(headers)
      },
      retryConfig
    );
  }
}
