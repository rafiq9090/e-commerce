import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../../api/productApi';
import { getAllContent } from '../../api/contentApi';
import { placeGuestOrder } from '../../api/orderApi';
import { createBkashPayment, createNagadPayment } from '../../api/paymentApi';
import { ShoppingCart, Check, Star, ShieldCheck, Truck, Clock, Menu, X, ChevronDown, Award, Heart, ThumbsUp, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Footer from '../../components/layout/Footer';

const ProductLandingPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [siteContent, setSiteContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useCart();
    const [activeImage, setActiveImage] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [parallaxOffset, setParallaxOffset] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Order Form State
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderFormInfo, setOrderFormInfo] = useState({ name: '', phone: '', address: '', city: '' });
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const y = window.scrollY || 0;
                    setScrolled(y > 50);
                    setParallaxOffset(y);
                    ticking = false;
                });
                ticking = true;
            }
        };
        handleScroll();
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

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getAllContent();
                const data = res.data || res;
                if (Array.isArray(data)) {
                    const map = {};
                    data.forEach((item) => { map[item.key] = item.value; });
                    setSiteContent(map);
                } else if (data && typeof data === 'object') {
                    setSiteContent(data);
                }
            } catch (err) {
                // ignore
            }
        };
        fetchContent();
    }, []);


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
                items: [{ productId: product.id, quantity: quantity }],
                paymentMethod,
            };
            const response = await placeGuestOrder(payload);
            const order = response.data || response;
            if (paymentMethod === 'bKash') {
                const paymentRes = await createBkashPayment(order.id);
                const paymentData = paymentRes.data || paymentRes;
                window.location.href = paymentData.paymentURL;
                return;
            }
            if (paymentMethod === 'Nagad') {
                const paymentRes = await createNagadPayment(order.id);
                const paymentData = paymentRes.data || paymentRes;
                window.location.href = paymentData.paymentURL;
                return;
            }
            setOrderSuccess(true);
            setQuantity(1);
        } catch (err) {
            const message =
                err?.message ||
                err?.data?.message ||
                err?.response?.data?.message ||
                "Failed to place order. Please try again.";
            alert(message);
        } finally {
            setOrderLoading(false);
        }
    };

    const incrementQty = () => setQuantity((prev) => prev + 1);
    const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
    if (error || !product) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-400">Product not found</div>;

    const discountPercentage = product.sale_price
        ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
        : 0;
    const plainDescription = product.description ? product.description.replace(/<[^>]*>/g, '') : '';

    return (
        <div className="landing-root min-h-screen text-slate-900 bg-[color:var(--bg)]">
            <style>{`
                :root {
                    --bg: #f5f2ea;
                    --ink: #101418;
                    --accent: #0e7c66;
                    --accent-2: #c84b31;
                    --sun: #f2c14e;
                }
                .landing-root { font-family: "Space Grotesk", "Segoe UI", sans-serif; }
                .glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(14px); }
                .grain { background-image: radial-gradient(rgba(16,20,24,0.05) 1px, transparent 0); background-size: 20px 20px; }
                .shadow-soft { box-shadow: 0 20px 80px rgba(16,20,24,0.08); }
            `}</style>

            {/* Header */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm h-16' : 'bg-transparent h-20'}`}>
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <Link to="/" className="text-2xl font-black tracking-tight text-[color:var(--ink)]">
                        DeshShera
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#features" className="hover:text-[color:var(--accent)] transition">Features</a>
                        <a href="#details" className="hover:text-[color:var(--accent)] transition">Details</a>
                        <a href="#order-form-section" className="hover:text-[color:var(--accent)] transition">Order</a>
                    </div>
                    <button onClick={scrollToOrder} className={`px-6 py-2 rounded-full font-bold text-sm bg-[color:var(--accent)] text-white hover:opacity-90 transition ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                        Order Now
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-28 pb-16 md:pt-32 md:pb-24 grain">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-7 relative">
                            <div
                                className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[color:var(--sun)]/30 blur-3xl"
                                style={{ transform: `translateY(${parallaxOffset * 0.08}px)` }}
                            ></div>
                            <div
                                className="absolute -bottom-8 -right-6 w-56 h-56 rounded-full bg-[color:var(--accent)]/20 blur-3xl"
                                style={{ transform: `translateY(${parallaxOffset * -0.06}px)` }}
                            ></div>
                            <div className="bg-white rounded-[2.5rem] shadow-soft border border-white/80 overflow-hidden">
                                <div
                                    className="relative aspect-[4/3] bg-white"
                                    style={{ transform: `translateY(${parallaxOffset * -0.04}px)` }}
                                >
                                    <img
                                        src={activeImage || 'https://via.placeholder.com/800'}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-8"
                                        fetchPriority="high"
                                    />
                                    {discountPercentage > 0 && (
                                        <div className="absolute top-6 left-6 bg-[color:var(--accent-2)] text-white text-xs font-black px-3 py-2 rounded-full shadow-lg">
                                            SAVE {discountPercentage}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {product.images?.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pt-4">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img.url)}
                                            className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-[color:var(--accent)]' : 'border-white'}`}
                                        >
                                            <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                            <div className="flex items-center gap-3 text-xs font-bold tracking-wide uppercase text-slate-500">
                                <span className="px-3 py-1 rounded-full bg-white border border-slate-200">In Stock</span>
                                <span className="flex items-center gap-1 text-[color:var(--accent)]">
                                    <Star size={14} fill="currentColor" /> 4.9 rating
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black leading-tight text-[color:var(--ink)]">
                                {product.seoTitle || product.name}
                            </h1>

                            <p className="text-base text-slate-600 leading-relaxed">
                                {product.short_description || `${plainDescription.substring(0, 160)}...`}
                            </p>

                            <div className="glass rounded-3xl border border-white/80 p-6 space-y-4">
                                <div className="flex items-end gap-4">
                                    <span className="text-4xl font-black text-[color:var(--accent)]">
                                        ৳{Number(product.sale_price || product.regular_price).toLocaleString()}
                                    </span>
                                    {product.sale_price && (
                                        <span className="text-lg text-slate-400 line-through">৳{Number(product.regular_price).toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-3">
                                    <span className="text-sm font-bold text-slate-600">Quantity</span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={decrementQty} className="h-9 w-9 rounded-full border border-slate-200 font-bold text-slate-700 hover:bg-slate-50">-</button>
                                        <span className="min-w-[32px] text-center font-bold">{quantity}</span>
                                        <button type="button" onClick={incrementQty} className="h-9 w-9 rounded-full border border-slate-200 font-bold text-slate-700 hover:bg-slate-50">+</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={scrollToOrder}
                                        className="w-full bg-[color:var(--accent)] text-white font-black py-4 rounded-2xl shadow-soft hover:opacity-90 transition"
                                    >
                                        ORDER NOW
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-xs">
                                    {[
                                        { icon: <ShieldCheck className="text-[color:var(--accent)]" />, text: "1 Year Warranty" },
                                        { icon: <Truck className="text-[color:var(--accent)]" />, text: "2-3 Day Delivery" },
                                        { icon: <Award className="text-[color:var(--accent)]" />, text: "Official Store" },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white rounded-xl p-3 text-center border border-slate-100">
                                            <div className="flex justify-center mb-2">{item.icon}</div>
                                            <span className="font-bold text-slate-600">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {product.inventory?.quantity < 10 && (
                                <div className="flex items-center gap-3 bg-[color:var(--sun)]/20 text-[color:var(--ink)] px-4 py-3 rounded-xl text-sm font-bold border border-[color:var(--sun)]/30">
                                    <Clock size={18} />
                                    <span>Only {product.inventory?.quantity || 5} units left in stock.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Highlights */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { title: "Fast Delivery", text: "2-3 days in most areas." },
                            { title: "Easy Returns", text: "7-day replacement policy." },
                            { title: "Verified Quality", text: "Checked before dispatch." },
                            { title: "Secure Payment", text: "Cash on delivery available." },
                        ].map((item, i) => (
                            <div key={i} className="rounded-2xl border border-slate-100 p-5 bg-slate-50">
                                <h3 className="text-sm font-bold text-[color:var(--ink)]">{item.title}</h3>
                                <p className="text-sm text-slate-600 mt-2">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mb-12 text-center mx-auto">
                        <h2 className="text-3xl font-black text-[color:var(--ink)]">Why customers choose this</h2>
                        <p className="text-slate-600 mt-3">Premium build, fast delivery, and a support team that actually responds.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <ThumbsUp />, title: "Top Rated", desc: "Loved by thousands of verified buyers across Bangladesh." },
                            { icon: <ShieldCheck />, title: "Built to Last", desc: "Durable materials and strict quality checks." },
                            { icon: <Heart />, title: "Zero Risk", desc: "Easy returns and dedicated support." },
                        ].map((f, i) => (
                            <div key={i} className="rounded-2xl border border-slate-100 p-6 bg-slate-50">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[color:var(--accent)] shadow-sm">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold mt-4">{f.title}</h3>
                                <p className="text-slate-600 mt-2">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Details */}
            <section id="details" className="py-16 bg-slate-50">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-[color:var(--ink)]">Product Specifications</h2>
                            <p className="text-slate-600 mt-2">Everything you need to know before ordering.</p>
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">Verified Specs</div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-soft border border-white/80 relative overflow-hidden">
                            <div
                                className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[color:var(--sun)]/20 blur-3xl"
                                style={{ transform: `translateY(${parallaxOffset * 0.03}px)` }}
                            ></div>
                            <div
                              className="rich-text relative z-10"
                              dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                        <div className="lg:col-span-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Category</p>
                                    <p className="mt-2 text-lg font-bold text-[color:var(--ink)]">{product.category?.name || 'General'}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Supplier</p>
                                    <p className="mt-2 text-lg font-bold text-[color:var(--ink)]">{product.supplier?.name || 'DeshShera'}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Stock</p>
                                    <p className="mt-2 text-lg font-bold text-[color:var(--ink)]">{product.inventory?.quantity ?? '—'}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">SKU</p>
                                    <p className="mt-2 text-lg font-bold text-[color:var(--ink)]">{product.inventory?.sku || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="bg-[color:var(--ink)] text-white rounded-3xl p-6 shadow-soft">
                                <h3 className="text-lg font-bold">{product.landingWhatYouGetTitle || 'What you get'}</h3>
                                <ul className="mt-4 space-y-3 text-sm text-white/80">
                                    <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--sun)]"></span>{product.landingWhatYouGetItem1 || 'Original product package'}</li>
                                    <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--sun)]"></span>{product.landingWhatYouGetItem2 || 'Warranty card & manual'}</li>
                                    <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--sun)]"></span>{product.landingWhatYouGetItem3 || 'After-sales support'}</li>
                                </ul>
                                <div className="mt-6 rounded-2xl bg-white/10 p-4 text-xs text-white/70">
                                    {product.landingWhatYouGetNote || 'Specs and package contents may vary by model.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Order Form */}
            <section id="order-form-section" className="py-16 bg-[color:var(--accent)] text-white">
                <div className="container mx-auto px-6 max-w-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black">Ready to order?</h2>
                        <p className="text-white/80">Fill the form to confirm Cash on Delivery.</p>
                    </div>

                    {orderSuccess ? (
                        <div className="bg-white text-slate-900 p-8 rounded-2xl text-center shadow-soft">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={28} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Order Placed Successfully!</h3>
                            <p className="text-slate-600">Thank you, {orderFormInfo.name}. We will contact you shortly.</p>
                            <button onClick={() => setOrderSuccess(false)} className="mt-6 text-[color:var(--accent)] font-bold underline">Order Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handlePlaceOrder} className="bg-white text-slate-900 p-6 md:p-8 rounded-2xl shadow-soft space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={activeImage} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                    <div>
                                        <h4 className="font-bold text-sm line-clamp-1">{product?.name}</h4>
                                        <p className="text-xs text-slate-500">Qty: {quantity} x ৳{product?.sale_price || product?.regular_price}</p>
                                    </div>
                                </div>
                                <div className="font-bold text-[color:var(--accent)]">
                                    ৳{Number((product?.sale_price || product?.regular_price) * quantity).toLocaleString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-Black-500 ml-1">Full Name</label>
                                    <input required value={orderFormInfo.name} onChange={e => setOrderFormInfo({ ...orderFormInfo, name: e.target.value })} placeholder="Enter your full name" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-500  focus:ring-2 focus:ring-[color:var(--accent)] outline-none transition" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-Black-500 ml-1">Phone Number</label>
                                    <input required value={orderFormInfo.phone} onChange={e => setOrderFormInfo({ ...orderFormInfo, phone: e.target.value })} placeholder="+880 1XXX-XXXXXX" className="w-full bg-slate-50 border border-slate-200 p-3 text-slate-500 rounded-xl focus:ring-2 focus:ring-[color:var(--accent)] outline-none transition" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-Black-500 ml-1">Full Address</label>
                                <textarea required value={orderFormInfo.address} onChange={e => setOrderFormInfo({ ...orderFormInfo, address: e.target.value })} placeholder="House, Road, Area..." className="w-full bg-slate-50 border border-slate-200 text-slate-500 p-3 rounded-xl h-24 focus:ring-2 focus:ring-[color:var(--accent)] outline-none transition resize-none" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-Black-500 ml-1">City / District</label>
                                <input required value={orderFormInfo.city} onChange={e => setOrderFormInfo({ ...orderFormInfo, city: e.target.value })} placeholder="City name" className="w-full bg-slate-50 border border-slate-200 text-slate-500 p-3 rounded-xl focus:ring-2 focus:ring-[color:var(--accent)] outline-none transition" />
                            </div>

                            <div className="space-y-3">
                                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer ${paymentMethod === 'Cash on Delivery' ? 'border-[color:var(--accent)] bg-slate-50' : 'border-slate-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === 'Cash on Delivery'}
                                            onChange={() => setPaymentMethod('Cash on Delivery')}
                                        />
                                        <div>
                                            <p className="font-bold text-slate-700">Cash On Delivery</p>
                                            <p className="text-xs text-slate-500">Pay when you receive your order</p>
                                        </div>
                                    </div>
                                    <Banknote className="text-[color:var(--accent)]" />
                                </label>

                                {siteContent.show_bkash === 'true' && (
                                    <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer ${paymentMethod === 'bKash' ? 'border-[color:var(--accent)] bg-slate-50' : 'border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={paymentMethod === 'bKash'}
                                                onChange={() => setPaymentMethod('bKash')}
                                            />
                                            <div>
                                                <p className="font-bold text-slate-700">bKash</p>
                                                <p className="text-xs text-slate-500">Pay securely through bKash gateway</p>
                                            </div>
                                        </div>
                                    </label>
                                )}

                                {siteContent.show_nagad === 'true' && (
                                    <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer ${paymentMethod === 'Nagad' ? 'border-[color:var(--accent)] bg-slate-50' : 'border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={paymentMethod === 'Nagad'}
                                                onChange={() => setPaymentMethod('Nagad')}
                                            />
                                            <div>
                                                <p className="font-bold text-slate-700">Nagad</p>
                                                <p className="text-xs text-slate-500">Pay securely through Nagad gateway</p>
                                            </div>
                                        </div>
                                    </label>
                                )}
                            </div>

                            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3">
                                <span className="text-sm font-bold text-slate-600">Quantity</span>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={decrementQty} className="h-9 w-9 rounded-full border border-slate-200 font-bold text-slate-700 hover:bg-slate-50">-</button>
                                    <span className="min-w-[32px] text-center font-bold">{quantity}</span>
                                    <button type="button" onClick={incrementQty} className="h-9 w-9 rounded-full border border-slate-200 font-bold text-slate-700 hover:bg-slate-50">+</button>
                                </div>
                            </div>

                            <button disabled={orderLoading} type="submit" className="w-full bg-[color:var(--accent)] text-white font-bold text-lg py-4 rounded-xl hover:opacity-90 transition shadow-soft disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                {orderLoading ? <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span> : 'CONFIRM ORDER ৳' + Number((product?.sale_price || product?.regular_price) * quantity).toLocaleString()}
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* Sticky Mobile CTA */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t p-4 z-40 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-slate-500">Total Price</p>
                        <p className="text-xl font-bold text-[color:var(--accent)]">৳{Number(product.sale_price || product.regular_price).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={scrollToOrder}
                        className="flex-1 bg-[color:var(--accent)] text-white font-bold rounded-lg shadow-lg active:scale-95 transition"
                    >
                        Order Now
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductLandingPage;
