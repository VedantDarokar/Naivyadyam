import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Truck, Lock, CreditCard, ChevronRight, Calendar, MapPin, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { fetchPincodeLocation, estimateDelivery } from '../../utils/deliveryEstimator';
import RazorpayModal from '../../components/common/RazorpayModal';


const CheckoutPage = () => {
  const { cartItems, cartTotal, appliedCoupon, clearCart } = useContext(CartContext);
  const { user, openAuthModal } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    street: '', city: '', state: '', pincode: '', landmark: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Razorpay Fallback Modal State
  const [razorpayModalData, setRazorpayModalData] = useState(null);

  // Delivery estimate state
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleRazorpaySuccess = async (response) => {
    try {
      setLoading(true);
      await api.post('/payment/verify', response);
      clearCart();
      navigate(`/order-tracking/${response.orderId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
      setRazorpayModalData(null);
    }
  };


  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.min((cartTotal * (appliedCoupon.value || appliedCoupon.discountValue || 10)) / 100, appliedCoupon.maxDiscount || 1000)
      : (appliedCoupon.value || appliedCoupon.discountValue || 0)
    : 0;
  const shipping = cartTotal >= 299 ? 0 : 49;
  const codCharge = paymentMethod === 'cod' ? 25 : 0;
  const finalTotal = cartTotal - discount + shipping + codCharge;

  const handleUpdate = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'pincode') {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      // Reset estimate when pincode changes
      setDeliveryEstimate(null);
      // Auto-fetch when 6 digits entered (debounced)
      clearTimeout(debounceRef.current);
      if (cleaned.length === 6) {
        setEstimateLoading(true);
        debounceRef.current = setTimeout(async () => {
          const location = await fetchPincodeLocation(cleaned);
          const estimate = estimateDelivery(cleaned, location.valid ? location : null);
          setEstimateLoading(false);
          if (estimate.valid) {
            setDeliveryEstimate({ ...estimate, locationValid: location.valid });
            // Auto-fill city & state if they are empty
            if (location.valid) {
              setForm((prev) => ({
                ...prev,
                city: prev.city || location.district || location.city || '',
                state: prev.state || location.state || '',
              }));
            }
          }
        }, 600);
      } else {
        setEstimateLoading(false);
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) { openAuthModal(); return; }
    if (!form.name || !form.street || !form.city || !form.pincode) {
      alert('Please fill in all required address fields (*)');
      return;
    }
    setLoading(true);
    try {
      const orderPayload = {
        orderItems: cartItems.map((i) => ({
          product: i._id || i.product,
          title: i.title,
          image: i.images?.[0] || i.image,
          quantity: i.qty || i.quantity || 1,
          price: i.price
        })),
        shippingAddress: form,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        totalAmount: finalTotal,
      };

      const { data } = await api.post('/orders', orderPayload);
      const createdOrder = data.order || data;
      const orderId = createdOrder._id;

      if (paymentMethod === 'razorpay') {
        try {
          const { data: rpData } = await api.post('/payment/create-order', { orderId });
          const isRealRazorpayKey = rpData.key && !rpData.key.includes('Naivadyam') && /^rzp_(test|live)_[A-Za-z0-9]+$/.test(rpData.key);
          
          if (isRealRazorpayKey && window.Razorpay) {
            try {
              const rzp = new window.Razorpay({
                key: rpData.key,
                amount: rpData.amount,
                currency: 'INR',
                name: 'Naivadyam — The Divine Serve',
                description: 'Authentic Indian Premix & Sweets',
                image: '/naivadyam-logo.png',
                order_id: rpData.id || rpData.razorpayOrderId,
                theme: { color: '#7B1A1A' },
                handler: async (response) => {
                  await handleRazorpaySuccess({ orderId, ...response });
                },
                modal: {
                  ondismiss: () => setLoading(false)
                },
                prefill: { name: form.name, email: form.email, contact: form.phone },
              });
              rzp.on('payment.failed', (failRes) => {
                console.warn('Official Razorpay Payment Failed event:', failRes);
                setRazorpayModalData({ ...rpData, orderId });
              });
              rzp.open();
            } catch (openErr) {
              console.warn('Official Razorpay checkout popup error, using gateway modal:', openErr);
              setRazorpayModalData({ ...rpData, orderId });
            }
          } else {
            // Placeholder/Test mode — use full interactive Razorpay sandbox modal
            setRazorpayModalData({ ...rpData, orderId });
          }
        } catch (rpErr) {
          console.warn('Razorpay order creation fallback:', rpErr);
          setRazorpayModalData({ amount: Math.round(finalTotal * 100), id: 'order_rzp_demo', orderId });
        }
      } else {
        // Cash on Delivery
        clearCart();
        navigate(`/order-tracking/${orderId}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">Checkout</h1>
        <p className="text-xs text-amber-700 dark:text-amber-400">{cartItems.length} item(s) · Secure checkout</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 text-xs font-bold">
        {['Delivery', 'Payment', 'Confirm'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${step === i + 1 ? 'bg-[#7B1A1A] text-[#F5C518]' : step > i + 1 ? 'bg-[#1D7A40] text-white' : 'bg-amber-100 dark:bg-[#231508] text-amber-700 dark:text-amber-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === i + 1 ? 'bg-[#E6A817] text-[#3D1206]' : step > i + 1 ? 'bg-white/20' : 'bg-amber-200 dark:bg-[#3D2010]'}`}>{step > i + 1 ? '✓' : i + 1}</span>
              {s}
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-amber-400/40" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery Address */}
          <div className="card-product p-6 space-y-5">
            <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#7B1A1A] dark:text-[#E6A817]" /> Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name *', field: 'name', placeholder: 'Your full name', col: 1 },
                { label: 'Email *', field: 'email', placeholder: 'your@email.com', col: 1 },
                { label: 'Phone *', field: 'phone', placeholder: '10-digit mobile number', col: 1 },
                { label: 'Pincode *', field: 'pincode', placeholder: '6-digit pincode', col: 1 },
                { label: 'Street / House No. *', field: 'street', placeholder: 'Door no., street, area', col: 2 },
                { label: 'City *', field: 'city', placeholder: 'City', col: 1 },
                { label: 'State *', field: 'state', placeholder: 'State', col: 1 },
                { label: 'Landmark', field: 'landmark', placeholder: 'Near temple, school etc.', col: 2 },
              ].map(({ label, field, placeholder, col }) => (
                <div key={field} className={col === 2 ? 'sm:col-span-2' : ''}>
                  <label className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest block mb-1.5">{label}</label>
                  <div className="relative">
                    {field === 'pincode' && (
                      <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3 pointer-events-none" />
                    )}
                    <input
                      type="text"
                      value={form[field]}
                      maxLength={field === 'pincode' ? 6 : undefined}
                      onChange={(e) => handleUpdate(field, field === 'pincode' ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value)}
                      placeholder={placeholder}
                      className={`w-full py-2.5 text-sm rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30 placeholder-amber-700/40 dark:placeholder-amber-500/40 ${field === 'pincode' ? 'pl-9 pr-4' : 'px-4'}`}
                    />
                    {field === 'pincode' && estimateLoading && (
                      <Loader2 className="w-3.5 h-3.5 text-amber-500 absolute right-3 top-3 animate-spin" />
                    )}
                  </div>
                  {/* Inline hint for pincode */}
                  {field === 'pincode' && deliveryEstimate && !estimateLoading && (
                    <p className="mt-1 text-[11px] text-[#1D7A40] font-semibold flex items-center gap-1">
                      ✓ {deliveryEstimate.city && deliveryEstimate.district
                        ? `${deliveryEstimate.city}, ${deliveryEstimate.district}, ${deliveryEstimate.state}`
                        : deliveryEstimate.state || 'India'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card-product p-6 space-y-4">
            <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#7B1A1A] dark:text-[#E6A817]" /> Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { id: 'razorpay', label: '🔒 Pay Online (UPI / Card / Netbanking)', sub: 'Secured by Razorpay' },
                { id: 'cod', label: '💵 Cash on Delivery', sub: '₹25 COD charge may apply' },
              ].map(({ id, label, sub }) => (
                <label key={id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === id ? 'border-[#E6A817] bg-[#E6A817]/5' : 'border-amber-200 dark:border-[#3D2010] hover:border-[#E6A817]/50'}`}>
                  <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="accent-[#7B1A1A]" />
                  <div>
                    <p className="text-sm font-bold text-amber-950 dark:text-amber-50">{label}</p>
                    <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70">{sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          <div className="card-product p-5 space-y-5">
            <h2 className="text-base font-black text-amber-950 dark:text-amber-50">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item._id || item.product} className="flex gap-3">
                  <img src={item.images?.[0] || item.image} alt={item.title} className="w-14 h-14 rounded-lg object-contain bg-amber-50 dark:bg-[#1A0E08] border border-amber-100 dark:border-[#3D2010] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-950 dark:text-amber-50 line-clamp-2">{item.title}</p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">Qty: {item.qty || item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="text-sm font-black text-[#7B1A1A] dark:text-[#E6A817] flex-shrink-0">₹{(item.price * (item.qty || item.quantity)).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Free Delivery Progress Banner */}
            {(() => {
              const needed = 299 - cartTotal;
              const progress = Math.min((cartTotal / 299) * 100, 100);
              return shipping === 0 ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1D7A40]/10 dark:bg-[#1D7A40]/15 border border-[#1D7A40]/30 rounded-xl">
                  <span className="text-base">🎉</span>
                  <div>
                    <p className="text-[11px] font-black text-[#1D7A40]">You've unlocked FREE Delivery!</p>
                    <p className="text-[10px] text-[#1D7A40]/70">No shipping charges on your order.</p>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2.5 bg-amber-50 dark:bg-[#1A0E08] border border-amber-200 dark:border-[#3D2010] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">🚚 Add <strong className="text-amber-900 dark:text-amber-100 mx-0.5">₹{needed.toFixed(0)}</strong> more for <strong className="text-[#1D7A40] ml-0.5">FREE delivery</strong></span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-amber-200 dark:bg-[#3D2010] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1D7A40] to-[#2ea854] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-amber-500 dark:text-amber-500">
                    <span>₹0</span><span className="font-bold text-[#1D7A40]">₹299</span>
                  </div>
                </div>
              );
            })()}

            {/* Price Breakdown */}
            <div className="space-y-2 border-t border-amber-100 dark:border-[#2A1A0C] pt-4 text-xs">
              <div className="flex justify-between"><span className="text-amber-700 dark:text-amber-400">Subtotal</span><span className="font-bold">₹{cartTotal.toFixed(0)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-amber-700 dark:text-amber-400">Coupon ({appliedCoupon?.code})</span><span className="font-bold text-[#1D7A40]">−₹{discount.toFixed(0)}</span></div>}
              <div className="flex justify-between"><span className="text-amber-700 dark:text-amber-400">Shipping</span><span className={`font-bold ${shipping === 0 ? 'text-[#1D7A40]' : ''}`}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              {codCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-400">COD Charge</span>
                  <span className="font-bold text-rose-500">+₹{codCharge}</span>
                </div>
              )}
              <div className="border-t border-amber-200 dark:border-[#3D2010] pt-2 flex justify-between">
                <span className="font-black text-amber-950 dark:text-amber-50 text-sm">Total</span>
                <span className="font-black text-[#7B1A1A] dark:text-[#E6A817] text-lg">₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>

            {/* Estimated Delivery Card */}
            {estimateLoading && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 dark:bg-[#1A0E08] rounded-xl border border-amber-200 dark:border-[#3D2010]">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" />
                <span className="text-xs text-amber-600 dark:text-amber-400">Checking delivery to {form.pincode}...</span>
              </div>
            )}
            {deliveryEstimate && !estimateLoading && (
              <div className="rounded-xl border border-[#1D7A40]/40 overflow-hidden">
                {/* Header */}
                <div className="bg-[#1D7A40]/10 dark:bg-[#1D7A40]/20 px-3 py-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#1D7A40]" />
                  <span className="text-xs font-bold text-[#1D7A40]">Estimated Delivery</span>
                </div>
                {/* Details */}
                <div className="px-3 py-2.5 space-y-1.5 text-[11px]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-amber-700 dark:text-amber-400 flex-shrink-0">📍 Delivering to</span>
                    <span className="font-semibold text-amber-950 dark:text-amber-100 text-right">
                      {deliveryEstimate.city && deliveryEstimate.district
                        ? `${deliveryEstimate.city}, ${deliveryEstimate.district}`
                        : deliveryEstimate.state || 'India'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-400">📅 Arrival by</span>
                    <span className="font-bold text-[#1D7A40] text-xs">{deliveryEstimate.displayDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-400">⏱ Transit</span>
                    <span className="font-semibold text-amber-950 dark:text-amber-100">{deliveryEstimate.businessDays}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-400">🚚 Shipping</span>
                    <span className="font-bold text-[#1D7A40]">FREE</span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handlePlaceOrder} disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-60">
              <Lock className="w-4 h-4" />
              {loading ? 'Placing Order...' : `Confirm & Place Order · ₹${finalTotal.toFixed(0)}`}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-amber-600/60 dark:text-amber-400/60">
              <ShieldCheck className="w-3 h-3 text-[#1D7A40]" /> Secured by Razorpay · SSL Encrypted
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Modal Fallback */}
      <RazorpayModal
        isOpen={!!razorpayModalData}
        onClose={() => { setRazorpayModalData(null); setLoading(false); }}
        orderData={razorpayModalData}
        onPaymentSuccess={handleRazorpaySuccess}
      />
    </div>
  );
};


export default CheckoutPage;
