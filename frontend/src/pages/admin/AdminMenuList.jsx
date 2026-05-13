import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems, deleteItem, toggleAvailability } from '../../services/menuService';
import { getAllCategories } from '../../services/categoryService';

export default function AdminMenuList() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const [itemsData, catsData] = await Promise.all([
            getAllItems(),
            getAllCategories()
        ]);
        setItems(itemsData);
        setCategories(catsData);
        setLoading(false);
    };

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this masterpiece?');
        if (!confirmed) return;
        const result = await deleteItem(id);
        if (result.status === 'success') {
            showMessage('Item removed from collection', 'success');
            setItems(items.filter(item => item.id !== id));
        } else {
            showMessage(result.message, 'error');
        }
    };

    const handleToggle = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        const result = await toggleAvailability(id, newStatus);
        if (result.status === 'success') {
            setItems(items.map(item =>
                item.id === id ? { ...item, available: newStatus } : item
            ));
        } else {
            showMessage(result.message, 'error');
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (categories.find(c => c.id === item.categoryId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery, categories]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen pt-24">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-on-surface-variant font-medium">Synchronizing menu data...</p>
        </div>
    );

    return (
        <main className="pt-32 pb-24 px-8 lg:px-16 min-h-screen bg-surface">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-2">Menu Management</h1>
                        <p className="text-on-surface-variant opacity-60">Curate and oversee your restaurant's culinary offerings.</p>
                    </div>
                    <button
                        className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 self-start md:self-center"
                        onClick={() => navigate('/admin/menu/add')}
                    >
                        <span className="material-symbols-outlined">add</span>
                        New Dish
                    </button>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
                        messageType === 'success' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        <span className="material-symbols-outlined">{messageType === 'success' ? 'check_circle' : 'error'}</span>
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}

                {/* Search & Filter Bar */}
                <div className="mb-8 relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
                    <input 
                        type="text" 
                        placeholder="Filter by name or category..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/30 font-medium"
                    />
                </div>

                {/* Menu Table */}
                <div className="bg-surface-container-low rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-8 py-6 text-xs font-black text-on-surface-variant uppercase tracking-widest">Dish</th>
                                    <th className="px-8 py-6 text-xs font-black text-on-surface-variant uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-6 text-xs font-black text-on-surface-variant uppercase tracking-widest">Price</th>
                                    <th className="px-8 py-6 text-xs font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <span className="text-5xl mb-4 block">🔍</span>
                                            <p className="text-on-surface-variant font-medium">No dishes found matching your search.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden border border-white/10 shrink-0">
                                                        <img 
                                                            src={item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `https://images.unsplash.com/${item.imageUrl}?q=80&w=100&auto=format&fit=crop`) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'} 
                                                            alt="" 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-on-surface leading-none mb-1">{item.name}</p>
                                                        <p className="text-xs text-on-surface-variant opacity-60 line-clamp-1 max-w-[200px]">{item.description || 'No description provided.'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="inline-flex px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black border border-primary/20">
                                                    {categories.find(c => c.id === item.categoryId)?.name || `Category ${item.categoryId}`}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-on-surface font-mono">Rs. {item.price.toFixed(2)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500 animate-pulse' : 'bg-on-surface-variant/30'}`}></div>
                                                    <span className={`text-xs font-bold ${item.available ? 'text-green-500' : 'text-on-surface-variant/50'}`}>
                                                        {item.available ? 'Live' : 'Hidden'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        title="Edit Dish"
                                                        className="w-10 h-10 flex items-center justify-center bg-surface-container-high hover:bg-primary/20 hover:text-primary text-on-surface-variant rounded-xl transition-all"
                                                        onClick={() => navigate(`/admin/menu/edit/${item.id}`)}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        title={item.available ? 'Hide from Menu' : 'Show on Menu'}
                                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                                                            item.available 
                                                                ? 'bg-surface-container-high hover:bg-yellow-500/20 hover:text-yellow-500 text-on-surface-variant' 
                                                                : 'bg-surface-container-high hover:bg-green-500/20 hover:text-green-500 text-on-surface-variant'
                                                        }`}
                                                        onClick={() => handleToggle(item.id, item.available)}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            {item.available ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                    <button
                                                        title="Delete Dish"
                                                        className="w-10 h-10 flex items-center justify-center bg-surface-container-high hover:bg-red-500/20 hover:text-red-500 text-on-surface-variant rounded-xl transition-all"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
