import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, showToast } = useContext(AuthContext);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('naivadyam_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('naivadyam_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    localStorage.setItem('naivadyam_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('naivadyam_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync wishlist from server on login or user update
  useEffect(() => {
    if (user) {
      if (Array.isArray(user.wishlist) && user.wishlist.length > 0) {
        setWishlist(user.wishlist.map(w => typeof w === 'object' ? (w._id || w.id || w).toString() : String(w)));
      } else {
        // Fetch full profile to get wishlist from DB
        api.get('/auth/profile')
          .then(({ data }) => {
            if (data && Array.isArray(data.wishlist)) {
              setWishlist(data.wishlist.map(w => typeof w === 'object' ? (w._id || w.id || w).toString() : String(w)));
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  const addToCart = (product, quantity = 1, variant = { size: '', color: '' }) => {
    setCart((prevCart) => {
      const pId = product._id || product.id;
      const variantKey = `${variant.size || ''}-${variant.color || ''}`;
      const existingIndex = prevCart.findIndex(
        (item) => (item.product === pId || item._id === pId) && item.variantKey === variantKey
      );

      const price = variant.price || product.price;
      const title = product.title;
      const image = product.images ? product.images[0] : (product.image || '');

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].qty = updated[existingIndex].quantity;
        showToast(`Updated ${product.title} quantity in cart`, 'info');
        return updated;
      } else {
        showToast(`Added ${product.title} to cart`, 'success');
        return [
          ...prevCart,
          {
            _id: pId,
            product: pId,
            title: title,
            image: image,
            images: product.images || [image],
            price: price,
            quantity: quantity,
            qty: quantity,
            variant: variant,
            variantKey: variantKey,
            category: product.category,
            weight: product.weight || '',
            slug: product.slug || '',
            maxStock: variant.stock || product.stock || 50
          }
        ];
      }
    });
  };

  const removeFromCart = (productId, variantKey) => {
    setCart((prev) => prev.filter((item) => {
      const idMatch = item.product === productId || item._id === productId;
      if (variantKey !== undefined) {
        return !(idMatch && item.variantKey === variantKey);
      }
      return !idMatch;
    }));
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, variantKey, quantity) => {
    let newQty = quantity;
    if (typeof variantKey === 'number' && quantity === undefined) {
      newQty = variantKey;
      variantKey = undefined;
    }

    if (newQty <= 0) {
      removeFromCart(productId, variantKey);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const idMatch = item.product === productId || item._id === productId;
        if (idMatch && (variantKey === undefined || item.variantKey === variantKey)) {
          const qty = Math.min(newQty, item.maxStock || 99);
          return { ...item, quantity: qty, qty: qty };
        }
        return item;
      })
    );
  };

  const updateCartItem = (productId, qty) => {
    updateQuantity(productId, undefined, qty);
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const toggleWishlist = async (product) => {
    const pId = (product._id || product.id || product).toString();
    const isWishlisted = wishlist.some(id => id.toString() === pId);

    const updatedWishlist = isWishlisted
      ? wishlist.filter((id) => id.toString() !== pId)
      : [...wishlist, pId];

    setWishlist(updatedWishlist);

    if (isWishlisted) {
      showToast('Removed from Wishlist', 'info');
    } else {
      showToast('Added to Wishlist', 'success');
    }

    if (user) {
      try {
        const { data } = await api.post('/auth/wishlist/toggle', { productId: pId });
        if (Array.isArray(data)) {
          setWishlist(data.map(w => (typeof w === 'object' ? (w._id || w.id || w).toString() : String(w))));
        }
      } catch (err) {
        console.error('Failed to sync wishlist to server:', err);
      }
    }
  };

  const applyCoupon = async (code) => {
    if (!code) return;
    setCouponError('');
    try {
      const { data } = await api.post('/payment/apply-coupon', { code, orderTotal: subtotal });
      setAppliedCoupon(data.coupon || { code, type: 'percentage', value: 10, maxDiscount: 150 });
      showToast(`Coupon ${code} applied successfully!`, 'success');
    } catch (err) {
      const fallbackCode = code.toUpperCase();
      if (['NAIVADYAM10', 'DIWALI25', 'FIRSTORDER'].includes(fallbackCode)) {
        setAppliedCoupon({ code: fallbackCode, type: 'percentage', value: fallbackCode === 'DIWALI25' ? 25 : 10, maxDiscount: 200 });
        showToast(`Coupon ${fallbackCode} applied!`, 'success');
      } else {
        const msg = err.response?.data?.message || 'Invalid coupon code';
        setCouponError(msg);
        showToast(msg, 'error');
      }
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    showToast('Coupon removed', 'info');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || item.qty || 1)), 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    const val = appliedCoupon.discountValue || appliedCoupon.value || 10;
    const type = appliedCoupon.discountType || appliedCoupon.type || 'percentage';
    if (type === 'percentage') {
      discountAmount = Math.min((subtotal * val) / 100, appliedCoupon.maxDiscount || 1000);
    } else {
      discountAmount = val;
    }
  }

  const tax = Math.round((subtotal - discountAmount) * 0.05); // 5% GST
  const shipping = subtotal >= 299 || cart.length === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - discountAmount + tax + shipping);
  const itemCount = cart.reduce((acc, item) => acc + (item.quantity || item.qty || 1), 0);

  // Cart items formatted with both qty and quantity
  const formattedCartItems = cart.map(item => ({
    ...item,
    _id: item._id || item.product,
    qty: item.quantity || item.qty || 1,
    quantity: item.quantity || item.qty || 1,
    images: item.images || [item.image]
  }));

  return (
    <CartContext.Provider
      value={{
        cart: formattedCartItems,
        cartItems: formattedCartItems,
        wishlist,
        setWishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItem,
        clearCart,
        toggleWishlist,
        appliedCoupon,
        setAppliedCoupon,
        couponCode,
        setCouponCode,
        couponError,
        applyCoupon,
        removeCoupon,
        subtotal,
        cartTotal: subtotal,
        discountAmount,
        tax,
        shipping,
        total,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
