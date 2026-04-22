import React, { useState, useEffect } from 'react';
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '../../services/categoryService';

function AdminCategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const data = await getAllCategories();
        setCategories(data);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newCategoryName.trim()) {
            setError("Category name cannot be empty");
            return;
        }

        const res = await addCategory({ name: newCategoryName });
        if (res.status === 'success') {
            setNewCategoryName('');
            setShowForm(false);
            fetchCategories();
        } else {
            setError(res.message || 'Failed to add category');
        }
    };

    const handleEditStart = (cat) => {
        setEditId(cat.id);
        setEditName(cat.name);
    };

    const handleEditCancel = () => {
        setEditId(null);
        setEditName('');
    };

    const handleUpdate = async (id) => {
        if (!editName.trim()) return;
        const res = await updateCategory({ id, name: editName });
        if (res.status === 'success') {
            setEditId(null);
            fetchCategories();
        } else {
            alert(res.message || 'Failed to update');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will uncategorize items in this category.')) return;
        const res = await deleteCategory(id);
        if (res.status === 'success') {
            fetchCategories();
        } else {
            alert(res.message || 'Failed to delete');
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-600">Loading categories...</div>;

    return (
        <div className="max-w-4xl mx-auto pt-32 px-8 pb-32 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
                <button 
                    className={`px-4 py-2 rounded font-semibold text-white transition ${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Category'}
                </button>
            </div>

            {showForm && (
                <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded">
                    <form onSubmit={handleAdd}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. Beverages"
                                autoFocus
                            />
                        </div>
                        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
                        <div className="flex gap-3">
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">Save Category</button>
                            <button type="button" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50" onClick={() => { setShowForm(false); setError(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-left text-xs uppercase tracking-wider font-semibold">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                                    No categories found. Add one above.
                                </td>
                            </tr>
                        ) : (
                            categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-4 text-sm text-gray-500">{cat.id}</td>
                                    <td className="px-4 py-4 text-sm">
                                        {editId === cat.id ? (
                                            <input 
                                                type="text" 
                                                className="w-full px-2 py-1 border border-blue-400 rounded outline-none"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="font-bold text-gray-900">{cat.name}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {editId === cat.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(cat.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold">Save</button>
                                                    <button onClick={handleEditCancel} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold">Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditStart(cat)} className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs font-bold border border-blue-100 transition">Edit</button>
                                                    <button onClick={() => handleDelete(cat.id)} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-bold border border-red-100 transition">Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminCategoryList;
