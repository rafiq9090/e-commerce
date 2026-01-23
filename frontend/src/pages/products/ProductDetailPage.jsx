import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductBySlug, getRelatedProducts } from "../../api/productApi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  ShoppingCart,
  Truck,
  Shield,
  Star,
  ArrowLeft,
  Heart,
  Share2,
  Package,
  Clock,
  CheckCircle,
  ChevronRight,
  Zap,
  Award,
  RefreshCw,
  ArrowRight
} from "lucide-react";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState(null);
  const breadcrumbRef = useRef(null);
  const [showBreadcrumbFade, setShowBreadcrumbFade] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedImage(null);
        const response = await getProductBySlug(slug);
        const apiData = response?.data ?? response;
        const productData = apiData?.data ?? apiData;
        console.log("Product Data:", productData);
        setProduct(productData);
        if (productData?.images && productData.images.length > 0) {
          setSelectedImage(productData.images[0].url);
        }

        // Fetch related products
        if (productData?.id) {
          fetchRelatedProducts(productData.id);
        }
      } catch (error) {
        console.error("Failed to load product", error);
        setProduct(null);
        setError(error?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const el = breadcrumbRef.current;
    if (!el) return;

    const updateFade = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setShowBreadcrumbFade(hasOverflow && !atEnd);
    };

    updateFade();
    const onScroll = () => requestAnimationFrame(updateFade);
    const onResize = () => updateFade();

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [product?.name, loading]);

  const fetchRelatedProducts = async (productId) => {
    try {
      setLoadingRelated(true);
      const response = await getRelatedProducts(productId, 8);
      const apiData = response?.data ?? response;
      const relatedData = apiData?.data ?? apiData;
      console.log("Related Products:", relatedData);
      setRelatedProducts(Array.isArray(relatedData) ? relatedData : []);
    } catch (error) {
      console.error("Failed to load related products", error);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleOrderNow = async () => {
    if (!inStock) return;

    try {
      if (isAuthenticated) {
        await addToCart(product.id, quantity);
        navigate('/checkout');
      } else {
        const guestProduct = {
          product: product,
          quantity: quantity
        };

        navigate('/checkout', {
          state: {
            guestProducts: [guestProduct]
          }
        });
      }
    } catch (error) {
      console.error("Failed to process order:", error);
      alert('Failed to process order. Please try again.');
    }
  };

  const handleAddToCart = async () => {
    if (!inStock) return;
    try {
      await addToCart(product.id, quantity);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert('Failed to add product to cart');
    }
  };

  const handleAddRelatedToCart = async (relatedProduct) => {
    try {
      await addToCart(relatedProduct.id, 1);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert('Failed to add product to cart');
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === Math.ceil(relatedProducts.length / 4) - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.ceil(relatedProducts.length / 4) - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto p-4 md:p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-8"></div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <div className="h-[500px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl"></div>
              </div>
              <div className="lg:w-1/2 space-y-6">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                <div className="h-16 bg-gray-200 rounded-lg w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white border-2 border-red-200 rounded-3xl p-12 max-w-lg text-center shadow-2xl">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.inventory?.quantity > 0;
  const maxQuantity = inStock ? Math.min(product.inventory.quantity, 10) : 0;
  const hasDiscount = product.sale_price && product.sale_price < product.regular_price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Calculate visible products for carousel
  const itemsPerSlide = 4;
  const visibleProducts = relatedProducts.slice(
    currentSlide * itemsPerSlide,
    (currentSlide + 1) * itemsPerSlide
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <title>{product.seoTitle || product.name}</title>
      <meta name="description" content={product.seoDescription} />

      <div className="container mx-auto p-4 md:p-8">
        {/* Breadcrumb Navigation */}
        <nav
          ref={breadcrumbRef}
          className="relative flex items-center gap-2 text-xs sm:text-sm mb-6 sm:mb-8 bg-white rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-sm flex-nowrap w-full max-w-full overflow-x-auto whitespace-nowrap scrollbar-hide"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium whitespace-nowrap"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <ChevronRight size={16} className="text-gray-400" />
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap">Home</Link>
          <ChevronRight size={16} className="text-gray-400" />
          <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap">Products</Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-900 font-semibold truncate max-w-[12rem] sm:max-w-xs">{product.name}</span>
          {showBreadcrumbFade && (
            <span className="pointer-events-none absolute right-0 top-0 h-full w-6 sm:w-8 bg-gradient-to-l from-white to-transparent" />
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* LEFT: Product Images */}
          <div className="lg:w-1/2">
            <div className="sticky top-4">
              {/* Main Image Container */}
              <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl mb-6 bg-gradient-to-br from-gray-100 to-gray-200 group">
                <img
                  src={selectedImage || "https://placehold.co/600x400?text=No+Image"}
                  alt={product.name}
                  className="w-full h-96 lg:h-[550px] object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image" }}
                />

                {/* Floating Action Buttons */}
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <button
                    onClick={toggleWishlist}
                    className={`p-4 rounded-2xl backdrop-blur-md transition-all shadow-lg hover:scale-110 ${isWishlisted
                        ? "bg-red-500 text-white"
                        : "bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
                      }`}
                  >
                    <Heart size={22} className={isWishlisted ? "fill-current" : ""} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="p-4 bg-white/90 backdrop-blur-md rounded-2xl text-gray-700 hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:scale-110"
                    >
                      <Share2 size={22} />
                    </button>
                  </div>
                </div>

                {/* Discount Badge */}
                {hasDiscount && (
                  <div className="absolute top-6 left-6">
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-pulse">
                      <Zap size={20} className="fill-current" />
                      <span className="text-lg">{discountPercentage}% OFF</span>
                    </div>
                  </div>
                )}

                {/* Stock Badge */}
                {inStock && product.inventory.quantity <= 5 && (
                  <div className="absolute bottom-6 left-6">
                    <div className="bg-orange-500 text-white font-bold px-5 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Clock size={18} />
                      <span>Only {product.inventory.quantity} left!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
                  {product.images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.url)}
                      className={`flex-shrink-0 border-3 rounded-2xl overflow-hidden transition-all transform hover:scale-105 ${selectedImage === image.url
                          ? "border-blue-600 shadow-lg ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-400"
                        }`}
                    >
                      <img
                        src={image.url}
                        alt={product.name}
                        className="w-24 h-24 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="lg:w-1/2">
            {/* Category Badge */}
            {product.category && (
              <Link
                to={`/category/${product.category.slug}`}
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold uppercase text-sm px-4 py-2 rounded-full hover:bg-blue-100 transition-colors mb-4"
              >
                <span>{product.category.name}</span>
                <ChevronRight size={14} />
              </Link>
            )}

            {/* Product Name */}
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className="text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">4.5</span>
              </div>
              <span className="text-gray-600">128 reviews</span>
              <span className="text-gray-400">•</span>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle size={16} />
                Verified Seller
              </span>
            </div>

            {/* Price Section */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
              <div className="flex items-end gap-4 mb-2">
                {hasDiscount ? (
                  <>
                    <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatPrice(product.sale_price)} BDT
                    </span>
                    <span className="text-2xl text-gray-500 line-through mb-2">
                      {formatPrice(product.regular_price)} BDT
                    </span>
                  </>
                ) : (
                  <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatPrice(product.regular_price)} BDT
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl inline-flex font-semibold">
                  <Award size={18} />
                  <span>You save {formatPrice(product.regular_price - product.sale_price)} BDT ({discountPercentage}%)</span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {inStock ? (
                <div className="flex items-center gap-3 bg-green-50 px-5 py-3 rounded-2xl border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-green-700 text-lg">
                    In Stock ({product.inventory.quantity} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-red-50 px-5 py-3 rounded-2xl border border-red-200">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-bold text-red-700 text-lg">Out of Stock</span>
                </div>
              )}
              {product.inventory?.sku && (
                <p className="text-gray-500 text-sm mt-3 ml-1">SKU: {product.inventory.sku}</p>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.short_description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {inStock && (
              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="px-6 py-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xl rounded-l-2xl"
                    >
                      −
                    </button>
                    <span className="px-8 py-4 font-bold text-xl min-w-20 text-center bg-gray-50">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= maxQuantity}
                      className="px-6 py-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xl rounded-r-2xl"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Max: {maxQuantity} per order
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-3 py-5 px-8 rounded-2xl text-lg font-bold transition-all shadow-lg ${inStock
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <ShoppingCart size={22} />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>

              <button
                onClick={handleOrderNow}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-3 py-5 px-8 rounded-2xl text-lg font-bold border-3 transition-all shadow-lg ${inStock
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                  }`}
              >
                <Zap size={22} />
                Order Now
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-5 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="bg-blue-600 p-3 rounded-xl mb-2">
                  <Truck size={22} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900">Free Shipping</span>
                <span className="text-xs text-gray-600 mt-1">On orders over 500 BDT</span>
              </div>
              <div className="flex flex-col items-center text-center p-5 bg-green-50 rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
                <div className="bg-green-600 p-3 rounded-xl mb-2">
                  <Shield size={22} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900">Secure Payment</span>
                <span className="text-xs text-gray-600 mt-1">100% Protected</span>
              </div>
              <div className="flex flex-col items-center text-center p-5 bg-purple-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow">
                <div className="bg-purple-600 p-3 rounded-xl mb-2">
                  <RefreshCw size={22} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900">Easy Returns</span>
                <span className="text-xs text-gray-600 mt-1">7 Days Return</span>
              </div>
            </div>

            {/* Supplier Info */}
            {product.supplier && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sold by</p>
                    <p className="font-bold text-gray-900 text-lg">{product.supplier.name}</p>
                  </div>
                  <CheckCircle className="ml-auto text-green-600" size={24} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="mt-16 bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-black mb-8 text-gray-900 flex items-center gap-3">
              <div className="w-1.5 h-10 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              Product Description
            </h2>
            <div
              className="rich-text text-lg"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-1.5 h-10 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                You May Also Like
              </h2>
              <div className="flex items-center gap-4">
                <Link
                  to="/products"
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 group"
                >
                  View All
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                {relatedProducts.length > itemsPerSlide && (
                  <div className="flex gap-2">
                    <button
                      onClick={prevSlide}
                      className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loadingRelated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-3xl h-64 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {visibleProducts.map((relatedProduct) => {
                    const relatedInStock = relatedProduct.inventory?.quantity > 0;
                    const relatedHasDiscount = relatedProduct.sale_price && relatedProduct.sale_price < relatedProduct.regular_price;
                    const relatedDiscount = relatedHasDiscount
                      ? Math.round(((relatedProduct.regular_price - relatedProduct.sale_price) / relatedProduct.regular_price) * 100)
                      : 0;

                    return (
                      <div
                        key={relatedProduct.id}
                        className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
                      >
                        <Link to={`/product/${relatedProduct.slug || relatedProduct.id}`}>
                          <div className="relative overflow-hidden">
                            <img
                              src={relatedProduct.images?.[0]?.url || relatedProduct.image || 'https://placehold.co/300x300?text=No+Image'}
                              alt={relatedProduct.name}
                              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/300x300?text=No+Image';
                              }}
                            />
                            {relatedHasDiscount && (
                              <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                                -{relatedDiscount}%
                              </div>
                            )}
                            {!relatedInStock && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-full">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                            <button className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:scale-110">
                              <Heart size={18} className="text-gray-600" />
                            </button>
                          </div>
                        </Link>

                        <div className="p-5">
                          <Link to={`/product/${relatedProduct.slug || relatedProduct.id}`}>
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-12">
                              {relatedProduct.name}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className="text-yellow-400 fill-current"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">(4.5)</span>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            {relatedHasDiscount ? (
                              <>
                                <span className="text-2xl font-black text-gray-900">
                                  {formatPrice(relatedProduct.sale_price)} BDT
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(relatedProduct.regular_price)} BDT
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-black text-gray-900">
                                {formatPrice(relatedProduct.regular_price)} BDT
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddRelatedToCart(relatedProduct);
                            }}
                            disabled={!relatedInStock}
                            className={`w-full py-3 rounded-xl font-semibold transition-all transform flex items-center justify-center gap-2 ${relatedInStock
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg group-hover:scale-105"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            <ShoppingCart size={18} />
                            {relatedInStock ? "Add to Cart" : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Slide Indicators */}
                {relatedProducts.length > itemsPerSlide && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.ceil(relatedProducts.length / itemsPerSlide) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${currentSlide === index
                            ? "w-8 bg-gradient-to-r from-blue-600 to-indigo-600"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                          }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
