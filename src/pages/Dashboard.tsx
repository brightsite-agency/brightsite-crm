import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserCheck, MessageSquare, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = '/api';
const TOKEN = 'ceo-access-token';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${TOKEN}` };
        const [statsRes, inquiriesRes] = await Promise.all([
          axios.get(`${API_URL}/stats`, { headers }),
          axios.get(`${API_URL}/inquiries`, { headers })
        ]);
        setStats(statsRes.data);
        setRecentInquiries(inquiriesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20">Loading Dashboard...</div>;

  const statCards = [
    { label: 'Total Clients', value: stats?.totalClients || 0, icon: <Users className="text-blue-500" />, trend: '+12% this month' },
    { label: 'Active Clients', value: stats?.activeClients || 0, icon: <UserCheck className="text-green-500" />, trend: 'Healthy' },
    { label: 'Pending Inquiries', value: stats?.pendingInquiries || 0, icon: <MessageSquare className="text-orange-500" />, trend: 'Action required' },
    { label: 'Monthly Revenue', value: `$${stats?.monthlyRevenue || 0}`, icon: <TrendingUp className="text-purple-500" />, trend: 'Growing' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Welcome back, CEO</h2>
          <p className="text-gray-400 mt-1">Here's what's happening with Brightsite today.</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <Clock size={16} className="mr-2" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-lg">{stat.icon}</div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            <div className="text-xs font-medium text-blue-400 mt-4">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Inquiries</h3>
            <button className="text-sm text-brightsite-blue hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {recentInquiries.length > 0 ? recentInquiries.map((inquiry: any) => (
              <div key={inquiry.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                    {inquiry.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{inquiry.name}</div>
                    <div className="text-xs text-gray-400">{inquiry.industry || 'Unknown Industry'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                    inquiry.status === 'new' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {inquiry.status}
                  </span>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                No recent inquiries found
              </div>
            )}
          </div>
        </div>

        {/* Quick Links / Actions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'View All Clients', link: '/clients', color: 'bg-blue-500' },
              { label: 'Pending Approvals', link: '/', color: 'bg-orange-500' },
              { label: 'Revenue Reports', link: '/', color: 'bg-purple-500' },
              { label: 'Legal Documents', link: '/', color: 'bg-red-500' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.link}
                className="flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className={`w-2 h-8 rounded-full ${action.color} mb-3`} />
                <span className="font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-brightsite-blue rounded-2xl">
            <h4 className="font-bold text-lg mb-2">Growth Tip</h4>
            <p className="text-sm text-blue-100 mb-4">
              There are 3 upcoming renewals next week. Sending a proactive message can increase retention by 20%.
            </p>
            <button className="bg-white text-brightsite-blue px-4 py-2 rounded-lg font-bold text-sm">
              View Renewals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
