// src/components/layout/DesktopSearch.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, Loader } from "lucide-react";
import { searchProducts } from "../../api/productApi";
import { useNavigate } from "react-router-dom";

const DesktopSearch = ({ searchOpen, setSearchOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // Simple outside click handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSearchOpen]);

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await searchProducts(query);
        setSearchResults(response.data || []);
      } catch (error) {
        setSearchError("Search failed");
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleInputFocus = () => setSearchOpen(true);

  return (
    <div className="hidden md:flex flex-1 mx-4 max-w-xl" ref={searchRef}>
      <div className="w-full relative">
        {/* Search Input */}
        <form onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
            setSearchQuery("");
          }
        }} className="flex w-full">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              onFocus={handleInputFocus}
              className="w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>

        {/* Search Results */}
        {searchOpen && searchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50">
            {searchLoading ? (
              <div className="p-4 text-center text-gray-500">
                <Loader className="animate-spin mx-auto mb-2" size={24} />
                <p>Searching products...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-600 font-medium">
                    Found {searchResults.length} products
                  </p>
                </div>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      navigate(`/product/${product.slug || product.id}`);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0]?.url || 'https://placehold.co/60x60?text=No+Image'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-lg font-bold text-blue-600">
                          {parseFloat(product.sale_price || product.regular_price || 0).toFixed(2)} BDT
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-600">No products found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopSearch;