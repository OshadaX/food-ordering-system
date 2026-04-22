import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems, deleteItem, toggleAvailability } from '../../services/menuService';
import { getAllCategories } from '../../services/categoryService';

export default function AdminMenuList() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

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
        const confirmed = window.confirm('Are you sure you want to delete this item?');
        if (!confirmed) return;
        const result = await deleteItem(id);
        if (result.status === 'success') {
            showMessage('Item deleted successfully', 'success');
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-gray-500">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm">Loading menu items...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pt-32 px-8 pb-32 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                    <p className="text-gray-500 mt-1">Manage your restaurant's menu items</p>
                </div>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition"
                    onClick={() => navigate('/admin/menu/add')}
                >
                    + Add New Item
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                    messageType === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {messageType === 'success' ? '✅' : '⚠️'} {message}
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <span className="text-5xl mb-4 block">🍽️</span>
                    <p className="text-gray-400">No menu items yet. Add your first item!</p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5 text-sm text-gray-400 font-mono">{index + 1}</td>
                                    <td className="px-6 py-5 text-sm font-bold text-gray-900">{item.name}</td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm px-2 py-1 bg-blue-50 text-blue-600 rounded font-medium border border-blue-100">
                                            {categories.find(c => c.id === item.categoryId)?.name || `Category ${item.categoryId}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500 max-w-xs truncate">
                                        {item.description}
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-gray-900">
                                        Rs. {item.price}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold border ${
                                            item.available 
                                                ? 'bg-green-50 text-green-700 border-green-100' 
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                            {item.available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-semibold transition"
                                                onClick={() => navigate(`/admin/menu/edit/${item.id}`)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={`px-3 py-1 rounded text-sm font-semibold transition ${
                                                    item.available 
                                                        ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200' 
                                                        : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                                                }`}
                                                onClick={() => handleToggle(item.id, item.available)}
                                            >
                                                {item.available ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm font-semibold border border-red-200 transition"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
