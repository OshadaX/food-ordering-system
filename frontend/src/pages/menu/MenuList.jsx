import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllItems } from '../../services/menuService';
import { getAllCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function MenuList() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
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
        const [itemsData, catsData] = await Promise.all([
            getAllItems(),
            getAllCategories()
        ]);
        setItems(itemsData.filter(item => item.available));
        setCategories(catsData);
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
        <main className="pt-24 pb-32">
            {/* Hero Section */}
            <section className="relative px-8 lg:px-16 mb-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="z-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary-container mr-2"></span>
                            <span className="text-xs font-bold tracking-widest uppercase text-primary">Michelin Star Delivery</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-on-surface mb-8 leading-[0.9]">
                            Your Cravings,<br /><span className="text-primary-container">Delivered.</span>
                        </h1>
                        <p className="text-lg text-on-surface-variant max-w-md mb-10 leading-relaxed opacity-80">
                            Experience fine dining at your doorstep. Curated menus from the city's finest kitchens, handled with sommelier-level care.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => document.getElementById('full-menu').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-gradient-to-tr from-[#ffb77d] to-[#FF8C00] text-[#131313] rounded-xl font-bold text-lg shadow-lg shadow-primary-container/20 active:scale-95 transition-all">
                                Order Now
                            </button>
                            {!user && (
                                <Link to="/register" className="px-8 py-4 flex items-center bg-surface-container-high/40 backdrop-blur-xl text-on-surface rounded-xl font-bold text-lg active:scale-95 transition-all border border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                                    Join Us
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 transform lg:rotate-3 hover:rotate-0 transition-transform duration-700">
                            <img className="w-full h-[600px] object-cover" alt="Hero presentation" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCetZ6P_1wOx7Z3gvxdg6GUh2ShWr5yAA0XDGZXX0mGWcdLorX1wfcgvlt_tFO5YrW1BxqakFtQskSFZcpf7BrzJw5R-SpWe3bHnXGhMjM-fhoFvJBprEvlWG2b-enzSlpEqI5IxSMRHrSbYN1f84yWrnhh3o9rWEP02YjEnvm87mNMrXLzxXwgDmcJz5GkCn3TTcytCeLPMgFZi3bWHwO9xBUHooEGwSXs2uUWaDa1ou62KbTC6kSAuR7awKlGRhNShF5C5mLysMM" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            {/* Gastronomy Overlay Component */}
                            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-surface-variant/30 backdrop-blur-xl border border-white/10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-primary-fixed-dim text-xs font-black uppercase tracking-widest mb-1">Chef's Choice</p>
                                        <h3 className="text-2xl font-bold text-on-surface">Wagyu Ribeye Sizzle</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-3xl font-black text-on-surface">$42.00</span>
                                        <button className="mt-2 flex items-center text-primary font-bold text-sm hover:scale-105 transition-transform" onClick={() => document.getElementById('full-menu').scrollIntoView()}>
                                            Order <span className="material-symbols-outlined ml-1 text-sm">arrow_downward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Selection */}
            <section className="px-8 lg:px-16 mb-24 hidden md:block">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Signature Categories</h2>
                        <p className="text-on-surface-variant opacity-60">Hand-picked selections for every palate.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[600px]">
                    {categories.slice(0, 4).map((category, index) => {
                        // Dynamically allocate bento box sizes exactly as they were structurally designed
                        const bentoClasses = [
                            "md:col-span-2 md:row-span-2",
                            "md:col-span-1 md:row-span-1",
                            "md:col-span-1 md:row-span-2",
                            "md:col-span-1 md:row-span-1"
                        ];

                        // Match high quality generic images to our dynamic categories
                        const categoryImages = {
                            "burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
                            "desserts": "https://lh3.googleusercontent.com/aida-public/AB6AXuDK__CBYYkcK9Sx2heyv7KRIc5zafsEsOZv1IkZPyGlTO-DR9Nz8Dga-WrBluf-tBHophIZlX29yyTMVIpI_zIZW8NvWSfFgeH4cnv_ORXdOYQu4mKrHwn2_WKuc5SiiUEq6U5OW7wzwOIML2i0LIMOUvHaTNfgV9dlDdoGgEpxZisyE8cgMudlrIj2H1Vs-VyLs0ifP-cRao6HXDbhBA3b2AnZHQXh3GBgyr1o77VpUfidj9dnX6BWyw-W5Xh3ukwrzOfl2MkoEN4",
                            "drinks": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1287&auto=format&fit=crop",
                            "rice": "https://images.unsplash.com/photo-1539755530862-00f623c00f52?q=80&w=1470&auto=format&fit=crop",
                            "starters": "https://lh3.googleusercontent.com/aida-public/AB6AXuB3diMm1trKKTpBA-lohdrhIxeeMM2Nt5uZReutG4M4QhCq3fOl69XWlQ7TgU5wokYr8TTz49NbwR3n9yeOS8snzKzKCxwv2Hg81BilA8dS6uSfuxaeWofNfUsg_Y4ghwOJFtz_qrFt5fzkRYfS5H7NBZqB3FoMWXdALmTwHWhL-u_Ft1TqMWasEB-HsTegaz8pF0BYugkluAO_hCbgyj9HKIXgpH_VOtUwvdE-UGenzL2h_OykdO_7lvYMA0PfvUqfSJnv8IFXUlc",
                            "default": "https://lh3.googleusercontent.com/aida-public/AB6AXuCn4ATkPA-sE3iSrRbV4jJGu_WM8sWLzQVZuYyox2j3ObYLjtjn25TV950EXCzKOZLrhvszCeemUmOb8y_K2c7biy58IRJgRrwCVsRJwBkElPqaKnQbECyMnFIr7Qa-D2IYB6QmKCTu234nr9GVUiIp9tyPWuWPbq2LDrEi7RzGqwbIiGTf4DmTXwHegwqwU0OLOZcLunPbiMTWy_xkWgrJSh5NQkpkQn_bw7PMIGhKDlT4oxNXA9tWJ1oZrkqFoiYnzyrJ805xUJQ"
                        };

                        const lowerName = category.name.toLowerCase();
                        const matchingKey = Object.keys(categoryImages).find(key => lowerName.includes(key));
                        const imageUrl = matchingKey ? categoryImages[matchingKey] : categoryImages["default"];

                        return (
                            <div key={category.id} className={`${bentoClasses[index]} relative rounded-3xl overflow-hidden group cursor-pointer`} onClick={() => document.getElementById('full-menu').scrollIntoView()}>
                                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={category.name} src={imageUrl} />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                                <div className="absolute bottom-8 left-8">
                                    <h3 className={`${index === 0 ? 'text-3xl' : 'text-xl'} font-black text-white`}>{category.name}</h3>
                                    {index === 0 && <p className="text-white/80 font-medium">Explore our collection</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Dynamic Full Menu */}
            <section id="full-menu" className="px-8 lg:px-16 mb-24 min-h-[500px]">
                <div className="mb-12">
                    <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2">Our Full Menu</h2>
                    <p className="text-on-surface-variant opacity-60">Explore everything our kitchens have to offer.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-on-surface-variant">Curating the finest dishes...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="text-6xl mb-4">🍽️</span>
                        <p className="text-on-surface-variant text-lg">No items available right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.map(item => (
                            <div key={item.id} className="group bg-surface-container-high rounded-3xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 shadow-xl shadow-black/20 flex flex-col">
                                <div className="h-48 relative bg-surface-container overflow-hidden">
                                    <img 
                                        src={item.imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop`}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-primary font-bold text-sm border border-white/10">
                                        Rs. {item.price}
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-on-surface mb-2 tracking-tight">{item.name}</h3>
                                    <p className="text-sm text-on-surface-variant opacity-70 mb-6 flex-grow overflow-hidden text-ellipsis line-clamp-3">
                                        {item.description || "A deliciously prepared meal crafted with the freshest authentic ingredients."}
                                    </p>
                                    
                                    <button 
                                        onClick={() => handleAddToCart(item)}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                            addedId === item.id 
                                            ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                            : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {addedId === item.id ? 'check_circle' : 'add_shopping_cart'}
                                        </span>
                                        {addedId === item.id ? 'Added to Cart' : 'Add to Order'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Newsletter */}
            <section className="px-8 lg:px-16">
                <div className="bg-surface-container-low rounded-[3rem] p-12 lg:p-20 relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none hidden md:block">
                        <img className="w-full h-full object-cover" alt="Whisk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkHagdD9Wd17M_hvdMnF4ooGmDsoLs668v8OpkWSpF4M9jog5IhxfObYIGtrz_Qr86cJXIlYJI-0m8VjuqoP0kd19JIuyF01dqgsV1tYFyml20_5dT01KKVn0Ec5wJt9z7TS6VzOpuIfsOp9VzRCd4-mA8nG6CLl54dwRWvpv3AP-47of30E_81rsno7YQrsqH8CRytDLl8r029Tu_-a_4KEp74Uu0RjDDwSZaYa9yzHlYpXyMEgfEw8l3_UDJBDGTBJwc_5P0ecs" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight text-on-surface">Join the Culinary<br />Inner Circle.</h2>
                        <p className="text-on-surface-variant text-lg mb-10 opacity-80 leading-relaxed">
                            Get early access to seasonal menus and exclusive chef collaborations delivered directly to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input className="flex-grow bg-surface-container-lowest border border-white/10 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 text-on-surface" placeholder="Your email address" type="email" />
                            <button className="bg-primary text-on-primary font-bold px-8 py-4 rounded-xl hover:bg-primary-container transition-colors whitespace-nowrap active:scale-95 shadow-lg shadow-primary/20">
                                Subscribe Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}