import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Leaf } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateCartItem, removeFromCart, cartTotal, appliedCoupon, applyCoupon, couponCode, setCouponCode, removeCoupon, couponError } = useContext(CartContext);
  const navigate = useNavigate();

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.min((cartTotal * appliedCoupon.value) / 100, appliedCoupon.maxDiscount)
      : appliedCoupon.value
    : 0;
  const shipping = cartTotal >= 299 ? 0 : 49;
  const finalTotal = cartTotal - discount + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm">
          <div className="text-7xl">🛍️</div>
          <div>
            <h2 className="text-xl font-black text-amber-950 dark:text-amber-50">Your cart is empty</h2>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
              Discover our authentic Naivadyam premix, sweets and spices
            </p>
          </div>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm">
            <ShoppingBag className="w-4 h-4" /> Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">Your Cart</h1>
        <p className="text-xs text-amber-700 dark:text-amber-400">{cartItems.length} item(s) · Free shipping above ₹299</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, idx) => (
            <div key={item._id || item.product || idx} className="card-product p-4 flex gap-4">
              <Link to={`/product/${item.slug || item._id}`} className="flex-shrink-0">
                <img src={item.images?.[0] || item.image} alt={item.title}
                  className="w-24 h-24 object-contain rounded-xl bg-amber-50 dark:bg-[#1A0E08] border border-amber-100 dark:border-[#3D2010]"
                />
              </Link>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="veg-badge">Veg</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400">{item.category}</span>
                    </div>
                    <Link to={`/product/${item.slug || item._id}`} className="text-sm font-bold text-amber-950 dark:text-amber-50 hover:text-[#7B1A1A] dark:hover:text-[#E6A817] line-clamp-2">
                      {item.title}
                    </Link>
                    {item.weight && <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">Net Wt: {item.weight}</p>}
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex-shrink-0 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-amber-200 dark:border-[#3D2010] rounded-xl overflow-hidden">
                    <button onClick={() => updateCartItem(item._id, item.qty - 1)} className="px-3 py-1.5 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-[#231508] transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-black text-amber-950 dark:text-amber-50 border-x border-amber-200 dark:border-[#3D2010] min-w-[36px] text-center">{item.qty}</span>
                    <button onClick={() => updateCartItem(item._id, item.qty + 1)} className="px-3 py-1.5 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-[#231508] transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-base font-black text-[#7B1A1A] dark:text-[#E6A817]">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card-product p-5 space-y-5">
            <h2 className="text-base font-black text-amber-950 dark:text-amber-50">Order Summary</h2>

            {/* Coupon */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Apply Coupon
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-[#1D7A40]/10 border border-[#1D7A40]/40 rounded-xl">
                  <div>
                    <p className="text-xs font-black text-[#1D7A40]">{appliedCoupon.code}</p>
                    <p className="text-[10px] text-[#1D7A40]/80">−₹{discount.toFixed(0)} applied</p>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-rose-500 hover:underline font-semibold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NAIVADYAM10"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 placeholder-amber-700/50 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                  />
                  <button onClick={() => applyCoupon(couponCode)} className="btn-gold px-4 py-2 text-xs rounded-xl font-bold">Apply</button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-rose-500">{couponError}</p>}
              <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Try: NAIVADYAM10 · DIWALI25 · FIRSTORDER</p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 border-t border-amber-100 dark:border-[#2A1A0C] pt-4">
              {[
                { label: 'Subtotal', value: `₹${cartTotal.toFixed(0)}` },
                discount > 0 && { label: `Coupon (${appliedCoupon?.code})`, value: `−₹${discount.toFixed(0)}`, green: true },
                { label: 'Shipping', value: shipping === 0 ? 'FREE' : `₹${shipping}`, green: shipping === 0 },
              ].filter(Boolean).map(({ label, value, green }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-amber-700 dark:text-amber-400">{label}</span>
                  <span className={`font-bold ${green ? 'text-[#1D7A40]' : 'text-amber-950 dark:text-amber-50'}`}>{value}</span>
                </div>
              ))}
              <div className="border-t border-amber-200 dark:border-[#3D2010] pt-3 flex justify-between">
                <span className="text-sm font-black text-amber-950 dark:text-amber-50">Total</span>
                <span className="text-lg font-black text-[#7B1A1A] dark:text-[#E6A817]">₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-amber-600/60 dark:text-amber-400/60">
              <Leaf className="w-3 h-3 text-[#1D7A40]" /> 100% Pure Veg · Secure Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
