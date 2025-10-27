// src/components/layout/MobileSearch.jsx
import { useState, useRef, useCallback } from "react";
import { Search, X, Loader } from "lucide-react";
import { searchProducts } from "../../api/productApi";
import { useNavigate } from "react-router-dom";

const MobileSearch = ({ searchOpen, setSearchOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setSearchError(null);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await searchProducts(query);
        const results = response.data || [];
        
        setSearchResults(results);
        setSearchError(null);
      } catch (error) {
        console.error("❌ Search error:", error);
        setSearchError("Search failed. Please try again.");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      setSearchError(null);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug || product.id}`);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    setSearchError(null);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const SearchInput = () => (
    <form onSubmit={handleSearchSubmit} className="flex w-full">
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
          className="w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-base"
          autoFocus
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </form>
  );

  const SearchResults = () => {
    if (!searchOpen || searchQuery.length < 2) return null;

    return (
      <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto">
        {searchLoading ? (
          <div className="p-4 text-center text-gray-500">
            <Loader className="animate-spin mx-auto mb-2" size={24} />
            <p>Searching products...</p>
          </div>
        ) : searchError ? (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-gray-600">{searchError}</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-600 font-medium">
                Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
              </p>
            </div>
            {searchResults.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="w-full text-left p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.images?.[0]?.url || product.image || 'https://placehold.co/60x60?text=No+Image'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/60x60?text=No+Image';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {product.category?.name || product.category}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {parseFloat(product.sale_price || product.regular_price || product.price || 0).toFixed(2)} BDT
                    </p>
                  </div>
                </div>
              </button>
            ))}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button
                type="submit"
                onClick={handleSearchSubmit}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                View All Results ({searchResults.length})
              </button>
            </div>
          </>
        ) : searchQuery.length >= 2 ? (
          <div className="p-6 text-center">
            <Search className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">No products found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try different keywords
            </p>
          </div>
        ) : null}
      </div>
    );
  };

  if (!searchOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 bg-white z-50 p-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={clearSearch}
          className="p-2 hover:text-gray-600 transition"
          aria-label="Close search"
        >
          <X size={24} />
        </button>
        <div className="flex-1">
          <SearchInput />
        </div>
      </div>

      <SearchResults />
    </div>
  );
};

export default MobileSearch;