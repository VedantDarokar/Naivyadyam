import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const ContactUsPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Query', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert('Please complete all required fields (*)');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: 'General Query', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-amber-950 dark:text-amber-100">Contact Us</span>
      </div>

      {/* Header Banner */}
      <div className="card-product p-8 relative overflow-hidden space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7B1A1A]/10 dark:bg-[#E6A817]/10 rounded-2xl text-[#7B1A1A] dark:text-[#E6A817]">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-amber-950 dark:text-amber-50">Contact Customer Support</h1>
            <p className="text-xs text-amber-700 dark:text-amber-400">We're here to assist you with orders, feedback, and inquiries.</p>
          </div>
        </div>
      </div>

      {/* Grid: Direct Info Cards & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Info Cards */}
        <div className="space-y-4">
          <div className="card-product p-6 space-y-4">
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">Direct Contact Information</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-100">Customer Helpline</p>
                  <p className="text-amber-700 dark:text-amber-400">+91 8149471804</p>
                  <p className="text-[10px] text-amber-500">Toll-free across India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-100">Email Support</p>
                  <p className="text-amber-700 dark:text-amber-400">naivyadyamtds@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-100">Working Hours</p>
                  <p className="text-amber-700 dark:text-amber-400">Monday – Saturday</p>
                  <p className="text-amber-700 dark:text-amber-400">9:00 AM – 8:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-100">Corporate Fulfillment Hub</p>
                  <p className="text-amber-700 dark:text-amber-400">Naivadyam Foods Pvt. Ltd.</p>
                  <p className="text-amber-700 dark:text-amber-400">Heritage Food Park, Plot 42, Pune – Mumbai Highway, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card-product p-8 space-y-6">
            <div>
              <h2 className="text-lg font-black text-amber-950 dark:text-amber-50">Send Us a Message</h2>
              <p className="text-xs text-amber-700 dark:text-amber-400">Fill out the form below and our team will get back to you within 4 hours.</p>
            </div>

            {submitted ? (
              <div className="p-6 bg-[#1D7A40]/10 border border-[#1D7A40]/30 rounded-2xl space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#1D7A40] mx-auto" />
                <h3 className="text-base font-bold text-amber-950 dark:text-amber-50">Message Sent Successfully!</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">Thank you for reaching out to Naivadyam. Our team will contact you shortly.</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary text-xs px-4 py-2 rounded-xl font-bold">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Full Name *</label>
                    <input
                      type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Email Address *</label>
                    <input
                      type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Phone Number</label>
                    <input
                      type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="10-digit phone number"
                      className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Subject</label>
                    <select
                      value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                    >
                      <option value="General Query">General Query</option>
                      <option value="Order Status">Order Status</option>
                      <option value="Return / Exchange">Return / Exchange</option>
                      <option value="Bulk / Festive Order">Bulk / Festive Order</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Your Message *</label>
                  <textarea
                    required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#1A0E08] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs"
                >
                  <Send className="w-4 h-4" /> {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
