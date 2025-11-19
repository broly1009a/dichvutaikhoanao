import crypto from 'crypto';

/**
 * Verify PayOS webhook signature using HMAC-SHA256
 * PayOS sends: X-Signature header with HMAC-SHA256(body, API_SECRET)
 */
export function verifyPayOSSignature(
  rawBody: string,
  signature: string,
  apiSecret: string
): boolean {
  try {
    const hash = crypto
      .createHmac('sha256', apiSecret)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(signature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Retry logic with exponential backoff
 * Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = initialDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * delay; // 10% jitter
        const totalDelay = delay + jitter;

        console.log(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(totalDelay)}ms`,
          lastError.message
        );

        await new Promise((resolve) => setTimeout(resolve, totalDelay));
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error instanceof Error) {
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('timeout')
    ) {
      return true;
    }
  }

  // HTTP status codes that are retryable
  const status = error?.status || error?.statusCode;
  if (status && [408, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  return false;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private tokens: Map<string, number> = new Map();
  private lastRefill: Map<string, number> = new Map();

  constructor(
    private maxTokens: number = 100,
    private refillRate: number = 10, // tokens per second
    private windowSize: number = 1000 // ms
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const lastRefillTime = this.lastRefill.get(key) || now;
    const timePassed = now - lastRefillTime;

    // Calculate tokens to add
    const tokensToAdd = (timePassed / this.windowSize) * this.refillRate;
    let currentTokens = Math.min(
      this.maxTokens,
      (this.tokens.get(key) || 0) + tokensToAdd
    );

    if (currentTokens >= 1) {
      currentTokens -= 1;
      this.tokens.set(key, currentTokens);
      this.lastRefill.set(key, now);
      return true;
    }

    return false;
  }

  getRemainingTokens(key: string): number {
    return this.tokens.get(key) || 0;
  }

  reset(key: string): void {
    this.tokens.delete(key);
    this.lastRefill.delete(key);
  }
}

/**
 * Request deduplication to prevent double processing
 * Uses request ID (UUID) as key
 */
export class RequestDeduplicator {
  private processedRequests: Map<string, { result: any; timestamp: number }> =
    new Map();
  private readonly TTL = 60 * 1000; // 1 minute

  record(requestId: string, result: any): void {
    this.processedRequests.set(requestId, {
      result,
      timestamp: Date.now(),
    });

    // Cleanup old entries
    this.cleanup();
  }

  isDuplicate(requestId: string): boolean {
    const entry = this.processedRequests.get(requestId);

    if (!entry) {
      return false;
    }

    // Check if still valid
    if (Date.now() - entry.timestamp > this.TTL) {
      this.processedRequests.delete(requestId);
      return false;
    }

    return true;
  }

  getResult(requestId: string): any {
    return this.processedRequests.get(requestId)?.result || null;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.processedRequests.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.processedRequests.delete(key);
      }
    }
  }
}

/**
 * Singleton instances
 */
export const requestDeduplicator = new RequestDeduplicator();
export const rateLimiter = new RateLimiter(100, 10); // 100 tokens max, 10/sec refill
