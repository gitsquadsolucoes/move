import { z } from 'zod';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HttpClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}

interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  cache?: RequestCache;
  signal?: AbortSignal;
}

interface HttpError extends Error {
  status?: number;
  data?: any;
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.defaultTimeout = config.timeout || 30000;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: HttpError = new Error(response.statusText);
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        error.data = await response.text();
      }
      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private createAbortController(timeout?: number): AbortController {
    const controller = new AbortController();
    const timeoutMs = timeout || this.defaultTimeout;

    setTimeout(() => controller.abort(), timeoutMs);

    return controller;
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    const controller = this.createAbortController(config.timeout);

    try {
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          ...this.defaultHeaders,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        cache: config.cache,
        signal: config.signal || controller.signal,
        credentials: 'include',
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.defaultTimeout}ms`);
        }
      }
      throw error;
    }
  }

  public async get<T>(path: string, config: Omit<RequestConfig, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  public async post<T>(path: string, data?: any, config: Omit<RequestConfig, 'method'> = {}) {
    return this.request<T>(path, { ...config, method: 'POST', body: data });
  }

  public async put<T>(path: string, data?: any, config: Omit<RequestConfig, 'method'> = {}) {
    return this.request<T>(path, { ...config, method: 'PUT', body: data });
  }

  public async patch<T>(path: string, data?: any, config: Omit<RequestConfig, 'method'> = {}) {
    return this.request<T>(path, { ...config, method: 'PATCH', body: data });
  }

  public async delete<T>(path: string, config: Omit<RequestConfig, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }

  // Método utilitário para validar respostas com Zod
  public async getValidated<T>(
    path: string,
    schema: z.ZodType<T>,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<T> {
    const data = await this.get(path, config);
    return schema.parse(data);
  }
}
