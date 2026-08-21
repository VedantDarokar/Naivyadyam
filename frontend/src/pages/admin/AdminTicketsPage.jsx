import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LifeBuoy, MessageSquare, CheckCircle, Clock, X, Search, Trash2, Filter, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

const AdminTicketsPage = () => {
  const { showToast } = useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal State
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
      showToast('Support ticket updated & email notification sent to customer', 'success');
      setSelectedTicket(null);
    } catch (err) {
      showToast('Error responding to ticket', 'error');
    }
  };

  const handleDeleteTicket = async (ticketId, isClosed) => {
    const confirmMsg = isClosed
      ? 'Remove this closed ticket from Admin view? It will remain stored in the customer’s profile history.'
      : 'Are you sure you want to remove this ticket from Admin view? It will remain stored in the customer’s profile history.';
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/admin/tickets/${ticketId}`);
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      showToast('Ticket removed from Admin desk (retained in customer profile)', 'info');
      if (selectedTicket?._id === ticketId) setSelectedTicket(null);
    } catch (err) {
      showToast('Error deleting ticket from admin view', 'error');
    }
  };

  // Filter Logic
  const filteredTickets = tickets.filter((t) => {
    const ticketIdStr = t._id ? t._id.toString() : '';
    const matchesSearch =
      t.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticketIdStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'All' || t.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Summary Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Customer Support & Help Desk</h1>
        <p className="text-xs text-slate-400">Review customer complaints, send official replies, and manage resolution logs</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <p className="text-slate-400 font-bold uppercase text-[10px]">Total Tickets</p>
          <p className="text-2xl font-black text-white">{totalCount}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-1">
          <p className="text-amber-400 font-bold uppercase text-[10px]">Open Tickets</p>
          <p className="text-2xl font-black text-amber-400">{openCount}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl space-y-1">
          <p className="text-blue-400 font-bold uppercase text-[10px]">In Progress</p>
          <p className="text-2xl font-black text-blue-400">{inProgressCount}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-1">
          <p className="text-emerald-400 font-bold uppercase text-[10px]">Resolved / Closed</p>
          <p className="text-2xl font-black text-emerald-400">{resolvedCount}</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, email, ticket ID, subject..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading support desk tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No support tickets match the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Ticket ID & Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Subject & Message</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTickets.map((t) => {
                  const ticketIdStr = t._id ? t._id.toString().slice(-6).toUpperCase() : 'TK';
                  const isClosed = t.status === 'Closed' || t.status === 'Resolved';
                  return (
                    <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono">
                        <span className="font-bold text-amber-400">#{ticketIdStr}</span>
                        <p className="text-[10px] text-slate-500">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{t.userName}</p>
                        <p className="text-[10px] text-slate-400">{t.userEmail}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs space-y-0.5">
                        <p className="font-bold text-amber-300">{t.subject}</p>
                        <p className="text-[11px] text-slate-400 truncate">{t.message}</p>
                        {t.response && (
                          <p className="text-[10px] text-emerald-400 italic">Replied: "{t.response.slice(0, 35)}..."</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                          t.priority === 'Urgent' || t.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {t.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : t.status === 'Closed'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : t.status === 'In Progress'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setResponseText(t.response || '');
                              setStatus(t.status || 'Resolved');
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors"
                          >
                            Reply / Resolve
                          </button>
                          
                          {/* Admin Delete Button: Removes from Admin Desk only, stays in Customer Profile */}
                          <button
                            onClick={() => handleDeleteTicket(t._id, isClosed)}
                            title="Delete from Admin Desk (Keeps in Customer Profile)"
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-lg space-y-4 text-xs text-slate-300 relative shadow-2xl my-auto max-h-[88vh] overflow-y-auto">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Reply to Ticket #{selectedTicket._id?.slice(-6).toUpperCase()}</h3>
              <span className="text-[10px] text-amber-400 font-mono">User: {selectedTicket.userName}</span>
            </div>

            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
              <p className="font-bold text-amber-300">{selectedTicket.subject}</p>
              <p className="text-slate-300 whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>

            <form onSubmit={handleReplyTicket} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold text-slate-400">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed (Ready for deletion)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-400">Admin Response Message (Customer will receive email notification)</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  required
                  placeholder="Type your official response..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteTicket(selectedTicket._id, selectedTicket.status === 'Closed')}
                  className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove from Admin Desk
                </button>
                
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedTicket(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">Send Response</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketsPage;
