import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Smartphone, Building2, CheckCircle2, Lock, X } from 'lucide-react';

const RazorpayModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('user@gpay');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !orderData) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        razorpay_order_id: orderData.id || 'order_rzp_simulated',
        razorpay_payment_id: 'pay_' + Math.random().toString(36).substring(2, 12),
        razorpay_signature: 'simulated_sig_' + Math.random().toString(36).substring(2, 16),
        orderId: orderData.orderId
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Razorpay Secure Checkout</h3>
              <p className="text-xs text-amber-100">256-Bit SSL Encrypted Sandbox Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Payable Amount</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                ₹{(orderData.amount / 100).toLocaleString()}
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-semibold rounded-full">
              Order #{orderData.orderId?.toString().slice(-6)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'upi'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1 text-amber-500" />
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'card'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-amber-500" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'netbanking'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-5 h-5 mb-1 text-amber-500" />
                NetBanking
              </button>
            </div>
          </div>

          {/* Form Fields */}
          {method === 'upi' && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Enter VPA / UPI ID (GPay, PhonePe, Paytm)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@upi"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500">Popular apps: GPay, PhonePe, Paytm, BHIM</p>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    maxLength="4"
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="space-y-2 animate-fade-in text-sm text-slate-600 dark:text-slate-300">
              <p className="text-xs text-slate-500">Select Bank</p>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India (SBI)</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                Verifying Payment...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay ₹{(orderData.amount / 100).toLocaleString()} Securely
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
