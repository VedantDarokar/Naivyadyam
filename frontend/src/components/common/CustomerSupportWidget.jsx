import React, { useState, useContext } from 'react';
import { Headphones, MessageSquare, Phone, Mail, Send, X, HelpCircle, Ticket, CheckCircle2, ChevronRight, Clock, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const CustomerSupportWidget = () => {
  const { user, openAuthModal, showToast } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('instant'); // 'instant' | 'ticket' | 'contact'

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({ subject: '', orderId: '', priority: 'Medium', message: '' });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // FAQ Search & Accordion State
  const [selectedFaq, setSelectedFaq] = useState(null);

  const faqs = [
    {
      q: 'How do I track my placed order?',
      a: 'Go to your account profile orders section or use the "Track My Order" page with your Order ID to view real-time delivery status.'
    },
    {
      q: 'What payment options are supported?',
      a: 'We currently accept Cash on Delivery (COD) for 100% risk-free transactions upon delivery.'
    },
    {
      q: 'How long does shipping take?',
      a: 'Orders are dispatched within 24 hours. Transit time is usually 2–4 business days depending on your delivery pincode.'
    },
    {
      q: 'What is the return & replacement policy?',
      a: 'We offer a 7-day replacement policy for items damaged during transit, defective seals, or wrong item dispatches.'
    },
    {
      q: 'Are Naivadyam products 100% pure vegetarian?',
      a: 'Yes, all products are 100% Pure Vegetarian, prepared under strict FSSAI guidelines without artificial preservatives.'
    }
  ];

  // Unread / Active Tickets State
  const [activeTicketsCount, setActiveTicketsCount] = useState(0);

  React.useEffect(() => {
    if (!user) return;
    const fetchUserTickets = async () => {
      try {
        const { data } = await api.get('/tickets/my');
        const list = Array.isArray(data) ? data : [];
        const count = list.filter(t => t.status === 'Open' || t.status === 'In Progress' || t.response).length;
        setActiveTicketsCount(count);
      } catch (err) {
        // silent
      }
    };
    fetchUserTickets();
    const timer = setInterval(fetchUserTickets, 15000);
    return () => clearInterval(timer);
  }, [user]);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setIsOpen(false);
      openAuthModal();
      return;
    }
    if (!ticketForm.subject || !ticketForm.message) {
      showToast('Please enter both subject and message', 'error');
      return;
    }

    setTicketSubmitting(true);
    try {
      await api.post('/tickets', ticketForm);
      setTicketSuccess(true);
      setTicketForm({ subject: '', orderId: '', priority: 'Medium', message: '' });
      showToast('Support ticket created successfully!', 'success');
      setActiveTicketsCount(prev => prev + 1);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting ticket', 'error');
    } finally {
      setTicketSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#7B1A1A] to-[#3D1206] text-[#F5C518] border-2 border-[#E6A817]/40 shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
        >
          <div className="relative">
            <Headphones className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {activeTicketsCount > 0 ? (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-black bg-rose-600 text-white rounded-full ring-2 ring-[#7B1A1A] animate-bounce">
                {activeTicketsCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#7B1A1A] animate-pulse"></span>
            )}
          </div>
          <span className="text-xs font-black tracking-wide pr-1 hidden sm:inline">Customer Support</span>
        </button>
      </div>

      {/* Floating Support Hub Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:pr-8 p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full sm:w-[420px] max-h-[85vh] h-[600px] bg-white dark:bg-[#150A04] border border-amber-200 dark:border-[#3D2010] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#7B1A1A] to-[#3D1206] text-white flex items-center justify-between border-b border-[#E6A817]/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E6A817]/20 rounded-xl text-[#F5C518]">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-100 flex items-center gap-1.5">
                    Naivadyam Support Desk <Sparkles className="w-3.5 h-3.5 text-[#E6A817]" />
                  </h3>
                  <p className="text-[10px] text-amber-300/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Live Help & Support Desk
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-amber-100 dark:border-[#2A1A0C] bg-amber-50/50 dark:bg-[#1D0C05] text-xs font-bold">
              {[
                { id: 'instant', label: 'Instant FAQ', icon: <HelpCircle className="w-3.5 h-3.5" /> },
                { id: 'ticket', label: 'Create Ticket', icon: <Ticket className="w-3.5 h-3.5" /> },
                { id: 'contact', label: 'Contact Details', icon: <Phone className="w-3.5 h-3.5" /> },
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setTicketSuccess(false); }}
                  className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    activeTab === id
                      ? 'border-[#E6A817] text-[#7B1A1A] dark:text-[#E6A817] bg-white dark:bg-[#150A04]'
                      : 'border-transparent text-amber-700/70 dark:text-amber-400/60 hover:text-amber-900 dark:hover:text-amber-200'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              
              {/* TAB 1: Instant FAQs */}
              {activeTab === 'instant' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-[#1F0D05] rounded-xl border border-amber-200 dark:border-[#3D2010] text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                    👋 Welcome to Naivadyam Customer Care! Click any topic below for immediate automated answers.
                  </div>

                  <div className="space-y-2">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="border border-amber-200/70 dark:border-[#2A1A0C] rounded-xl overflow-hidden bg-white dark:bg-[#1A0C05]"
                      >
                        <button
                          onClick={() => setSelectedFaq(selectedFaq === idx ? null : idx)}
                          className="w-full p-3 text-left font-bold text-amber-950 dark:text-amber-100 flex items-center justify-between gap-2 hover:bg-amber-50/50 dark:hover:bg-[#231006] transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {faq.q}
                          </span>
                          <ChevronRight className={`w-4 h-4 text-amber-500 transition-transform ${selectedFaq === idx ? 'rotate-90' : ''}`} />
                        </button>
                        {selectedFaq === idx && (
                          <div className="px-3 pb-3 pt-1 text-[11px] text-amber-700/90 dark:text-amber-300/90 leading-relaxed border-t border-amber-100 dark:border-[#231006]">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('ticket')}
                      className="w-full py-2.5 rounded-xl border border-[#E6A817]/40 bg-[#E6A817]/10 text-[#7B1A1A] dark:text-[#E6A817] font-bold text-center flex items-center justify-center gap-2 hover:bg-[#E6A817]/20 transition-colors"
                    >
                      <Ticket className="w-4 h-4" /> Still Need Help? Submit a Ticket →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Raise Ticket */}
              {activeTab === 'ticket' && (
                <div>
                  {ticketSuccess ? (
                    <div className="p-6 bg-[#1D7A40]/10 border border-[#1D7A40]/30 rounded-2xl text-center space-y-3 my-8">
                      <CheckCircle2 className="w-10 h-10 text-[#1D7A40] mx-auto" />
                      <h4 className="font-bold text-amber-950 dark:text-amber-50 text-sm">Ticket Submitted!</h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">Our customer support desk will review your query and respond within 4 business hours.</p>
                      <button
                        onClick={() => setTicketSuccess(false)}
                        className="btn-primary px-4 py-2 text-xs rounded-xl font-bold"
                      >
                        Submit Another Ticket
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-3">
                      <div>
                        <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Issue Subject *</label>
                        <input
                          type="text"
                          required
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                          placeholder="e.g. Order delivery status or damage inquiry"
                          className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#1A0C05] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Order ID (Optional)</label>
                          <input
                            type="text"
                            value={ticketForm.orderId}
                            onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                            placeholder="e.g. ORD_123"
                            className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#1A0C05] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Priority</label>
                          <select
                            value={ticketForm.priority}
                            onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#1A0C05] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-amber-900 dark:text-amber-200 block mb-1">Detailed Message *</label>
                        <textarea
                          required
                          rows={4}
                          value={ticketForm.message}
                          onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                          placeholder="Describe your issue or query in detail..."
                          className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#1A0C05] border-amber-200 dark:border-[#3D2010] text-amber-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-[#E6A817]/30"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={ticketSubmitting}
                        className="btn-primary w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" /> {ticketSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                      </button>

                      {!user && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center italic">
                          Note: You will be prompted to sign in before submitting.
                        </p>
                      )}
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: Contact Channels */}
              {activeTab === 'contact' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-amber-50 dark:bg-[#1F0D05] rounded-xl border border-amber-200 dark:border-[#3D2010] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#1D7A40]/10 text-[#1D7A40] rounded-lg shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-950 dark:text-amber-100">Customer Helpline</p>
                        <p className="text-amber-700 dark:text-amber-400">+91 8149471804</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-950 dark:text-amber-100">Email Support Desk</p>
                        <p className="text-amber-700 dark:text-amber-400">naivyadyamtds@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#7B1A1A]/10 text-[#7B1A1A] dark:text-[#E6A817] rounded-lg shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-950 dark:text-amber-100">Help Desk Hours</p>
                        <p className="text-amber-700 dark:text-amber-400">Mon – Sat: 9:00 AM – 8:00 PM IST</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-[#7B1A1A]/10 to-[#E6A817]/10 rounded-xl border border-[#E6A817]/30 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                    <p className="font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#1D7A40]" /> Guaranteed Response SLA</p>
                    <p className="text-amber-700/80 dark:text-amber-400/80">All tickets and email inquiries are guaranteed to be acknowledged within 4 business hours.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-amber-50 dark:bg-[#1A0C05] border-t border-amber-100 dark:border-[#2A1A0C] text-center text-[10px] text-amber-600/70 dark:text-amber-400/60">
              Naivadyam — The Divine Serve · Customer Care Center
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerSupportWidget;
