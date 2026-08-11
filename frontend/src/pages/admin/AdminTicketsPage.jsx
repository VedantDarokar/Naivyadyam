import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LifeBuoy, MessageSquare, CheckCircle, Clock, X } from 'lucide-react';
import api from '../../services/api';

const AdminTicketsPage = () => {
  const { showToast } = useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('Resolved');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/tickets');
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    try {
      const { data: updated } = await api.put(`/admin/tickets/${selectedTicket._id}`, {
        response: responseText,
        status: status
      });
      setTickets((prev) => prev.map((t) => (t._id === selectedTicket._id ? updated : t)));
      showToast('Support ticket updated & response sent', 'success');
      setSelectedTicket(null);
    } catch (err) {
      showToast('Error responding to ticket', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Customer Support & Help Desk</h1>
        <p className="text-xs text-slate-400">Review customer complaints, order inquiries, and resolution logs</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading support desk tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No support tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Subject & Message</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{t.userName}</p>
                      <p className="text-[10px] text-slate-400">{t.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-bold text-amber-400">{t.subject}</p>
                      <p className="text-[11px] text-slate-400 truncate">{t.message}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-300">{t.priority}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setResponseText(t.response || '');
                          setStatus(t.status || 'Resolved');
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl"
                      >
                        Reply / Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 text-xs text-slate-300 relative">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white">Reply to Ticket #{selectedTicket._id.slice(-6)}</h3>
            <div className="p-3 bg-slate-800 rounded-xl space-y-1">
              <p className="font-bold text-amber-400">{selectedTicket.subject}</p>
              <p className="text-slate-300">{selectedTicket.message}</p>
            </div>
            <form onSubmit={handleReplyTicket} className="space-y-3">
              <div>
                <label className="block mb-1 font-semibold text-slate-400">Update Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-slate-400">Admin Response Message</label>
                <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} rows="4" required className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedTicket(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">Send Response</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketsPage;
