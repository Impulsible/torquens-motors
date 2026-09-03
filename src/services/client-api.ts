/* eslint-disable @typescript-eslint/no-explicit-any */

// Client-safe API service - only uses fetch, no MongoDB imports
// Use this in client components instead of importing database directly

export const clientApi = {
  async getVehicles(filters: any = {}, page: number = 1, limit: number = 12) {
    const params = new URLSearchParams();
    if (filters.make) params.set('make', filters.make);
    if (filters.model) params.set('model', filters.model);
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    if (filters.bodyType) params.set('bodyType', filters.bodyType);
    if (filters.search) params.set('search', filters.search);
    if (filters.minYear) params.set('minYear', String(filters.minYear));
    if (filters.maxYear) params.set('maxYear', String(filters.maxYear));
    params.set('page', String(page));
    params.set('limit', String(limit));

    const response = await fetch(`/api/vehicles?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    return response.json();
  },

  async getVehicleById(id: string) {
    const response = await fetch(`/api/vehicles/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch vehicle');
    }
    return response.json();
  },

  async getFeaturedVehicles(limit: number = 6) {
    const response = await fetch(`/api/vehicles/featured?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured vehicles');
    }
    return response.json();
  },

  async searchVehicles(query: string, page: number = 1, limit: number = 12) {
    const params = new URLSearchParams();
    params.set('search', query);
    params.set('page', String(page));
    params.set('limit', String(limit));

    const response = await fetch(`/api/vehicles/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to search vehicles');
    }
    return response.json();
  },

  async getMakes() {
    const response = await fetch('/api/vehicles/makes');
    if (!response.ok) {
      throw new Error('Failed to fetch makes');
    }
    return response.json();
  },

  async getModels(make: string) {
    const response = await fetch(`/api/vehicles/models?make=${encodeURIComponent(make)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    return response.json();
  },

  async getStats() {
    const response = await fetch('/api/vehicles/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return response.json();
  },
};

export default clientApi;