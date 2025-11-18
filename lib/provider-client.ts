import axios, { AxiosRequestConfig } from 'axios';

export interface ProviderConfig {
  apiUrl: string;
  apiKey?: string;
  apiSecret?: string;
  authenticationType: 'bearer' | 'api_key' | 'oauth' | 'basic';
  requestsPerMinute: number;
}

export class ProviderClient {
  private config: ProviderConfig;
  private requestCount: number = 0;
  private lastResetTime: Date = new Date();

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  // Rate limiting check
  private async checkRateLimit(): Promise<boolean> {
    const now = new Date();
    const timeDiff = (now.getTime() - this.lastResetTime.getTime()) / 1000 / 60;

    if (timeDiff >= 1) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= this.config.requestsPerMinute) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  // Get authorization header
  private getAuthHeader(): { [key: string]: string } {
    const headers: { [key: string]: string } = {};

    switch (this.config.authenticationType) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        break;
      case 'api_key':
        headers['X-API-Key'] = this.config.apiKey || '';
        break;
      case 'basic':
        const credentials = Buffer.from(
          `${this.config.apiKey}:${this.config.apiSecret}`
        ).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      case 'oauth':
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        break;
    }

    return headers;
  }

  // Fetch accounts from external API
  async fetchAccounts(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<any[]> {
    try {
      // Check rate limit
      const canRequest = await this.checkRateLimit();
      if (!canRequest) {
        throw new Error('Rate limit exceeded');
      }

      const config: AxiosRequestConfig = {
        headers: this.getAuthHeader(),
        params,
      };

      const url = `${this.config.apiUrl}${endpoint}`;
      const response = await axios.get(url, config);

      return response.data;
    } catch (error) {
      console.error('Fetch accounts error:', error);
      throw error;
    }
  }

  // Post data to external API
  async postData(
    endpoint: string,
    data: Record<string, any>
  ): Promise<any> {
    try {
      const canRequest = await this.checkRateLimit();
      if (!canRequest) {
        throw new Error('Rate limit exceeded');
      }

      const config: AxiosRequestConfig = {
        headers: this.getAuthHeader(),
      };

      const url = `${this.config.apiUrl}${endpoint}`;
      const response = await axios.post(url, data, config);

      return response.data;
    } catch (error) {
      console.error('Post data error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const config: AxiosRequestConfig = {
        headers: this.getAuthHeader(),
        timeout: 5000,
      };

      await axios.get(`${this.config.apiUrl}/health`, config);
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}
