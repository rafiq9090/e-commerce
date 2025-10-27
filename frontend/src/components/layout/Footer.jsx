import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  Clock,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">DeshShera</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted online shopping destination. Quality products, unbeatable prices, and exceptional service since 2020.
            </p>
            
            {/* Social Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-blue-600 p-3 rounded-lg transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-pink-600 p-3 rounded-lg transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-blue-400 p-3 rounded-lg transition-all duration-300 hover:scale-110"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-all duration-300 hover:scale-110"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Today's Deals
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shipping" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Return & Refund
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg mt-1">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 leading-relaxed">
                    123 Shopping Street,<br />
                    Dhaka 1205, Bangladesh
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-400" />
                </div>
                <a href="tel:+8801234567890" className="hover:text-blue-400 transition-colors">
                  +880 1234-567890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <a href="mailto:support@deshshera.com" className="hover:text-blue-400 transition-colors">
                  support@deshshera.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-gray-400">
                  Mon - Sat: 9AM - 9PM
                </p>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Features Strip */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Free Shipping</p>
                <p className="text-sm text-gray-400">On orders over 500 BDT</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Secure Payment</p>
                <p className="text-sm text-gray-400">100% Protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Easy Returns</p>
                <p className="text-sm text-gray-400">7 Days Return Policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Best Quality</p>
                <p className="text-sm text-gray-400">Guaranteed Products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 mb-6">Get the latest updates on new products and upcoming sales</p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} DeshShera. All rights reserved. Made with <Heart className="w-4 h-4 text-red-500 inline" /> in Bangladesh
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;