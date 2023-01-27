import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from 'axios';

export enum HttpStatusCodes {
  Ok = 200,
  BadRequest = 400,
  Forbidden = 403,
}

export async function get(url: string, options?: AxiosRequestConfig): Promise<any> {
  const headers = options?.headers as RawAxiosRequestHeaders | undefined;
  const response: AxiosResponse = await axios.get(url, {
    ...options,
    headers: { ...headers, Pragma: 'no-cache' },
  });
  return response.data ? response.data : null;
}

export async function post(url: string, options?: AxiosRequestConfig, data?: any): Promise<AxiosResponse> {
  return await axios.post(url, data, options);
}

/**
 * A basic 'put', since the other 'put' expects apiMode to always be present in URL, and 'putWithoutConfig' wraps errors
 * and does not accept data (or config, even if you have it).
 * @see put
 * @see putWithoutConfig
 */
export async function basicPut(url: string, data: any, config?: AxiosRequestConfig): Promise<void> {
  const response = await axios.put(url, data, config);
  return response.data;
}

export async function put(
  url: string,
  apiMode: string,
  data: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse> {
  const response: AxiosResponse = await axios.put(`${url}/${apiMode}`, data, config);
  return response.data ? response.data : null;
}

export async function httpDelete(url: string, options?: AxiosRequestConfig): Promise<AxiosResponse> {
  return await axios.delete(url, options);
}

export async function putWithoutConfig<ReturnType>(url: string): Promise<AxiosResponse<ReturnType>> {
  try {
    const response = await axios.put(url);
    return response.data ? response.data : null;
  } catch (err) {
    throw new Error(`HTTP Call failed: ${err.message}`);
  }
}

export function isAxiosError(error: Error | null | undefined): error is AxiosError {
  return (error as AxiosError)?.config !== undefined;
}
