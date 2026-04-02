import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems, deleteItem, toggleAvailability } from '../../services/menuService';

export default function MenuList() {

    const [items, setItems]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const data = await getAllItems();
        setItems(data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this item?');
        if (!confirmed) return;
        const result = await deleteItem(id);
        if (result.status === 'success') {
            setMessage('Item deleted successfully');
            setItems(items.filter(item => item.id !== id));
        } else {
            setMessage(result.message);
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
            setMessage(result.message);
        }
    };

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Menu Items</h2>
                <button
                    className="btn btn-success"
                    onClick={() => navigate('/menu/add')}
                >
                    + Add New Item
                </button>
            </div>

            {message && (
                <div className="alert alert-info alert-dismissible">
                    {message}
                    <button className="btn-close" onClick={() => setMessage('')} />
                </div>
            )}

            {loading && (
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Loading menu items...</p>
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="text-center mt-5">
                    <p className="text-muted">No menu items found. Add your first item!</p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {items.map(item => (
                        <div className="col" key={item.id}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <h5 className="card-title">{item.name}</h5>
                                        <span className={`badge ${item.available ? 'bg-success' : 'bg-secondary'}`}>
                                            {item.available ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <p className="card-text text-muted">{item.description}</p>
                                    <p className="card-text">
                                        <strong>Rs. {item.price}</strong>
                                    </p>
                                </div>
                                <div className="card-footer d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => navigate(`/menu/edit/${item.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={`btn btn-sm ${item.available ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        onClick={() => handleToggle(item.id, item.available)}
                                    >
                                        {item.available ? 'Mark Unavailable' : 'Mark Available'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}