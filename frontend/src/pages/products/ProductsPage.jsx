import { useState, useEffect } from 'react';
import { getProducts } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [page, setPage] = useState(1);
  const limit = 12;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.sortBy, filters.order]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (page === 1) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }
        const response = await getProducts({ ...filters, page, limit });
        
        // ✅ Handle different API response structures
        let productsData = [];
        let pagination = null;
        
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (Array.isArray(response.products)) {
          productsData = response.products;
        } else if (Array.isArray(response)) {
          productsData = response;
        } else if (response?.data?.products) {
          productsData = response.data.products;
        }

        pagination = response?.data?.pagination || response?.pagination || null;
        
        setProducts((prev) => (page === 1 ? (productsData || []) : [...prev, ...(productsData || [])]));
        if (pagination) {
          setHasMore(pagination.page < pagination.pages);
        } else {
          setHasMore((productsData || []).length === limit);
        }
        
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (page === 1) {
          setError(err.response?.data?.message || err.message || "Could not load products.");
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [filters, page]); // ✅ Re-fetch when filters/page change

  // ✅ Better loading component
  const renderLoading = () => (
    <div className="container mx-auto p-8">
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      <p className="text-center text-gray-600 mt-4">Loading products...</p>
    </div>
  );

  // ✅ Better error component
  const renderError = () => (
    <div className="container mx-auto p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Products</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // ✅ Better empty state
  const renderEmpty = () => (
    <div className="container mx-auto p-8">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
        <p className="text-gray-600 mb-4">
          {filters.category ? `No products found in ${filters.category} category.` : 'No products available at the moment.'}
        </p>
        {filters.category && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View All Products
          </button>
        )}
      </div>
    </div>
  );

  // ✅ Simple filter component
  const renderFilters = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Newest</option>
            <option value="name">Name</option>
            <option value="regular_price">Price</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            id="order"
            value={filters.order}
            onChange={(e) => setFilters(prev => ({ ...prev, order: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          All Products
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our complete collection of amazing products
        </p>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Products Grid */}
      {products.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Load More (if you have pagination) */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loadingMore}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
