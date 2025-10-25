// src/components/ProductCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // <-- fixed path
// Correct path if this file is in src/components

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // Use the first image or fallback placeholder
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://via.placeholder.com/300x300.png?text=No+Image";

  // Handle adding product to cart without navigating
  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop <Link> navigation
    addToCart(product);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="border rounded-lg shadow-lg p-4 flex flex-col hover:shadow-xl transition-shadow duration-300"
    >
      {/* Product Image */}
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />

      {/* Product Info */}
      <div className="flex-grow">
        <h2 className="text-xl font-semibold mb-2 truncate">{product.name}</h2>
        <p className="text-gray-600 mb-2 h-12 overflow-hidden">
          {product.short_description || "No description available"}
        </p>
      </div>

      {/* Price and Add to Cart */}
      <div className="mt-4">
        <p className="text-lg font-bold text-blue-600">
          {product.regular_price} BDT
        </p>
        <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
