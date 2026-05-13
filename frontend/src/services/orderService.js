import api from './api'

export const placeOrder = async (orderData) => {
  try {
    const response = await api.post('/order/place', orderData)
    return response.data
  } catch (error) {
    console.error('Error placing order:', error)
    return { status: 'error', message: error.response?.data?.message || 'Failed to place order' }
  }
}

export const getCustomerOrders = async () => {
  try {
    const response = await api.get('/order/my')
    return response.data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/order/item?id=${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}
