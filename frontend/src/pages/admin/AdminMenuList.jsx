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

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.pageTitle}>Menu Management</h1>
                    <p style={styles.pageSubtitle}>Manage your restaurant's menu items</p>
                </div>
                <button
                    style={styles.addBtn}
                    onClick={() => navigate('/admin/menu/add')}
                >
                    + Add New Item
                </button>
            </div>

            {message && (
                <div style={{
                    ...styles.toast,
                    background: messageType === 'success'
                        ? 'rgba(34, 197, 94, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                    borderColor: messageType === 'success'
                        ? 'rgba(34, 197, 94, 0.4)'
                        : 'rgba(239, 68, 68, 0.4)',
                    color: messageType === 'success' ? '#86efac' : '#fca5a5',
                }}>
                    {messageType === 'success' ? '✅' : '⚠️'} {message}
                </div>
            )}

            {loading && (
                <div style={styles.center}>
                    <div style={styles.spinner} />
                    <p style={styles.loadingText}>Loading menu items...</p>
                </div>
            )}

            {!loading && items.length === 0 && (
                <div style={styles.center}>
                    <span style={{ fontSize: '48px' }}>🍽️</span>
                    <p style={styles.emptyText}>No menu items yet. Add your first item!</p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thead}>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Category</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Price</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} style={styles.tr}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={{ ...styles.td, fontWeight: '600', color: '#fff' }}>{item.name}</td>
                                    <td style={{ ...styles.td, color: '#f97316' }}>
                                        {categories.find(c => c.id === item.categoryId)?.name || `Category ${item.categoryId}`}
                                    </td>
                                    <td style={{ ...styles.td, color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                                        {item.description?.slice(0, 60)}{item.description?.length > 60 ? '...' : ''}
                                    </td>
                                    <td style={{ ...styles.td, color: '#f97316', fontWeight: '700' }}>
                                        Rs. {item.price}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            background: item.available
                                                ? 'rgba(34,197,94,0.15)'
                                                : 'rgba(107,114,128,0.2)',
                                            color: item.available ? '#86efac' : '#9ca3af',
                                            border: `1px solid ${item.available ? 'rgba(34,197,94,0.3)' : 'rgba(107,114,128,0.3)'}`,
                                        }}>
                                            {item.available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                style={styles.editBtn}
                                                onClick={() => navigate(`/admin/menu/edit/${item.id}`)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                style={item.available ? styles.warnBtn : styles.successBtn}
                                                onClick={() => handleToggle(item.id, item.available)}
                                            >
                                                {item.available ? '🔒 Disable' : '✅ Enable'}
                                            </button>
                                            <button
                                                style={styles.deleteBtn}
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                🗑️ Delete
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

const btnBase = {
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
};

const styles = {
    page: {
        padding: '32px',
        fontFamily: "'Inter', sans-serif",
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    pageTitle: {
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '700',
        margin: 0,
    },
    pageSubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '14px',
        margin: '4px 0 0 0',
    },
    addBtn: {
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    toast: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid',
        fontSize: '14px',
        marginBottom: '24px',
    },
    center: {
        textAlign: 'center',
        padding: '60px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #f97316',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '14px',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '16px',
    },
    tableWrap: {
        overflowX: 'auto',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        background: 'rgba(255,255,255,0.03)',
    },
    thead: {
        background: 'rgba(255,255,255,0.06)',
    },
    th: {
        padding: '14px 16px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        textAlign: 'left',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    tr: {
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    td: {
        padding: '14px 16px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
        verticalAlign: 'middle',
    },
    badge: {
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    actions: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    editBtn: {
        ...btnBase,
        background: 'rgba(99, 102, 241, 0.2)',
        color: '#a5b4fc',
    },
    warnBtn: {
        ...btnBase,
        background: 'rgba(234, 179, 8, 0.15)',
        color: '#fde047',
    },
    successBtn: {
        ...btnBase,
        background: 'rgba(34, 197, 94, 0.15)',
        color: '#86efac',
    },
    deleteBtn: {
        ...btnBase,
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#fca5a5',
    },
};
