import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { X, Lock, Mail, User, Phone, ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import GoogleAccountPickerModal from './GoogleAccountPickerModal';
import { initiateRealGoogleSignIn } from '../../utils/googleOAuth';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, googleLogin, register, sendRegistrationOtp, forgotPassword, resetPassword } = useContext(AuthContext);

  // Tabs & Views
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [regStep, setRegStep] = useState(1); // 1: Registration Form, 2: Registration Email OTP

  // Forgot Password Flow
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isResetStep, setIsResetStep] = useState(false); // false: Enter Email, true: Enter OTP & New Pass

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Account Chooser State
  const [showGooglePicker, setShowGooglePicker] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNewPassword('');
    setName('');
    setPhone('');
    setEmailOtp('');
    setResetOtp('');
    setRegStep(1);
    setIsLoginTab(true);
    setIsForgotMode(false);
    setIsResetStep(false);
    setShowGooglePicker(false);
  };

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      const googleUser = await initiateRealGoogleSignIn();
      setLoading(false);
      if (googleUser && googleUser.email) {
        const res = await googleLogin(googleUser.email, googleUser.name, googleUser.picture);
        if (res.success) {
          onClose();
          resetForm();
        }
      }
    } catch (err) {
      setLoading(false);
      console.warn('Real Google OAuth window fallback:', err.message);
      setShowGooglePicker(true);
    }
  };

  const handleGoogleSelectAccount = async (selectedEmail, selectedName) => {
    setShowGooglePicker(false);
    setLoading(true);
    const res = await googleLogin(selectedEmail, selectedName);
    setLoading(false);
    if (res.success) {
      onClose();
      resetForm();
    }
  };

  // Sign In Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      onClose();
      resetForm();
    }
  };

  // Registration OTP Request
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) return;
    setLoading(true);
    const res = await sendRegistrationOtp(name, email, phone);
    setLoading(false);
    if (res.success) {
      setRegStep(2);
    }
  };

  // Registration Final Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!emailOtp) return;
    setLoading(true);
    const res = await register(name, email, password, phone, emailOtp);
    setLoading(false);
    if (res.success) {
      onClose();
      resetForm();
    }
  };

  // Forgot Password Request OTP
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      setIsResetStep(true);
    }
  };

  // Reset Password Final Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !resetOtp || !newPassword) return;
    setLoading(true);
    const res = await resetPassword(email, resetOtp, newPassword);
    setLoading(false);
    if (res.success) {
      setIsForgotMode(false);
      setIsResetStep(false);
      setPassword(newPassword);
      setNewPassword('');
      setResetOtp('');
      setIsLoginTab(true);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          resetForm();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#5A0E0E] via-[#7B1A1A] to-[#3D1206] p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(45deg, #E6A817 0px, #E6A817 1px, transparent 1px, transparent 8px)'}}></div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              resetForm();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer z-30 shadow-md active:scale-95"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center mb-3 relative z-10">
            <img
              src="/naivadyam-logo.png"
              alt="Naivadyam"
              className="h-16 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          <h2 className="text-xl font-bold">
            {isForgotMode
              ? isResetStep ? 'Set New Password' : 'Reset Account Password'
              : isLoginTab ? 'Welcome Back!' : regStep === 1 ? 'Create an Account' : 'Verify Your Email'}
          </h2>
          <p className="text-xs text-amber-200/90 font-medium">
            {isForgotMode
              ? isResetStep ? `Enter 6-digit code sent to ${email}` : 'Enter your registered email address to receive reset code'
              : isLoginTab
              ? 'Access order history, saved addresses & rewards'
              : regStep === 1
              ? 'Join Naivadyam for exclusive deals & instant checkout'
              : `A verification code has been sent to ${email}`}
          </p>
        </div>

        {/* Tab Buttons (Hide when in Forgot Password mode) */}
        {!isForgotMode && (
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { setIsLoginTab(true); setRegStep(1); }}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${
                isLoginTab
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setIsForgotMode(false); }}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${
                !isLoginTab
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Body */}
        {isForgotMode ? (
          !isResetStep ? (
            /* FORGOT PASSWORD STEP 1: ENTER EMAIL */
            <form onSubmit={handleForgotPasswordSubmit} className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => setIsForgotMode(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    autoFocus
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Reset Verification Code →'
                )}
              </button>
            </form>
          ) : (
            /* FORGOT PASSWORD STEP 2: ENTER OTP & NEW PASSWORD */
            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => setIsResetStep(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change email
              </button>

              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
                📧 A 6-digit password reset code has been sent to <strong>{email}</strong>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit code"
                    autoFocus
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || resetOtp.length !== 6 || newPassword.length < 6}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Reset Password & Sign In
                  </>
                )}
              </button>
            </form>
          )
        ) : isLoginTab ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => { setIsForgotMode(true); setIsResetStep(false); }}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In to Account'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full absolute"></div>
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 relative uppercase tracking-wider">or</span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5 text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

        ) : regStep === 1 ? (
          /* REGISTER STEP 1: USER DETAILS */
          <form onSubmit={handleSendOtp} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vedant Patel"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vedant@example.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Verification Code →'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full absolute"></div>
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 relative uppercase tracking-wider">or</span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5 text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

        ) : (
          /* REGISTER STEP 2: ENTER EMAIL OTP */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
            <button
              type="button"
              onClick={() => setRegStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to details
            </button>

            {/* Info banner */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-300">
              📧 A 6-digit verification code has been sent to <strong>{email}</strong>. Please check your inbox (and spam folder).
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit code"
                  autoFocus
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || emailOtp.length !== 6}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Verify & Complete Registration
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Google Account Selector Dialog */}
      <GoogleAccountPickerModal
        isOpen={showGooglePicker}
        onClose={() => setShowGooglePicker(false)}
        onSelectAccount={handleGoogleSelectAccount}
      />
    </div>
  );
};

export default AuthModal;
