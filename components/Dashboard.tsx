import React from 'react';
import { Booking, BookingStatus, Client } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Briefcase, Users, PlusCircle } from 'lucide-react';

interface DashboardProps {
  bookings: Booking[];
  clients: Client[];
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, clients }) => {
  
  // KPI Calculations
  const totalActive = bookings.filter(b => [BookingStatus.PENDING, BookingStatus.OPTIONED].includes(b.status)).length;
  const ticketed = bookings.filter(b => b.status === BookingStatus.TICKETED).length;
  const expired = bookings.filter(b => b.status === BookingStatus.EXPIRED || b.status === BookingStatus.CANCELLED).length;
  
  // Urgent Deadlines (Next 48 hours)
  const now = new Date();
  const urgentBookings = bookings.filter(b => {
    const deadline = new Date(b.ticketingDeadline);
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48 && b.status !== BookingStatus.TICKETED && b.status !== BookingStatus.CANCELLED;
  }).sort((a, b) => new Date(a.ticketingDeadline).getTime() - new Date(b.ticketingDeadline).getTime());

  // Chart Data
  const statusData = [
    { name: 'Pending', value: bookings.filter(b => b.status === BookingStatus.PENDING).length, color: '#F59E0B' }, // Yellow
    { name: 'Optioned', value: bookings.filter(b => b.status === BookingStatus.OPTIONED).length, color: '#8B5CF6' }, // Purple
    { name: 'Ticketed', value: bookings.filter(b => b.status === BookingStatus.TICKETED).length, color: '#10B981' }, // Green
    { name: 'Expired/Canc', value: bookings.filter(b => b.status === BookingStatus.EXPIRED || b.status === BookingStatus.CANCELLED).length, color: '#EF4444' }, // Red
  ];

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-MA', { style: 'currency', currency: 'MAD' }).format(val);
  const totalPotentialRevenue = bookings.reduce((sum, b) => (b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.EXPIRED) ? sum + b.price : sum, 0);

  if (bookings.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Travel Agent Pro</h2>
          <p className="text-slate-500 mb-6">
            Your PNR database is currently empty. Start by creating your first local booking to track deadlines and manage communication.
          </p>
          <div className="text-sm text-slate-400 border-t border-slate-100 pt-4">
             Total Clients: {clients.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500">Agency Overview & Deadlines</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Active PNRs</p>
            <p className="text-2xl font-bold text-slate-800">{totalActive}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Urgent Actions</p>
            <p className="text-2xl font-bold text-slate-800">{urgentBookings.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Ticketed</p>
            <p className="text-2xl font-bold text-slate-800">{ticketed}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Pipeline Value</p>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(totalPotentialRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
               <AlertCircle size={18} className="text-red-500"/> Urgent Ticketing Deadlines
            </h2>
          </div>
          <div className="p-4 overflow-x-auto flex-1">
            {urgentBookings.length === 0 ? (
                <div className="text-center text-slate-400 py-8">No urgent deadlines.</div>
            ) : (
                <table className="w-full text-left text-sm">
                <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                    <th className="pb-2">PNR</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Client/Pax</th>
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Deadline</th>
                    <th className="pb-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {urgentBookings.map(booking => {
                        const timeLeft = Math.floor((new Date(booking.ticketingDeadline).getTime() - now.getTime()) / (1000 * 60 * 60));
                        return (
                            <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-3 font-mono text-indigo-600 font-bold">{booking.pnr}</td>
                                <td className="py-3">
                                  {booking.category === 'Client' ? 
                                    <span className="flex items-center gap-1 text-blue-600"><Users size={12}/> Client</span> : 
                                    <span className="flex items-center gap-1 text-purple-600"><Briefcase size={12}/> Colleague</span>
                                  }
                                </td>
                                <td className="py-3">
                                  <div className="font-medium">{booking.clientName}</div>
                                  <div className="text-xs text-slate-400">{booking.passengers.length} Pax</div>
                                </td>
                                <td className="py-3 font-medium">{booking.route}</td>
                                <td className="py-3 text-red-600 font-bold">
                                    {new Date(booking.ticketingDeadline).toLocaleString([], {month: 'short', day: 'numeric', hour:'2-digit', minute:'2-digit'})}
                                    <span className="block text-xs font-normal text-red-400">{timeLeft}h remaining</span>
                                </td>
                                <td className="py-3">
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">{booking.status}</span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                </table>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Booking Status Overview</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;