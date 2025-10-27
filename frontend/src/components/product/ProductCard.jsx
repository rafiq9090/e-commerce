import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { ShoppingCart, Star, Truck } from "lucide-react";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();


  if (!product) {
    return (
      <div className="border border-gray-200 rounded-2xl shadow-lg overflow-hidden bg-white flex flex-col animate-pulse">
        <div className="w-full h-48 bg-gray-300"></div>
        <div className="flex flex-col flex-grow p-4 space-y-2">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mt-2"></div>
        </div>
      </div>
    );
  }

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://placehold.co/300x300?text=No+Image";

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const isOutOfStock = product.inventory?.quantity <= 0;
  const hasDiscount = product.sale_price && product.sale_price < product.regular_price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2">
      
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1">
            <span>🔥</span>
            {discountPercentage}% OFF
          </span>
        </div>
      )}

      {isOutOfStock && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
            Out of Stock
          </span>
        </div>
      )}

      
      {product.isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            Featured
          </span>
        </div>
      )}


      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden">
        <div className="relative h-60 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "https://placehold.co/300x300?text=No+Image";
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
 
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <span className="text-sm font-semibold text-gray-800">Quick View</span>
            </div>
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-black/80 px-6 py-3 rounded-xl backdrop-blur-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
   
        {product.category && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
        )}

  
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className="text-yellow-400 fill-current"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(4.5)</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          {hasDiscount ? (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(product.sale_price)} BDT
              </p>
              <p className="text-lg font-semibold line-through text-gray-400">
                {formatPrice(product.regular_price)} BDT
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(product.regular_price)} BDT
            </p>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all duration-300 ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          <ShoppingCart size={18} />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

        <div className="mt-3 text-center">
              
          <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
            <Truck size={12} className="inline-block mr-1" />

           Free Shipping
          </span>
        </div>
      </div>

    
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ProductCard;