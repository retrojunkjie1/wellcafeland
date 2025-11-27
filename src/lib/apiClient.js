/**
 * API Client for WellnessCafe OS
 * Configured to connect to server endpoints with automatic error handling and loading states
 */

import { getAnonymousUserId } from "./userId";
import { auth } from "../firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
    this.loadingStates = new Map()
  }

  /**
   * Get loading state for a specific endpoint
   */
  isLoading(endpoint) {
    return this.loadingStates.get(endpoint) || false
  }

  /**
   * Set loading state for an endpoint
   */
  setLoading(endpoint, isLoading) {
    this.loadingStates.set(endpoint, isLoading)
    // Trigger a custom event for components to listen to
    window.dispatchEvent(new CustomEvent('api-loading', { 
      detail: { endpoint, isLoading } 
    }))
  }

  /**
   * Core request method with error handling and loading states
   * Automatically includes anonymous user ID in all requests
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    // Use Firebase Auth UID if available, otherwise fall back to anonymous ID
    const userId = auth?.currentUser?.uid || getAnonymousUserId();
    
    // Extract body if it exists and merge userId
    let body = options.body;
    if (body) {
      try {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        body = JSON.stringify({ userId, ...parsed });
      } catch {
        // If body isn't JSON, wrap it
        body = JSON.stringify({ userId, data: body });
      }
    } else {
      // If no body, create one with userId
      body = JSON.stringify({ userId });
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      body,
    }

    // Set loading state
    this.setLoading(endpoint, true)

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
        }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      
      // Dispatch error event for global error handling
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: { endpoint, error: error.message }
      }))
      
      throw error
    } finally {
      // Clear loading state
      this.setLoading(endpoint, false)
    }
  }

  // AI Session endpoints
  async getSessions() {
    return this.request('/aiSession')
  }

  async getSession(id) {
    return this.request(`/aiSession/${id}`)
  }

  async createSession(data) {
    return this.request('/aiSession', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSession(id, data) {
    return this.request(`/aiSession/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSession(id) {
    return this.request(`/aiSession/${id}`, {
      method: 'DELETE',
    })
  }

  // AI Media endpoints
  async getMedia() {
    return this.request('/aiMedia')
  }

  async getMediaItem(id) {
    return this.request(`/aiMedia/${id}`)
  }

  async createMedia(data) {
    return this.request('/aiMedia', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMedia(id, data) {
    return this.request(`/aiMedia/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMedia(id) {
    return this.request(`/aiMedia/${id}`, {
      method: 'DELETE',
    })
  }

  // AI Template endpoints
  async getTemplates() {
    return this.request('/aiTemplate')
  }

  async getTemplate(id) {
    return this.request(`/aiTemplate/${id}`)
  }

  async createTemplate(data) {
    return this.request('/aiTemplate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTemplate(id, data) {
    return this.request(`/aiTemplate/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTemplate(id) {
    return this.request(`/aiTemplate/${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()
export default apiClient

