import React, { useState, useEffect } from 'react';
import { getAllCategories, addCategory } from '../../services/categoryService';

function AdminCategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState(null);

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

    const styles = {
        container: { maxWidth: '800px', margin: '40px auto', padding: '20px', background: '#1e1e1e', color: '#fff', borderRadius: '12px' },
        headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
        title: { fontSize: '24px', fontWeight: 'bold' },
        addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
        th: { textAlign: 'left', padding: '12px', borderBottom: '1px solid #333', color: '#9ca3af' },
        td: { padding: '12px', borderBottom: '1px solid #2d2d2d' },
        formCard: { background: '#2d2d2d', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
        inputGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '8px', color: '#ccc' },
        input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1e1e1e', color: '#fff' },
        btnRow: { display: 'flex', gap: '10px', marginTop: '15px' },
        cancelBtn: { padding: '10px 16px', background: 'transparent', border: '1px solid #555', color: '#ccc', borderRadius: '6px', cursor: 'pointer' },
        submitBtn: { padding: '10px 16px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        errorMsg: { color: '#ef4444', marginBottom: '10px' }
    };

    if (loading) return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading categories...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h1 style={styles.title}>Manage Categories</h1>
                <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Category'}
                </button>
            </div>

            {showForm && (
                <div style={styles.formCard}>
                    <form onSubmit={handleAdd}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Category Name</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                style={styles.input}
                                placeholder="e.g. Beverages"
                                autoFocus
                            />
                        </div>
                        {error && <div style={styles.errorMsg}>{error}</div>}
                        <div style={styles.btnRow}>
                            <button type="submit" style={styles.submitBtn}>Save Category</button>
                            <button type="button" style={styles.cancelBtn} onClick={() => { setShowForm(false); setError(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                No categories found. Add one above.
                            </td>
                        </tr>
                    ) : (
                        categories.map(cat => (
                            <tr key={cat.id}>
                                <td style={styles.td}>{cat.id}</td>
                                <td style={styles.td}><strong>{cat.name}</strong></td>
                                <td style={styles.td}>{new Date(cat.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AdminCategoryList;
