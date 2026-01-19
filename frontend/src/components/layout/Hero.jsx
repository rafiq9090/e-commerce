import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, Zap, ShieldCheck, Truck, Percent } from 'lucide-react';
import { getAllContent } from '../../api/contentApi';

const Hero = () => {
  const [content, setContent] = useState({});
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getAllContent();
        const data = res.data || res;
        // Convert to key-value map if array
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(item => map[item.key] = item.value);
          setContent(map);
        } else {
          setContent(data);
        }
      } catch (error) {
        console.error("Failed to load hero content", error);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || 0;
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

  // Defaults
  const headline = content.hero_headline || "Elevate Your Shopping Standard";
  // Split headline for styling if contains newline or break logic, simpler here to just render
  const subheadline = content.hero_subheadline || "Experience the perfect blend of quality and affordability. Shop huge discounts on premium products today.";
  const heroImage = content.hero_image || "https://deshshera.com/wp-content/uploads/al_opt_content/IMAGE/deshshera.com/wp-content/uploads/2025/10/DeshSera_hero.webp.bv_resized_desktop.webp.bv.webp?bv_host=deshshera.com";
  const ctaText = content.hero_cta_text || "Shop Now";

  // Safe split for styling "Shopping Standard" part specially? 
  // For robustness, let's keep the split logic simple or apply gradient to the whole second half if possible.
  // Actually, let's just render the text directly to avoid logic breaks with custom text.

  return (
    <div className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-blue-50 to-white text-slate-900 overflow-hidden min-h-[90vh] flex items-center">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-purple-200/40 rounded-full blur-[100px] animate-pulse"
          style={{ transform: `translateY(${parallaxOffset * 0.08}px)` }}
        ></div>
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full blur-[100px] animate-pulse delay-700"
          style={{ transform: `translateY(${parallaxOffset * -0.06}px)` }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* --- Text Content --- */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/40 rounded-full px-5 py-2 text-sm font-semibold shadow-sm animate-fade-in-up text-indigo-900">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <span className="tracking-wide">#1 Trusted E-commerce Platform</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
              {headline.split(' ').slice(0, 2).join(' ')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                {headline.split(' ').slice(2).join(' ')}
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium border-l-4 border-yellow-400 pl-6">
              {subheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/products"
                className="group relative bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <ShoppingBag className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{ctaText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>

              <Link
                to="/deals"
                className="group bg-white/50 backdrop-blur-sm border border-slate-200 text-slate-700 font-bold py-4 px-10 rounded-2xl text-lg hover:bg-white/80 transition-all duration-300 inline-flex items-center justify-center gap-2 hover:shadow-md"
              >
                <Zap className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span>Daily Deals</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 mt-8">
              {[
                { icon: <Truck className="text-blue-500" />, text: "Fast Delivery", sub: "2-3 Days" },
                { icon: <ShieldCheck className="text-indigo-500" />, text: "Secure Pay", sub: "100% Safe" },
                { icon: <Percent className="text-rose-500" />, text: "Best Prices", sub: "Guaranteed" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="bg-white p-3 rounded-xl mb-2 shadow-sm border border-slate-100 text-slate-900 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="font-bold text-sm block text-slate-800">{item.text}</span>
                  <span className="text-xs text-slate-500">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* --- Image Section --- */}
          <div className="relative group perspective-1000">
            <div
              className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 transform rotate-6 scale-95"
              style={{ transform: `translateY(${parallaxOffset * -0.03}px) rotate(6deg) scale(0.95)` }}
            ></div>
            <div
              className="relative bg-white/5 backdrop-blur-xl border border-white/20 p-4 rounded-[2.5rem] shadow-2xl transform transition-all duration-500 hover:rotate-1 hover:scale-[1.02]"
              style={{ transform: `translateY(${parallaxOffset * 0.03}px)` }}
            >
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60"></div>
                <img
                  src={heroImage}
                  alt="Hero Showcase"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                />

                <div className="absolute bottom-6 left-6 z-20 text-left">
                  <p className="text-yellow-400 font-bold tracking-wider text-sm mb-1">FEATURED COLLECTION</p>
                  <h3 className="text-3xl font-black text-white leading-tight">Winter <br /> Essentials</h3>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white text-blue-900 p-4 rounded-2xl shadow-xl shadow-black/20 animate-bounce-slow">
                <div className="flex items-center gap-3 font-bold">
                  <div className="bg-yellow-400 rounded-full p-2 text-yellow-900">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">New Arrivals</p>
                    <p className="text-lg">Just In!</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-5 rounded-2xl shadow-xl shadow-blue-900/40 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <p className="text-xs font-bold opacity-80 uppercase mb-1">Limited Offer</p>
                <p className="text-3xl font-black leading-none">50%</p>
                <p className="text-sm font-bold opacity-80 text-right">OFF</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
