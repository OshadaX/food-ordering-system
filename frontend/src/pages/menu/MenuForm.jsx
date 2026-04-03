import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getItemById, addItem, updateItem } from '../../services/menuService';
import { getAllCategories } from '../../services/categoryService';

export default function MenuForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        categoryId: 1, // Defaulting category to 1
        available: true
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategoriesList();
        if (isEditMode) {
            fetchItemDetails();
        }
    }, [id]);

    const fetchCategoriesList = async () => {
        const data = await getAllCategories();
        setCategories(data);
        if (data.length > 0 && !isEditMode) {
            setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
    };

    const fetchItemDetails = async () => {
        setLoading(true);
        const data = await getItemById(id);
        if (data) {
            setFormData({
                name: data.name || '',
                description: data.description || '',
                price: data.price || '',
                imageUrl: data.imageUrl || '',
                categoryId: data.categoryId || 1,
                available: data.available !== undefined ? data.available : true
            });
        } else {
            setError('Failed to load item details.');
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Basic validation
        if (!formData.name || !formData.price || !formData.categoryId) {
            setError('Please fill in all required fields (Name, Price, Category ID).');
            return;
        }

        setLoading(true);
        
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            categoryId: parseInt(formData.categoryId, 10),
            // Ensure available property matches Java boolean property (which is typically mapped to `isAvailable` but serialized as `available` via Gson by default if boolean, let's see MenuService.java: the field is boolean isAvailable, boolean getter is isAvailable, Jackson outputs `available` usually, Gson would produce `isAvailable` unless @SerializedName is used. Let's send both just to be safe or investigate. Actually our list uses `item.available`).
            available: formData.available,
            isAvailable: formData.available 
        };

        if (isEditMode) {
            payload.id = parseInt(id, 10);
            const result = await updateItem(payload);
            if (result.status === 'success') {
                navigate('/admin/menu');
            } else {
                setError(result.message || 'Failed to update item.');
                setLoading(false);
            }
        } else {
            const result = await addItem(payload);
            if (result.status === 'success') {
                navigate('/admin/menu');
            } else {
                setError(result.message || 'Failed to add item.');
                setLoading(false);
            }
        }
    };

    if (loading && isEditMode) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" />
                <p className="mt-2">Loading item details...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white pb-0 pt-3 border-0">
                            <h3>{isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                        </div>
                        <div className="card-body">
                            
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Item Name *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="name" 
                                        name="name"
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea 
                                        className="form-control" 
                                        id="description" 
                                        name="description"
                                        rows="3" 
                                        value={formData.description} 
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="price" className="form-label">Price (Rs.) *</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="form-control" 
                                            id="price" 
                                            name="price"
                                            value={formData.price} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="categoryId" className="form-label">Category *</label>
                                        <select 
                                            className="form-select" 
                                            id="categoryId" 
                                            name="categoryId"
                                            value={formData.categoryId} 
                                            onChange={handleChange} 
                                            required 
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="imageUrl" className="form-label">Image URL</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="imageUrl" 
                                        name="imageUrl"
                                        value={formData.imageUrl} 
                                        onChange={handleChange} 
                                    />
                                </div>

                                <div className="mb-4 form-check text-start">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id="available" 
                                        name="available"
                                        checked={formData.available} 
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="available">
                                        Item is Available
                                    </label>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/admin/menu')}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            isEditMode ? 'Update Item' : 'Add Item'
                                        )}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
