import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../../api/productApi';
import { placeOrder } from '../../api/orderApi';
import { ShoppingCart, Check, Star, ShieldCheck, Truck, Clock, Menu, X, ChevronDown, Award, Heart, ThumbsUp, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductLandingPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const [activeImage, setActiveImage] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Order Form State
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderFormInfo, setOrderFormInfo] = useState({ name: '', phone: '', address: '', city: '' });
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await getProductBySlug(slug);
                const data = res.data || res;
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0].url);
                }
            } catch (err) {
                setError('Product not found');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const scrollToOrder = () => {
        document.getElementById('order-form-section')?.scrollIntoView({ behavior: 'smooth' });
        setShowOrderForm(true);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setOrderLoading(true);
        try {
            const payload = {
                guestDetails: { name: orderFormInfo.name, phone: orderFormInfo.phone },
                fullAddress: `${orderFormInfo.address}, ${orderFormInfo.city}`,
                orderItems: [{ productId: product.id, quantity: quantity }],
                paymentMethod: 'COD',
            };
            await placeOrder(payload);
            setOrderSuccess(true);
            setQuantity(1);
        } catch (err) {
            alert("Failed to place order. Please try again.");
        } finally {
            setOrderLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (error || !product) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-400">Product not found</div>;

    const discountPercentage = product.sale_price
        ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
        : 0;

    return (
        <div className="min-h-screen font-sans text-gray-900 bg-white selection:bg-blue-100">

            {/* 1. Navbar: Sticky & Converting */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm h-16' : 'bg-transparent h-20'}`}>
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600">BRAND.</Link>

                    <div className="hidden md:flex items-center gap-8 font-medium text-gray-600 text-sm">
                        <a href="#features" className="hover:text-blue-600 transition">Features</a>
                        <a href="#details" className="hover:text-blue-600 transition">Details</a>
                        <a href="#reviews" className="hover:text-blue-600 transition">Reviews</a>
                    </div>

                    <button onClick={scrollToOrder} className={`bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition transform hover:scale-105 shadow-lg shadow-blue-500/30 ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                        Order Now
                    </button>
                </div>
            </nav>

            {/* 2. Hero Section - Modern & Premium */}
            <div className="pt-28 pb-16 lg:pt-36 lg:pb-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white overflow-hidden">
                <div className="container mx-auto px-4 relative">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

                        {/* Left: Gallery (Cols 7) - Larger & Interactive */}
                        <div className="lg:col-span-7 space-y-6 relative z-10">
                            {/* Main Image Container */}
                            <div className="aspect-[4/3] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/50 relative group backdrop-blur-sm">
                                <img
                                    src={activeImage || 'https://via.placeholder.com/800'}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-8 transition duration-700 ease-out group-hover:scale-105"
                                    fetchPriority="high"
                                />
                                {/* Floating Discount Badge */}
                                {discountPercentage > 0 && (
                                    <div className="absolute top-6 left-6 bg-rose-600 text-white text-base font-bold px-4 py-2 rounded-full shadow-lg shadow-rose-500/30 animate-pulse flex items-center gap-2">
                                        <Award size={16} />
                                        <span>SAVE {discountPercentage}%</span>
                                    </div>
                                )}
                                {/* Best Seller Badge Example */}
                                <div className="absolute top-6 right-6 bg-amber-400 text-amber-900 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-sm border border-amber-200/50">
                                    Best Seller
                                </div>
                            </div>

                            {/* Thumbnails - Styled */}
                            {product.images?.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x justify-center lg:justify-start">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img.url)}
                                            className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-start shadow-sm ${activeImage === img.url ? 'border-blue-600 scale-105 ring-4 ring-blue-50/50 translate-y-[-4px]' : 'border-white hover:border-blue-200 hover:scale-105 opacity-80 hover:opacity-100'}`}
                                        >
                                            <img src={img.url} className="w-full h-full object-cover bg-white" alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Info (Cols 5) - Clean & Conversion Focused */}
                        <div className="lg:col-span-5 space-y-8 relative z-10" id="buy-section">

                            {/* Product Header */}
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Check size={14} strokeWidth={3} /> In Stock
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star fill="currentColor" size={18} />
                                        <span className="text-gray-900 font-bold">4.9</span>
                                        <span className="text-gray-400 font-normal">(2,400+ Reviews)</span>
                                    </div>
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                    {product.seoTitle || product.name}
                                </h1>

                                <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-blue-200 pl-4">
                                    {product.short_description || product.description.substring(0, 160) + "..."}
                                </p>
                            </div>

                            {/* Pricing & Offer Card */}
                            <div className="bg-white/80 backdrop-blur-md p-6 lg:p-8 rounded-3xl border border-white shadow-xl shadow-blue-900/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="relative z-10">
                                    <div className="flex items-end gap-3 mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Total Price</span>
                                            <span className="text-5xl font-black text-blue-600 tracking-tight">
                                                ৳{Number(product.sale_price || product.regular_price).toLocaleString()}
                                            </span>
                                        </div>
                                        {product.sale_price && (
                                            <span className="text-2xl text-gray-400 line-through font-bold mb-2 pb-1 decoration-2">
                                                ৳{Number(product.regular_price).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Primary CTA */}
                                    <div className="space-y-4">
                                        <button
                                            onClick={scrollToOrder}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-black py-5 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-blue-600/40 active:scale-[0.98] group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <span className="relative flex items-center gap-3">
                                                ORDER NOW - CASH ON DELIVERY <ShoppingCart size={24} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </button>
                                        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Free Shipping • 7 Day Returns</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Signals - Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: <ShieldCheck className="text-emerald-500" />, text: "1 Year Warranty" },
                                    { icon: <Truck className="text-blue-500" />, text: "2-3 Day Delivery" },
                                    { icon: <Award className="text-purple-500" />, text: "Official Store" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 cursor-default">
                                        <div className="bg-white p-2 rounded-full shadow-sm">{item.icon}</div>
                                        <span className="text-xs font-bold text-slate-700 leading-tight">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Urgency Bar */}
                            {product.inventory?.quantity < 10 && (
                                <div className="flex items-center gap-3 bg-rose-50 text-rose-700 px-5 py-3 rounded-xl text-sm font-bold border border-rose-100 animate-pulse">
                                    <Clock size={18} />
                                    <span>Hurry! Only {product.inventory?.quantity || 5} units left in stock.</span>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. Features Grid */}
            <div id="features" className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why People Love This</h2>
                        <p className="text-gray-500">Discover what makes our product stand out from the competition.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <ThumbsUp />, title: "Customer Favorite", desc: "Rated highly by over 1000+ happy customers nationwide." },
                            { icon: <ShieldCheck />, title: "Durable Design", desc: "Built with premium materials to last for years, not months." },
                            { icon: <Heart />, title: "Satisfaction Guaranteed", desc: "Love it or your money back. No questions asked." }
                        ].map((f, i) => (
                            <div key={i} className="bg-gray-50 p-8 rounded-2xl text-center hover:bg-gray-100 transition">
                                <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                                <p className="text-gray-500">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Product Details (Rich Text) */}
            <div id="details" className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Product Specifications</h2>
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm prose prose-lg prose-blue mx-auto text-gray-600">
                        <p className="whitespace-pre-line">{product.description}</p>
                    </div>
                </div>
            </div>

            {/* 5. Embedded Order Form Section */}
            <div id="order-form-section" className="py-16 bg-blue-600 text-white">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black mb-2">Ready to Order?</h2>
                        <p className="text-blue-100">Fill out the form below to get your product delivered.</p>
                    </div>

                    {orderSuccess ? (
                        <div className="bg-white text-gray-900 p-8 rounded-2xl text-center shadow-2xl animate-in zoom-in">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Order Placed Successfully!</h3>
                            <p className="text-gray-500">Thank you, {orderFormInfo.name}. We will contact you shortly to confirm.</p>
                            <button onClick={() => setOrderSuccess(false)} className="mt-6 text-blue-600 font-bold underline">Order Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handlePlaceOrder} className="bg-white text-gray-900 p-6 md:p-8 rounded-2xl shadow-2xl space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={activeImage} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                    <div>
                                        <h4 className="font-bold text-sm line-clamp-1">{product?.name}</h4>
                                        <p className="text-xs text-gray-500">Qty: {quantity} x ৳{product?.sale_price || product?.regular_price}</p>
                                    </div>
                                </div>
                                <div className="font-bold text-blue-600">
                                    ৳{Number((product?.sale_price || product?.regular_price) * quantity).toLocaleString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Full Name</label>
                                    <input required value={orderFormInfo.name} onChange={e => setOrderFormInfo({ ...orderFormInfo, name: e.target.value })} placeholder="Ex: Rafiqul Islam" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Phone Number</label>
                                    <input required value={orderFormInfo.phone} onChange={e => setOrderFormInfo({ ...orderFormInfo, phone: e.target.value })} placeholder="Ex: 01712345678" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">Full Address</label>
                                <textarea required value={orderFormInfo.address} onChange={e => setOrderFormInfo({ ...orderFormInfo, address: e.target.value })} placeholder="House, Road, Area..." className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">City / District</label>
                                <input required value={orderFormInfo.city} onChange={e => setOrderFormInfo({ ...orderFormInfo, city: e.target.value })} placeholder="Ex: Dhaka" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>

                            {/* Payment Method - Static COD for Landing Page */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3 cursor-pointer ring-2 ring-blue-500 ring-offset-2">
                                <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                                <Banknote className="text-green-600" />
                                <span className="font-bold text-gray-700">Cash On Delivery</span>
                            </div>

                            <button disabled={orderLoading} type="submit" className="w-full bg-blue-600 text-white font-bold text-xl py-4 rounded-xl hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                {orderLoading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : 'CONFIRM ORDER ৳' + Number((product?.sale_price || product?.regular_price) * quantity).toLocaleString()}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Sticky Mobile Bottom Bar */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t p-4 z-40 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500">Total Price</p>
                        <p className="text-xl font-bold text-blue-600">৳{Number(product.sale_price || product.regular_price).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={scrollToOrder}
                        className="flex-1 bg-blue-600 text-white font-bold rounded-lg shadow-lg active:scale-95 transition"
                    >
                        Order Now
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 border-t border-gray-800 pb-24 md:pb-12">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-black mb-6 tracking-tighter text-blue-500">BRAND.</h2>
                    <p className="text-gray-400 mb-8">Premium products at unbeatable prices.</p>
                    <div className="flex justify-center gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                        <a href="#" className="hover:text-white">Contact Support</a>
                    </div>
                    <p className="mt-8 text-xs text-gray-600">© 2024 Brand Inc. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
};

export default ProductLandingPage;
