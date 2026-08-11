import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { Star, Heart, ShoppingBag } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart, wishlist, toggleWishlist } = useContext(CartContext);

  const productId = (product._id || product.id || '').toString();
  const isWishlisted = wishlist.some(id => id.toString() === productId);

  return (
    <div className="card-product group flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-amber-50 dark:bg-[#1A0E08]">
        <Link to={`/product/${product.slug || productId}`}>
          <img
            src={product.images ? product.images[0] : product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-[#7B1A1A] text-[#F5C518] text-[11px] font-black rounded-md shadow">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Veg Badge */}
        <span className="absolute top-3 right-3 w-6 h-6 rounded border-2 border-[#1D7A40] bg-white flex items-center justify-center shadow">
          <span className="w-3 h-3 rounded-full bg-[#1D7A40]"></span>
        </span>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute bottom-3 right-3 p-2 rounded-full shadow-md transition-all ${
            isWishlisted
              ? 'bg-rose-600 text-white'
              : 'bg-white/90 dark:bg-[#1A0E08]/90 text-amber-800 hover:bg-white dark:hover:bg-[#2A1A0C]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold text-[#7B1A1A] dark:text-amber-400 uppercase tracking-wider mb-0.5">
            {product.category}
          </p>
          <Link to={`/product/${product.slug || productId}`}>
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-50 line-clamp-2 hover:text-[#7B1A1A] dark:hover:text-[#E6A817] transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 fill-[#E6A817] text-[#E6A817]" />
          <span className="font-bold text-amber-950 dark:text-amber-100">
            {product.ratings?.average || 4.5}
          </span>
          <span className="text-amber-600/60 dark:text-amber-400/60">({product.ratings?.count || 0})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between border-t border-amber-100 dark:border-[#2A1A0C] pt-3">
          <div>
            <span className="text-base font-black text-[#7B1A1A] dark:text-[#E6A817]">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-amber-600/50 dark:text-amber-400/50 line-through ml-2">
                ₹{product.compareAtPrice?.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            className="btn-primary p-2.5 rounded-xl flex items-center justify-center"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#F5C518]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
