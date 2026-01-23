import { useState, useEffect } from 'react';
import { getProducts } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import Hero from '../../components/layout/Hero';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getProducts({ limit: 8 });
        
        // ✅ Handle different API response structures
        let productsData = [];
        
        if (response.data?.products && Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (Array.isArray(response.products)) {
          productsData = response.products;
        } else if (Array.isArray(response)) {
          productsData = response;
        }
        
        setProducts(productsData || []);
        
      } catch (error) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderLoading = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-gray-600">Loading featured products...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
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

  const renderEmpty = () => (
    <div className="text-center py-12">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
        <p className="text-gray-600">Check back later for new products!</p>
      </div>
    </div>
  );

  return (
    <>
      <Hero />
      
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Featured Products
          </h1>
          <p className="text-gray-600">
            Discover our amazing collection of products
          </p>
          {!loading && !error && products.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : products.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
