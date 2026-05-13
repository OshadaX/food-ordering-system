import api from './api'

const fallback = (error, message) => {
  console.error(message, error)
  return { status: 'error', message }
}

export const getMyOrders = async () => {
  try {
    const response = await api.get('/tracking/my-orders')
    return response.data || []
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return []
  }
}

export const getTrackingDetails = async (orderId) => {
  try {
    const response = await api.get(`/tracking/status?orderId=${orderId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching tracking details:', error)
    return null
  }
}

export const getActiveOrders = async () => {
  try {
    const response = await api.get('/tracking/active')
    return response.data || []
  } catch (error) {
    console.error('Error fetching active orders:', error)
    return []
  }
}

export const getAllOrders = async () => {
  try {
    const response = await api.get('/tracking/all')
    return response.data || []
  } catch (error) {
    console.error('Error fetching all orders:', error)
    return []
  }
}

export const updateOrderStatus = async (orderId, status, note = '') => {
  try {
    const response = await api.put('/tracking/status', { orderId, status, note })
    return response.data
  } catch (error) {
    return fallback(error, error.response?.data?.message || 'Failed to update order status')
  }
}

export const cancelOrder = async (orderId, note = 'Cancelled by staff') => {
  try {
    const response = await api.put('/tracking/cancel', { orderId, note })
    return response.data
  } catch (error) {
    return fallback(error, error.response?.data?.message || 'Failed to cancel order')
  }
}

export const archiveOrder = async (orderId) => {
  try {
    const response = await api.delete(`/tracking/archive?orderId=${orderId}`)
    return response.data
  } catch (error) {
    return fallback(error, error.response?.data?.message || 'Failed to archive order')
  }
}

export const getNotifications = async () => {
  try {
    const response = await api.get('/tracking/notifications')
    return response.data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export const markNotificationsRead = async () => {
  try {
    const response = await api.put('/tracking/notifications/read')
    return response.data
  } catch (error) {
    return fallback(error, 'Failed to mark notifications as read')
  }
}
