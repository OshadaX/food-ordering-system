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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen pt-24">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-on-surface-variant font-medium">Loading categories...</p>
        </div>
    );

    return (
        <main className="pt-32 pb-24 px-8 lg:px-16 min-h-screen bg-surface">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-2">Category Studio</h1>
                        <p className="text-on-surface-variant opacity-60">Organize your menu into distinct culinary groups.</p>
                    </div>
                    <button 
                        className={`px-8 py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 self-start md:self-center ${
                            showForm 
                            ? 'bg-surface-container-high text-on-surface hover:bg-surface-variant' 
                            : 'bg-primary text-on-primary hover:bg-primary-container shadow-primary/20'
                        }`}
                        onClick={() => { setShowForm(!showForm); setError(null); }}
                    >
                        <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
                        {showForm ? 'Cancel' : 'New Category'}
                    </button>
                </div>

                {/* Add Category Form */}
                {showForm && (
                    <div className="mb-12 p-8 bg-surface-container-low border border-white/5 rounded-[2.5rem] shadow-xl animate-in fade-in slide-in-from-top-4">
                        <form onSubmit={handleAdd}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-on-surface mb-3 ml-1">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full bg-surface-container-lowest border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/50 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30 font-medium"
                                    placeholder="e.g. Signature Mains"
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <div className="mb-6 text-sm text-red-400 flex items-center gap-2 font-medium">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {error}
                                </div>
                            )}
                            <div className="flex gap-4">
                                <button type="submit" className="px-8 py-4 bg-primary text-on-primary rounded-xl hover:bg-primary-container font-black transition-all active:scale-95">Save Category</button>
                                <button type="button" className="px-8 py-4 bg-surface-container-high text-on-surface rounded-xl hover:bg-surface-variant font-bold transition-all active:scale-95" onClick={() => { setShowForm(false); setError(null); }}>Discard</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories Table */}
                <div className="bg-surface-container-low rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-8 py-6 text-xs font-black text-on-surface-variant uppercase tracking-widest w-24">ID</th>
                                    <th className="px-8 py-6 text-xs font-black text-on-surface-variant uppercase tracking-widest">Name</th>
                                    <th className="px-8 py-6 text-xs font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center">
                                            <span className="text-5xl mb-4 block">📂</span>
                                            <p className="text-on-surface-variant font-medium">No categories found. Create your first one!</p>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map(cat => (
                                        <tr key={cat.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-mono text-on-surface-variant opacity-50">#{cat.id}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {editId === cat.id ? (
                                                    <input 
                                                        type="text" 
                                                        className="w-full max-w-sm bg-surface-container-lowest border border-primary/50 rounded-xl px-4 py-2 text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="font-bold text-on-surface text-lg">{cat.name}</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {editId === cat.id ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleUpdate(cat.id)} 
                                                                className="px-6 py-2 bg-green-500/10 text-green-500 rounded-xl text-xs font-black hover:bg-green-500/20 transition-all border border-green-500/20"
                                                            >
                                                                Save
                                                            </button>
                                                            <button 
                                                                onClick={handleEditCancel} 
                                                                className="px-6 py-2 bg-surface-container-high text-on-surface-variant rounded-xl text-xs font-black hover:bg-surface-variant transition-all border border-white/5"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => handleEditStart(cat)} 
                                                                className="w-10 h-10 flex items-center justify-center bg-surface-container-high hover:bg-primary/20 hover:text-primary text-on-surface-variant rounded-xl transition-all"
                                                                title="Edit Category"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(cat.id)} 
                                                                className="w-10 h-10 flex items-center justify-center bg-surface-container-high hover:bg-red-500/20 hover:text-red-500 text-on-surface-variant rounded-xl transition-all"
                                                                title="Delete Category"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
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
            </div>
        </main>
    );
}

export default AdminCategoryList;
