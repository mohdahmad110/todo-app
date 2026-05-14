const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API request failed')
    }

    return response.json()
  },

  // Auth endpoints
  signup(email: string, password: string, name?: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  },

  login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  verifyOtp(email: string, otp: string) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
  },

  forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  resetPassword(email: string, otp: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    })
  },

  refreshToken(refreshToken: string) {
    return this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  },

  // Todos endpoints
  getTodos() {
    return this.request('/todos', { method: 'GET' })
  },

  getTodoById(id: string) {
    return this.request(`/todos/${id}`, { method: 'GET' })
  },

  createTodo(title: string, description?: string) {
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    })
  },

  updateTodo(id: string, title?: string, description?: string, completed?: boolean) {
    return this.request(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description, completed }),
    })
  },

  deleteTodo(id: string) {
    return this.request(`/todos/${id}`, { method: 'DELETE' })
  },
}
