import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, ChevronRight, Key } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-amber-950 dark:text-amber-100">Privacy Policy</span>
      </div>

      {/* Header Banner */}
      <div className="card-product p-8 relative overflow-hidden space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B1A1A]/10 dark:bg-[#E6A817]/10 rounded-2xl text-[#7B1A1A] dark:text-[#E6A817]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">Privacy Policy</h1>
            <p className="text-xs text-amber-700 dark:text-amber-400">Your Privacy & Data Protection Promises</p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: '256-Bit Encryption', desc: 'All data transmitted over SSL encrypted tunnels.', icon: <Lock className="w-5 h-5 text-amber-500" /> },
          { title: 'Zero Spam Promise', desc: 'We never sell or rent your personal information.', icon: <Eye className="w-5 h-5 text-amber-500" /> },
          { title: 'Full User Control', desc: 'Update or delete your stored data whenever you wish.', icon: <Key className="w-5 h-5 text-amber-500" /> },
        ].map((item, idx) => (
          <div key={idx} className="bg-amber-500/5 border border-amber-500/15 p-5 rounded-2xl space-y-2">
            <div className="p-2 bg-amber-500/10 rounded-xl w-fit">{item.icon}</div>
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">{item.title}</h3>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/80">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="card-product p-8 space-y-8 text-sm text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#7B1A1A] dark:text-[#E6A817]" /> 1. Information We Collect
          </h2>
          <p>
            When you visit or place an order on <strong>Naivadyam (naivadyam.com)</strong>, we collect necessary personal details to process your transactions and deliver authentic products to your door:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-900/90 dark:text-amber-300/90 pl-2">
            <li><strong>Personal Contact Information:</strong> Name, email address, mobile number, and shipping address.</li>
            <li><strong>Authentication Data:</strong> Encrypted password credentials or Google OAuth authentication tokens.</li>
            <li><strong>Order History:</strong> Product items ordered, delivery status, and invoice details.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1D7A40]" /> 2. How We Protect & Use Your Data
          </h2>
          <p>
            Your information is used strictly to fulfill your orders, send SMS/Email dispatch updates, and improve your shopping experience. We employ industry-standard database encryption protocols and firewalls to ensure unauthorized parties cannot access your personal data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-500" /> 3. Data Confidentiality & Third Parties
          </h2>
          <p>
            Naivadyam will <strong>NEVER</strong> sell, lease, or share your private contact information with third-party marketing agencies. Data is shared exclusively with our vetted logistics partners (e.g. courier delivery drivers) strictly for delivery execution.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-black text-amber-950 dark:text-amber-50 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#7B1A1A] dark:text-[#E6A817]" /> 4. Your Rights & Data Deletion
          </h2>
          <p>
            You retain total ownership over your personal data. You may view, update, or request permanent deletion of your customer account at any time by contacting <strong>naivyadyamtds@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
