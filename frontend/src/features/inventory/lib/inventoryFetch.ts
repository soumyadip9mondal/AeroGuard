import { API_URL } from '@/lib/api';

/**
 * Localized fetch client for the Inventory module.
 * Directs requests to the backend and attaches the JWT token from localStorage.
 */
export async function inventoryFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const apiIndex = url.indexOf('/api/');
  const path = apiIndex !== -1 ? url.substring(apiIndex) : url;
  const backendUrl = `${API_URL}${path}`;

  return fetch(backendUrl, { ...options, headers });
}
