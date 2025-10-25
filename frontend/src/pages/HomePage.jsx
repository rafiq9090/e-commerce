import { useState, useEffect } from 'react';
import { getProducts } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // getProducts() is the function from src/api/productApi.js
        const response = await getProducts();
        
        // Our backend sends the product array in the 'data' property
        setProducts(response.data || []); 
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // The empty array [] means this runs once on component mount

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;