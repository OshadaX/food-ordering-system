import axios from 'axios'

const api = axios.create({
  baseURL: '/food-ordering/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// attach token to every request if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api