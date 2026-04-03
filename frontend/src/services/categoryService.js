import api from './api';

// GET /api/category/all
export const getAllCategories = async () => {
    try {
        const response = await api.get('/category/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

// POST /api/category/add
export const addCategory = async (categoryData) => {
    try {
        const response = await api.post('/category/add', categoryData);
        return response.data;
    } catch (error) {
        console.error('Error adding category:', error);
        return { status: 'error', message: 'Failed to add category' };
    }
};
