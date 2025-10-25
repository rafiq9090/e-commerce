import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../api/productApi';
// 1. Remove the Helmet import
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (your fetchProduct function)
    const fetchProduct = async () => {
      try {
        const response = await getProductBySlug(slug);
        setProduct(response.data);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <p className="container mx-auto p-4">Loading...</p>;
  if (!product) return <p className="container mx-auto p-4">Product not found.</p>;

  const inStock = product.inventory.quantity > 0;
  const mainImage = product.images.length > 0 ? product.images[0].url : '/placeholder-image.jpg';

  return (
    <>
    
      <title>{product.seoTitle}</title>
      <meta name="description" content={product.seoDescription} />

      <div className="container mx-auto p-8">
        <div className="flex flex-col md:flex-row gap-8">

          <div className="md:w-1/2">
            <img 
              src={mainImage} 
              alt={product.name} 
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          </div>
          
          <div className="md:w-1/2">
            <Link 
              to={`/category/${product.category.slug}`} 
              className="text-blue-600 font-semibold"
            >
              {product.category.name}
            </Link>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            
            
          
            <div className="mb-4">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-bold text-red-600">{product.sale_price} BDT</span>
                  <span className="text-xl text-gray-500 line-through ml-2">{product.regular_price} BDT</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-blue-600">{product.regular_price} BDT</span>
              )}
            </div>

            <div className="mb-4">
              {inStock ? (
                <span className="font-semibold text-green-600">In Stock</span>
              ) : (
                <span className="font-semibold text-red-600">Out of Stock</span>
              )}
              <span className="text-gray-500 ml-4">(SKU: {product.inventory.sku})</span>
            </div>
            
            <p className="text-gray-700 mb-6">{product.short_description}</p>
            
    
            <button 
              onClick={() => addToCart(product)}
              disabled={!inStock}
              className={`w-full py-3 rounded-lg text-lg font-semibold ${
                inStock 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Supplier: {product.supplier.name}
            </p>
          </div>
        </div>
        <div className="mt-8">
            <hr className='pt-2.5'></hr>
            <p className="text-gray-700 mb-6">{product.description}</p>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;