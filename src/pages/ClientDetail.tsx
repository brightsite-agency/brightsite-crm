import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Shield, CreditCard, FileText } from 'lucide-react';

const API_URL = '/api';
const TOKEN = 'ceo-access-token';

const ClientDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`${API_URL}/clients/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        setClient(res.data);
      } catch (error) {
        console.error('Error fetching client details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading Client Profile...</div>;
  if (!client) return <div className="text-center py-20">Client not found</div>;

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate('/clients')}
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Clients
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Card */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-24 h-24 rounded-2xl bg-brightsite-blue mx-auto flex items-center justify-center text-4xl font-bold mb-4 shadow-lg shadow-blue-500/20">
              {client.company_name?.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold">{client.company_name}</h2>
            <p className="text-gray-400 mt-1">{client.contact_name}</p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20 font-medium uppercase tracking-wider">
                {client.package_tier}
              </span>
              <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20 font-medium uppercase tracking-wider">
                {client.status}
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">Contact Info</h3>
            <div className="flex items-center space-x-3 text-sm">
              <Mail size={18} className="text-gray-400" />
              <a href={`mailto:${client.email}`} className="hover:text-brightsite-blue transition-colors">{client.email}</a>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Phone size={18} className="text-gray-400" />
              <span>{client.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Calendar size={18} className="text-gray-400" />
              <span>Started: {new Date(client.start_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">Service Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Care Plan</span>
                <span className="text-sm font-medium">{client.care_plan_level}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Renewal Date</span>
                <span className="text-sm font-medium">{client.renewal_date ? new Date(client.renewal_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Concierge</span>
                <span className="text-sm font-medium">{client.assigned_concierge || 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs/Details */}
        <div className="lg:flex-1 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <CreditCard size={18} className="text-blue-500" />
                <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Payment Status</span>
              </div>
              <div className={`text-xl font-bold ${client.payment_status === 'current' ? 'text-green-400' : 'text-red-400'}`}>
                {client.payment_status?.toUpperCase()}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Shield size={18} className="text-purple-500" />
                <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">GDPR Consent</span>
              </div>
              <div className="text-xl font-bold">
                {client.gdpr_consent ? 'YES' : 'NO'}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <FileText size={18} className="text-orange-500" />
                <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Last Report</span>
              </div>
              <div className="text-xl font-bold">
                Apr 2025
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Internal Notes</h3>
            <div className="p-6 bg-[#0a0a0a] rounded-xl border border-white/5 text-gray-300 whitespace-pre-wrap leading-relaxed">
              {client.account_manager_notes || 'No internal notes found for this client.'}
            </div>
            
            {client.special_instructions && (
              <div className="mt-8">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Special Instructions</h4>
                <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-200 text-sm italic">
                  {client.special_instructions}
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline Placeholder */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { date: 'Oct 15, 2025', action: 'Monthly Status Report Generated', actor: 'System' },
                { date: 'Oct 12, 2025', action: 'Care Plan renewed for next cycle', actor: 'BillingAgent' },
                { date: 'Sep 28, 2025', action: 'Updated contact information', actor: 'CustomerConcierge' },
              ].map((activity, i) => (
                <div key={i} className="flex space-x-4 relative group">
                  <div className="w-3 h-3 rounded-full bg-brightsite-blue mt-1.5 shrink-0 group-last:after:hidden after:content-[''] after:absolute after:w-0.5 after:h-12 after:bg-white/5 after:left-[5px] after:top-4" />
                  <div>
                    <div className="text-sm font-bold">{activity.action}</div>
                    <div className="text-xs text-gray-400 mt-1">{activity.date} • {activity.actor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
