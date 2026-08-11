import React, { useState } from 'react';
import { X, User, ArrowLeft, Check, ChevronDown } from 'lucide-react';

const GoogleAccountPickerModal = ({ isOpen, onClose, onSelectAccount }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Vedant Darokar',
      email: 'vedantdarokar7@gmail.com',
      initial: 'V',
      bg: 'bg-[#c2185b]' // Google pink/magenta avatar background
    }
  ];

  const handleAccountClick = (account) => {
    onSelectAccount(account.email, account.name);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    const email = customEmail.trim().toLowerCase();
    const name = customName.trim() || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    onSelectAccount(email, name);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#1d1d1f]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8 animate-fade-in overflow-y-auto font-sans text-[#e3e3e3]">
      
      {/* Spacer Top */}
      <div className="w-full h-2"></div>

      {/* Main Google OAuth Card */}
      <div className="bg-[#131314] border border-[#2e2e30] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden my-auto relative">
        
        {/* Top Header Bar */}
        <div className="bg-[#18181b] border-b border-[#2e2e30] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Google Multicolor G Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-sm font-medium text-[#e3e3e3]">Sign in with Google</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#28292a] text-neutral-400 hover:text-white transition-colors cursor-pointer z-30"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 p-8 md:p-10 gap-8 md:gap-12 items-start">
          
          {/* Left Column: App Info */}
          <div className="space-y-4">
            {/* App Logo */}
            <div className="w-12 h-12 rounded-xl bg-black border border-neutral-800 p-2 flex items-center justify-center shadow-md">
              <img src="/naivadyam-logo.png" alt="Naivadyam" className="w-full h-full object-contain" />
            </div>

            <h1 className="text-3xl md:text-4xl font-normal text-white tracking-tight leading-tight">
              Choose an account
            </h1>

            <p className="text-sm text-neutral-400 font-normal">
              to continue to <span className="text-white font-medium">Naivadyam</span>
            </p>
          </div>

          {/* Right Column: Account Selector */}
          <div className="space-y-4 pt-1">
            {!customMode ? (
              <>
                {/* Account Item 1 */}
                {defaultAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleAccountClick(acc)}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#28292a] transition-all flex items-center gap-3.5 group cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-full ${acc.bg} text-white font-medium flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>
                      {acc.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-[#8ab4f8] transition-colors truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {acc.email}
                      </p>
                    </div>
                  </button>
                ))}

                <hr className="border-[#2e2e30] my-2" />

                {/* Use another account */}
                <button
                  onClick={() => setCustomMode(true)}
                  className="w-full text-left p-3 rounded-xl hover:bg-[#28292a] transition-all flex items-center gap-3.5 text-neutral-300 hover:text-white group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1e1f20] border border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:border-neutral-500 transition-all flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-[#8ab4f8] transition-colors">
                    Use another account
                  </span>
                </button>

                <hr className="border-[#2e2e30] my-4" />

                {/* Terms & Privacy Disclaimer */}
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                  Before using this app, you can review Naivadyam's{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-[#8ab4f8] hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-[#8ab4f8] hover:underline">
                    Terms of Service
                  </a>.
                </p>
              </>
            ) : (
              /* Custom Gmail Input Form */
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8ab4f8] hover:underline mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to accounts
                </button>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Google Email Address *
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-[#3c4043] bg-[#1e1f20] text-white text-sm focus:border-[#8ab4f8] focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-xl border border-[#3c4043] bg-[#1e1f20] text-white text-sm focus:border-[#8ab4f8] focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!customEmail}
                  className="w-full py-3 bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#040b14] font-medium text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Check className="w-4 h-4" /> Next
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

      {/* Footer Below Card */}
      <div className="w-full max-w-3xl flex items-center justify-between text-xs text-neutral-400 py-4 px-2">
        <button className="flex items-center gap-1 hover:text-white transition-colors">
          <span>English (United States)</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-6">
          <button className="hover:text-white transition-colors">Help</button>
          <button className="hover:text-white transition-colors">Privacy</button>
          <button className="hover:text-white transition-colors">Terms</button>
        </div>
      </div>

    </div>
  );
};

export default GoogleAccountPickerModal;
