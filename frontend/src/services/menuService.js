import api from './api';

// GET /api/menu/all
// returns list of all menu items
export const getAllItems = async () => {
    try {
        const response = await api.get('/menu/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
};

// GET /api/menu/item?id=1
export const getItemById = async (id) => {
    try {
        const response = await api.get(`/menu/item?id=${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching menu item:', error);
        return null;
    }
};

// GET /api/menu/category?categoryId=1
export const getItemsByCategory = async (categoryId) => {
    try {
        const response = await api.get(`/menu/category?categoryId=${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching items by category:', error);
        return [];
    }
};

// POST /api/menu/add
export const addItem = async (itemData) => {
    try {
        const response = await api.post('/menu/add', itemData);
        return response.data;
    } catch (error) {
        console.error('Error adding menu item:', error);
        return { status: 'error', message: 'Failed to add item' };
    }
};

// PUT /api/menu/update
export const updateItem = async (itemData) => {
    try {
        const response = await api.put('/menu/update', itemData);
        return response.data;
    } catch (error) {
        console.error('Error updating menu item:', error);
        return { status: 'error', message: 'Failed to update item' };
    }
};

// PUT /api/menu/toggle?id=1&status=false
export const toggleAvailability = async (id, status) => {
    try {
        const response = await api.put(`/menu/toggle?id=${id}&status=${status}`);
        return response.data;
    } catch (error) {
        console.error('Error toggling availability:', error);
        return { status: 'error', message: 'Failed to toggle availability' };
    }
};

// DELETE /api/menu/delete?id=1
export const deleteItem = async (id) => {
    try {
        const response = await api.delete(`/menu/delete?id=${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return { status: 'error', message: 'Failed to delete item' };
    }
};