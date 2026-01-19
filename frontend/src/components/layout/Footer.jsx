import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllContent } from '../../api/contentApi';
import { subscribeNewsletter } from '../../api/newsletterApi';
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
  const [siteContent, setSiteContent] = useState({});
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getAllContent();
        const data = res.data || res;

        // Handle both Object (new) and Array (old) formats for robustness
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setSiteContent(data);
        } else if (Array.isArray(data)) {
          const contentMap = {};
          data.forEach(c => contentMap[c.key] = c.value);
          setSiteContent(contentMap);
        }
      } catch (error) {
        console.error("Error fetching site content for Footer:", error);
      }
    };
    fetchContent();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterStatus('');
    if (!newsletterEmail.trim()) {
      setNewsletterStatus('Please enter a valid email.');
      return;
    }
    try {
      setNewsletterLoading(true);
      await subscribeNewsletter(newsletterEmail.trim());
      setNewsletterStatus('Thanks for subscribing!');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterStatus(error?.response?.data?.message || 'Subscription failed. Try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                {siteContent.site_logo ? (
                  <img src={siteContent.site_logo} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-white" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-white">{siteContent.site_name || "DeshShera"}</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {siteContent.footer_description || "Your trusted online shopping destination. Quality products, unbeatable prices, and exceptional service since 2020."}
            </p>

            {/* Social Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {siteContent.social_facebook && (
                  <a
                    href={siteContent.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-blue-600 p-3 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {siteContent.social_instagram && (
                  <a
                    href={siteContent.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-pink-600 p-3 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {siteContent.social_twitter && (
                  <a
                    href={siteContent.social_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-blue-400 p-3 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {siteContent.social_youtube && (
                  <a
                    href={siteContent.social_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-red-600 p-3 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {/* Fallback if no socials are set */}
                {!siteContent.social_facebook && !siteContent.social_instagram && !siteContent.social_twitter && !siteContent.social_youtube && (
                  <span className="text-xs text-gray-500">No social links configured.</span>
                )}
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
                <Link to="/contact" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300"></span>
                  Contact Us
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
                <Link to="/track-order" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
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
                  <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                    {siteContent.contact_address || "123 Shopping Street,\nDhaka 1205, Bangladesh"}
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-400" />
                </div>
                <a href={`tel:${siteContent.contact_phone || "+8801234567890"}`} className="hover:text-blue-400 transition-colors">
                  {siteContent.contact_phone || "+880 1234-567890"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <a href={`mailto:${siteContent.contact_email || "support@deshshera.com"}`} className="hover:text-blue-400 transition-colors">
                  {siteContent.contact_email || "support@deshshera.com"}
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
      {siteContent.show_newsletter !== 'false' && (
        <div className="border-t border-gray-800 bg-gray-900/50">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-white mb-3">{siteContent.newsletter_title || 'Subscribe to Our Newsletter'}</h3>
              <p className="text-gray-400 mb-6">{siteContent.newsletter_description || 'Get the latest updates on new products and upcoming sales'}</p>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsletterStatus && (
                <p className="text-sm text-gray-400 mt-4">{newsletterStatus}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} {siteContent.footer_copyright || "DeshShera. All rights reserved. Made with Love in Bangladesh"}
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
