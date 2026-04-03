import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllItems } from '../../services/menuService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function MenuList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addedId, setAddedId] = useState(null);

    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const data = await getAllItems();
        setItems(data.filter(item => item.available));
        setLoading(false);
    };

    const handleAddToCart = (item) => {
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(item);
        setAddedId(item.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    return (
        <div style={styles.page}>
            {/* Hero Section */}
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>🍔 Our Menu</h1>
                <p style={styles.heroSubtitle}>
                    Fresh, delicious meals delivered to your door
                </p>
                {!user && (
                    <div style={styles.heroCta}>
                        <Link to="/login" style={styles.ctaBtn}>Sign In to Order</Link>
                        <Link to="/register" style={styles.ctaBtnOutline}>Create Account</Link>
                    </div>
                )}
            </div>

            {loading && (
                <div style={styles.center}>
                    <div style={styles.spinner} />
                    <p style={styles.loadingText}>Loading menu...</p>
                </div>
            )}

            {!loading && items.length === 0 && (
                <div style={styles.center}>
                    <span style={{ fontSize: '48px' }}>🍽️</span>
                    <p style={styles.emptyText}>No items available right now</p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div style={styles.grid}>
                    {items.map(item => (
                        <div key={item.id} style={styles.card}>
                            <div style={styles.cardBody}>
                                <div style={styles.cardTop}>
                                    <h3 style={styles.itemName}>{item.name}</h3>
                                    <span style={styles.priceBadge}>Rs. {item.price}</span>
                                </div>
                                <p style={styles.itemDesc}>{item.description}</p>
                            </div>
                            <div style={styles.cardFooter}>
                                <button
                                    style={{
                                        ...styles.cartBtn,
                                        background: addedId === item.id
                                            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                            : 'linear-gradient(135deg, #f97316, #ea580c)',
                                    }}
                                    onClick={() => handleAddToCart(item)}
                                >
                                    {addedId === item.id ? '✅ Added!' : '🛒 Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0f172a',
        fontFamily: "'Inter', sans-serif",
        paddingBottom: '60px',
    },
    hero: {
        textAlign: 'center',
        padding: '60px 20px 40px',
        background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(15,52,96,0.3) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    heroTitle: {
        color: '#ffffff',
        fontSize: '42px',
        fontWeight: '800',
        margin: '0 0 12px 0',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '16px',
        margin: '0 0 28px 0',
    },
    heroCta: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    ctaBtn: {
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        color: '#fff',
        textDecoration: 'none',
        padding: '12px 28px',
        borderRadius: '10px',
        fontWeight: '700',
        fontSize: '15px',
    },
    ctaBtnOutline: {
        background: 'transparent',
        color: '#f97316',
        textDecoration: 'none',
        padding: '12px 28px',
        borderRadius: '10px',
        fontWeight: '700',
        fontSize: '15px',
        border: '2px solid #f97316',
    },
    center: {
        textAlign: 'center',
        padding: '80px 0',
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
    },
    loadingText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '15px',
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: '16px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        padding: '40px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    cardBody: {
        padding: '20px',
        flex: 1,
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '10px',
    },
    itemName: {
        color: '#ffffff',
        fontSize: '17px',
        fontWeight: '700',
        margin: 0,
        flex: 1,
    },
    priceBadge: {
        background: 'rgba(249,115,22,0.15)',
        color: '#f97316',
        border: '1px solid rgba(249,115,22,0.3)',
        borderRadius: '20px',
        padding: '4px 12px',
        fontSize: '14px',
        fontWeight: '700',
        whiteSpace: 'nowrap',
    },
    itemDesc: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: '13px',
        lineHeight: '1.5',
        margin: 0,
    },
    cardFooter: {
        padding: '0 20px 20px',
    },
    cartBtn: {
        width: '100%',
        border: 'none',
        borderRadius: '10px',
        padding: '11px',
        color: '#fff',
        fontWeight: '700',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background 0.3s',
    },
};