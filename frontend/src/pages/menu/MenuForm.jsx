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
        categoryId: 1,
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
        
        // Robust Frontend Validation
        if (!formData.name.trim()) {
            setError('Dish name is required.');
            return;
        }
        if (formData.name.length > 50) {
            setError('Dish name is too long (maximum 50 characters).');
            return;
        }
        if (!formData.categoryId) {
            setError('Please select a category for this dish.');
            return;
        }
        if (!formData.price || formData.price <= 0) {
            setError('Price must be a positive number. Negative prices are not allowed.');
            return;
        }
        if (formData.description && formData.description.length > 200) {
            setError('Description is too long (maximum 200 characters).');
            return;
        }

        setLoading(true);
        
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            categoryId: parseInt(formData.categoryId, 10),
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
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-on-surface-variant font-medium">Fetching dish details...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="pt-32 pb-24 px-8 lg:px-16 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <button 
                        onClick={() => navigate('/admin/menu')}
                        className="group flex items-center text-on-surface-variant hover:text-primary transition-colors mb-6 font-bold text-sm"
                    >
                        <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Back to Menu Management
                    </button>
                    <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-2">
                        {isEditMode ? 'Edit Masterpiece' : 'Create New Dish'}
                    </h1>
                    <p className="text-on-surface-variant opacity-60">
                        {isEditMode ? 'Update the details for this culinary creation.' : 'Introduce a new flavor to your curated collection.'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Preview Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <p className="text-xs font-black uppercase tracking-widest text-primary mb-4">Live Preview</p>
                            <div className="bg-surface-container-high rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black/40">
                                <div className="h-48 bg-surface-container relative">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                                            <span className="material-symbols-outlined text-6xl">image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-primary font-bold text-sm border border-white/10">
                                        Rs. {formData.price || '0.00'}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-on-surface mb-2 truncate">{formData.name || 'Dish Name'}</h3>
                                    <p className="text-sm text-on-surface-variant opacity-70 line-clamp-2">
                                        {formData.description || 'Provide a compelling description for your dish...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-surface-container-low rounded-[2.5rem] p-8 lg:p-12 border border-white/5 shadow-xl">
                            {error && (
                                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                    <span className="material-symbols-outlined">error</span>
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    {/* Name Field */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-on-surface mb-3 ml-1">Dish Name <span className="text-primary">*</span></label>
                                        <input 
                                            type="text" 
                                            id="name" 
                                            name="name"
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            className="w-full bg-surface-container-lowest border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/50 text-on-surface outline-none transition-all"
                                            placeholder="e.g. Truffle Glazed Salmon"
                                            required 
                                        />
                                    </div>

                                    {/* Description Field */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-bold text-on-surface mb-3 ml-1">Description</label>
                                        <textarea 
                                            id="description" 
                                            name="description"
                                            rows="4" 
                                            value={formData.description} 
                                            onChange={handleChange}
                                            className="w-full bg-surface-container-lowest border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/50 text-on-surface outline-none transition-all resize-none"
                                            placeholder="Describe the flavors, ingredients, and preparation..."
                                        ></textarea>
                                    </div>

                                    {/* Price & Category */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-bold text-on-surface mb-3 ml-1">Price (Rs.) <span className="text-primary">*</span></label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    min="0"
                                                    id="price" 
                                                    name="price"
                                                    value={formData.price} 
                                                    onChange={handleChange} 
                                                    className="w-full bg-surface-container-lowest border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-primary/50 text-on-surface outline-none transition-all"
                                                    placeholder="0.00"
                                                    required 
                                                />
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/50 font-bold">Rs.</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="categoryId" className="block text-sm font-bold text-on-surface mb-3 ml-1">Category <span className="text-primary">*</span></label>
                                            <select 
                                                id="categoryId" 
                                                name="categoryId"
                                                value={formData.categoryId} 
                                                onChange={handleChange} 
                                                className="w-full bg-surface-container-lowest border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/50 text-on-surface outline-none transition-all appearance-none cursor-pointer"
                                                required 
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id} className="bg-surface-container-lowest">
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Image URL */}
                                    <div>
                                        <label htmlFor="imageUrl" className="block text-sm font-bold text-on-surface mb-3 ml-1">Image URL</label>
                                        <input 
                                            type="text" 
                                            id="imageUrl" 
                                            name="imageUrl"
                                            value={formData.imageUrl} 
                                            onChange={handleChange} 
                                            className="w-full bg-surface-container-lowest border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/50 text-on-surface outline-none transition-all"
                                            placeholder="Paste Unsplash image ID or full URL"
                                        />
                                    </div>

                                    {/* Availability */}
                                    <div className="flex items-center gap-4 p-6 bg-surface-container-lowest border border-white/5 rounded-3xl">
                                        <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer" onClick={() => handleChange({ target: { name: 'available', type: 'checkbox', checked: !formData.available }})}>
                                            <div className={`absolute h-4 w-4 rounded-full bg-white transition-transform ${formData.available ? 'translate-x-6' : 'translate-x-1'} ${formData.available ? 'bg-primary' : 'bg-on-surface-variant/30'}`}></div>
                                            <div className={`h-full w-full rounded-full transition-colors ${formData.available ? 'bg-primary/40' : 'bg-surface-container-high'}`}></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-on-surface">Available for Order</p>
                                            <p className="text-xs text-on-surface-variant opacity-60">Toggle to show/hide this dish from the public menu.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-grow bg-primary text-on-primary font-black px-8 py-5 rounded-[1.5rem] hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                                                Refining...
                                            </span>
                                        ) : (
                                            isEditMode ? 'Update Masterpiece' : 'Publish Dish'
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => navigate('/admin/menu')}
                                        disabled={loading}
                                        className="px-8 py-5 bg-surface-container-high text-on-surface rounded-[1.5rem] font-bold hover:bg-surface-variant transition-all active:scale-95 border border-white/5 disabled:opacity-50"
                                    >
                                        Discard Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
