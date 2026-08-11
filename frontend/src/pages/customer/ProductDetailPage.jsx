import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { Star, ShoppingBag, Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw, Leaf, ChevronRight, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { estimateDelivery, fetchPincodeLocation } from '../../utils/deliveryEstimator';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useContext(CartContext);
  const { user, openAuthModal } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [pincodeError, setPincodeError] = useState('');
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product || data);
      } catch {
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src="/naivadyam-logo.png" alt="Loading" className="h-20 animate-pulse" />
        <p className="text-xs text-amber-700 dark:text-amber-400 tracking-widest">Loading product...</p>
      </div>
    </div>
  );

  if (!product) return null;

  const productId = (product._id || product.id || '').toString();
  const isWishlisted = wishlist.some(id => id.toString() === productId);
  const savings = product.compareAtPrice - product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
        <Link to="/" className="hover:text-[#7B1A1A] dark:hover:text-[#E6A817]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-[#7B1A1A] dark:hover:text-[#E6A817]">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/products?category=${product.category}`} className="hover:text-[#7B1A1A] dark:hover:text-[#E6A817]">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-amber-950 dark:text-amber-100 font-semibold truncate max-w-[180px]">{product.title}</span>
      </nav>

      {/* Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden border border-amber-100 dark:border-[#3D2010] bg-amber-50 dark:bg-[#1A0E08] relative group">
            <img
              src={product.images?.[activeImg] || product.images?.[0]}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
            {product.discountPercentage > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#7B1A1A] text-[#F5C518] text-xs font-black rounded-xl shadow-lg">
                {product.discountPercentage}% OFF
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className="flex items-center justify-center w-8 h-8 bg-white rounded border-2 border-[#1D7A40] shadow">
                <span className="w-4 h-4 rounded-full bg-[#1D7A40]"></span>
              </span>
            </div>
          </div>
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-[#E6A817]' : 'border-amber-100 dark:border-[#3D2010] hover:border-[#E6A817]/50'}`}>
                  <img src={img} alt="" className="w-full h-full object-contain bg-amber-50 dark:bg-[#1A0E08]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-[#7B1A1A] dark:text-amber-400 uppercase tracking-widest border border-[#7B1A1A]/30 rounded px-2 py-0.5">
                {product.category}
              </span>
              <span className="veg-badge">100% Pure Veg</span>
            </div>
            <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">{product.title}</h1>
            {product.weight && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Net Weight: {product.weight}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.ratings?.average || 4.5) ? 'fill-[#E6A817] text-[#E6A817]' : 'text-amber-200'}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-amber-950 dark:text-amber-100">{product.ratings?.average || 4.5}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400">({product.ratings?.count || 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#7B1A1A] dark:text-[#E6A817]">₹{product.price?.toLocaleString()}</span>
              {product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-amber-600/50 line-through">₹{product.compareAtPrice?.toLocaleString()}</span>
                  <span className="px-2 py-1 bg-[#1D7A40]/20 text-[#1D7A40] text-xs font-black rounded-lg border border-[#1D7A40]/40">
                    You save ₹{savings}
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-amber-600/60 dark:text-amber-400/60">Inclusive of all taxes. Free shipping above ₹299.</p>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-amber-200 dark:border-[#3D2010] rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-[#231508] transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-3 text-sm font-black text-amber-950 dark:text-amber-50 border-x border-amber-200 dark:border-[#3D2010] min-w-[48px] text-center">
                  {qty}
                </span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-3 text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-[#231508] transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-amber-600 dark:text-amber-400">{product.stock} in stock</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addToCart(product, qty)}
                className="btn-primary flex-1 py-3.5 rounded-xl font-black flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-all ${isWishlisted ? 'bg-rose-600 text-white border-rose-600' : 'border-amber-200 dark:border-[#3D2010] text-amber-700 dark:text-amber-300 hover:border-[#E6A817]/50'}`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
            <button
              onClick={() => { addToCart(product, qty); navigate('/checkout'); }}
              className="btn-gold w-full py-3.5 rounded-xl font-black"
            >
              Buy Now — ₹{(product.price * qty).toLocaleString()}
            </button>
          </div>

          {/* Delivery Check */}
          <div className="p-4 bg-amber-50 dark:bg-[#1A0E08] rounded-2xl border border-amber-100 dark:border-[#3D2010]">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-[#7B1A1A] dark:text-[#E6A817]" />
              <span className="text-xs font-bold text-amber-950 dark:text-amber-50">Check Delivery</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincode(val);
                    if (deliveryInfo) setDeliveryInfo(null);
                    if (pincodeError) setPincodeError('');
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && pincode.length === 6) {
                      setCheckingDelivery(true);
                      const location = await fetchPincodeLocation(pincode);
                      const result = estimateDelivery(pincode, location.valid ? location : null);
                      setCheckingDelivery(false);
                      if (!location.valid) { setPincodeError('Pincode not found. Please check and try again.'); setDeliveryInfo(null); return; }
                      if (result.valid) { setDeliveryInfo(result); setPincodeError(''); }
                      else { setPincodeError(result.message); setDeliveryInfo(null); }
                    }
                  }}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#231508] border border-amber-200 dark:border-[#3D2010] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                />
              </div>
              <button
                disabled={checkingDelivery}
                onClick={async () => {
                  if (pincode.length !== 6) { setPincodeError('Please enter a complete 6-digit pincode'); return; }
                  setCheckingDelivery(true);
                  const location = await fetchPincodeLocation(pincode);
                  const result = estimateDelivery(pincode, location.valid ? location : null);
                  setCheckingDelivery(false);
                  if (!location.valid) { setPincodeError('Pincode not found. Please check and try again.'); setDeliveryInfo(null); return; }
                  if (result.valid) { setDeliveryInfo(result); setPincodeError(''); }
                  else { setPincodeError(result.message); setDeliveryInfo(null); }
                }}
                className="btn-primary px-4 py-2 text-xs rounded-xl whitespace-nowrap flex items-center gap-1.5 disabled:opacity-60"
              >
                {checkingDelivery ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Check'}
              </button>
            </div>

            {/* Error */}
            {pincodeError && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{pincodeError}</span>
              </div>
            )}

            {/* Delivery Result */}
            {deliveryInfo && (
              <div className="mt-3 bg-white dark:bg-[#231508] rounded-xl border border-[#1D7A40]/30 overflow-hidden">
                {/* Green header bar */}
                <div className="bg-[#1D7A40]/10 dark:bg-[#1D7A40]/20 px-3 py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D7A40] flex-shrink-0" />
                  <span className="text-xs font-bold text-[#1D7A40]">Delivery available to {deliveryInfo.pincode}</span>
                </div>
                {/* Details */}
                <div className="px-3 py-2.5 space-y-2">
                  {/* Location row */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 flex-shrink-0">📍 Location</span>
                    <span className="text-[11px] font-semibold text-amber-950 dark:text-amber-100 text-right">
                      {deliveryInfo.city && deliveryInfo.district
                        ? `${deliveryInfo.city}, ${deliveryInfo.district}, ${deliveryInfo.state}`
                        : deliveryInfo.state || 'India'}
                    </span>
                  </div>
                  {/* Estimated delivery */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">📅 Estimated Delivery</span>
                    <span className="text-[11px] font-bold text-[#1D7A40]">{deliveryInfo.displayDate}</span>
                  </div>
                  {/* Transit time */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">⏱ Transit Time</span>
                    <span className="text-[11px] font-semibold text-amber-950 dark:text-amber-100">{deliveryInfo.businessDays}</span>
                  </div>
                  {/* Shipping */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">🚚 Shipping</span>
                    <span className="text-[11px] font-bold text-[#1D7A40]">FREE Delivery</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, text: '100% Authentic' },
              { icon: <Leaf className="w-4 h-4" />, text: 'Pure Veg' },
              { icon: <RotateCcw className="w-4 h-4" />, text: '7-Day Return' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-50 dark:bg-[#1A0E08] border border-amber-100 dark:border-[#3D2010] text-center">
                <span className="text-[#7B1A1A] dark:text-[#E6A817]">{icon}</span>
                <span className="text-[10px] font-semibold text-amber-900 dark:text-amber-200">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description + Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-black text-amber-950 dark:text-amber-50">Product Description</h2>
          <div className="gold-divider"></div>
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{product.description}</p>
        </div>

        {product.specifications?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-amber-950 dark:text-amber-50">Specifications</h2>
            <div className="gold-divider"></div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-amber-100 dark:divide-[#2A1A0C]">
                {product.specifications.map(({ key, value }) => (
                  <tr key={key}>
                    <td className="py-2.5 pr-4 text-xs font-bold text-amber-700 dark:text-amber-400 w-2/5">{key}</td>
                    <td className="py-2.5 text-xs text-amber-950 dark:text-amber-100">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
