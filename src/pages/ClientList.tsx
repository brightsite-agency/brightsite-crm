import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = '/api';
const TOKEN = 'ceo-access-token';

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('All');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        setClients(res.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'All' || client.package_tier === filterTier;
    return matchesSearch && matchesTier;
  });

  if (loading) return <div className="text-center py-20">Loading Clients...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Clients</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or company..."
              className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brightsite-blue w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-brightsite-blue"
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
          >
            <option value="All">All Tiers</option>
            <option value="Seed">Seed</option>
            <option value="Growth">Growth</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Company / Contact</th>
              <th className="px-6 py-4 font-medium">Tier / Plan</th>
              <th className="px-6 py-4 font-medium">Start Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Concierge</th>
              <th className="px-6 py-4 font-medium">Payment</th>
              <th className="px-6 py-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredClients.length > 0 ? filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{client.company_name}</div>
                  <div className="text-sm text-gray-400">{client.contact_name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{client.package_tier}</div>
                  <div className="text-xs text-gray-500">{client.care_plan_level}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {client.start_date ? new Date(client.start_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                    client.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {client.assigned_concierge || 'Unassigned'}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs ${
                    client.payment_status === 'current' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {client.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/clients/${client.id}`}
                    className="p-2 text-gray-400 hover:text-white transition-colors inline-block"
                  >
                    <ExternalLink size={18} />
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No clients found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
