import api from './api'

export async function getActiveOrders() {
  const { data } = await api.get('/tracking/active')
  return data
}

export async function getOrderTracking(orderId) {
  const { data } = await api.get(`/tracking/${orderId}`)
  return data
}

export async function createTrackingRecord(payload) {
  const { data } = await api.post('/tracking', payload)
  return data
}

export async function updateOrderStatus(orderId, payload) {
  const { data } = await api.put(`/tracking/${orderId}`, payload)
  return data
}
