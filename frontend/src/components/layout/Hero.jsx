import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-br p-6 from-blue-600 via-blue-700 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          {/* --- Text Content --- */}
          <div className="md:w-1/2 space-y-8 text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Trusted by 10,000+ Happy Customers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent mt-2">
                DeshShera
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-blue-50 leading-relaxed max-w-xl">
              Discover premium products at unbeatable prices. Your satisfaction is our guarantee.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                to="/products"
                className="group relative bg-white text-blue-700 font-bold py-4 px-8 rounded-full text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop All Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/deals"
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 text-yellow-300" />
                Today's Deals
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 justify-center md:justify-start pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-100">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-100">Easy Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-100">Secure Payment</span>
              </div>
            </div>
          </div>

          {/* --- Image Section --- */}
          <div className="md:w-1/2 flex justify-center">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              
              {/* Main Image */}
              <div className="relative">
                <img 
                  src="https://deshshera.com/wp-content/uploads/al_opt_content/IMAGE/deshshera.com/wp-content/uploads/2025/10/DeshSera_hero.webp.bv_resized_desktop.webp.bv.webp?bv_host=deshshera.com" 
                  alt="Featured products" 
                  className="rounded-3xl shadow-2xl w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 border-4 border-white/20"
                />
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white text-blue-700 rounded-2xl shadow-2xl p-4 transform group-hover:scale-110 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <ShoppingBag className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-black">1000+</p>
                      <p className="text-sm text-gray-600">Products</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl shadow-2xl p-4 transform group-hover:scale-110 transition-transform">
                  <div className="text-center">
                    <p className="text-sm font-semibold">UP TO</p>
                    <p className="text-3xl font-black">50%</p>
                    <p className="text-xs">OFF</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 md:h-24 fill-current text-white" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;