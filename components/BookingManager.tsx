import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, Passenger, BookingCategory, Client } from '../types';
import { Plus, Search, Filter, Plane, Calendar, User, Users, Briefcase, Trash2, ArrowRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BookingManagerProps {
  bookings: Booking[];
  clients: Client[]; // Used for autocomplete suggestions only
  onAddBooking: (booking: Booking) => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onDeleteBooking: (id: string) => void;
  onOpenMessage: (booking: Booking) => void;
}

const BookingManager: React.FC<BookingManagerProps> = ({ 
  bookings, clients, onAddBooking, onUpdateStatus, onDeleteBooking, onOpenMessage 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Client' | 'Colleague'>('All');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // --- Form State ---
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    currency: 'MAD',
    status: BookingStatus.PENDING,
    category: 'Client',
    tripType: 'Round-trip',
    passengers: [{ name: '', phone: '', email: '' }] // Start with 1 pax
  });

  // Handle Passenger Count Change
  const handlePassengerCountChange = (count: number) => {
    const currentPax = newBooking.passengers || [];
    if (count > currentPax.length) {
      // Add empty pax
      const toAdd = count - currentPax.length;
      const newPax = [...currentPax, ...Array(toAdd).fill({ name: '', phone: '', email: '' })];
      setNewBooking({ ...newBooking, passengers: newPax });
    } else if (count < currentPax.length && count > 0) {
      // Remove pax
      setNewBooking({ ...newBooking, passengers: currentPax.slice(0, count) });
    }
  };

  const handlePaxChange = (index: number, field: keyof Passenger, value: string) => {
    const updatedPax = [...(newBooking.passengers || [])];
    updatedPax[index] = { ...updatedPax[index], [field]: value };
    setNewBooking({ ...newBooking, passengers: updatedPax });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.pnr || !newBooking.clientName) return;
    
    const booking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      category: newBooking.category || 'Client',
      clientName: newBooking.clientName,
      clientDivers: newBooking.clientDivers,
      
      passengers: newBooking.passengers || [],
      
      route: newBooking.route?.toUpperCase() || '',
      tripType: newBooking.tripType || 'Round-trip',
      airline: newBooking.airline || '',
      departureDate: newBooking.departureDate || new Date().toISOString(),
      returnDate: newBooking.returnDate,
      
      price: newBooking.price || 0,
      currency: newBooking.currency || 'MAD',
      pnr: newBooking.pnr.toUpperCase(),
      ticketingDeadline: newBooking.ticketingDeadline || new Date().toISOString(),
      status: newBooking.status || BookingStatus.PENDING,
      conditions: newBooking.conditions || ''
    };

    onAddBooking(booking);
    setIsFormOpen(false);
    
    // Reset form
    setNewBooking({ 
      currency: 'MAD', 
      status: BookingStatus.PENDING,
      category: 'Client',
      tripType: 'Round-trip',
      passengers: [{ name: '', phone: '', email: '' }] 
    });
  };

  // --- Filtering ---
  const filteredBookings = bookings.filter(b => {
    const matchesCategory = activeTab === 'All' || b.category === activeTab;
    const matchesStatus = filter === 'All' || b.status === filter;
    const matchesSearch = b.pnr.toLowerCase().includes(search.toLowerCase()) || 
                          b.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          b.route.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.TICKETED: return 'bg-green-100 text-green-800 border-green-200';
      case BookingStatus.OPTIONED: return 'bg-purple-100 text-purple-800 border-purple-200';
      case BookingStatus.CANCELLED: return 'bg-red-100 text-red-800 border-red-200';
      case BookingStatus.EXPIRED: return 'bg-gray-100 text-gray-800 border-gray-200';
      case BookingStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- EXPORT FUNCTION ---
  const handleExportToExcel = () => {
    if (filteredBookings.length === 0) {
      alert("No bookings to export.");
      return;
    }

    // 1. Create Data Array
    const headers = [
      "PNR", "STATUS", "CATEGORY", "CLIENT NAME", "NOTES", "PASSENGERS", "ROUTE", "AIRLINE", 
      "DEPARTURE", "RETURN", "PRICE", "CURRENCY", "DEADLINE"
    ];

    const dataRows = filteredBookings.map(b => [
        b.pnr,
        b.status,
        b.category,
        b.clientName,
        b.clientDivers || '',
        b.passengers.map(p => p.name).join(', '),
        b.route,
        b.airline,
        new Date(b.departureDate).toLocaleDateString(),
        b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '-',
        b.price,
        b.currency,
        new Date(b.ticketingDeadline).toLocaleString()
    ]);

    // 2. Create Workbook and Worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    // 3. Add Content
    
    // -- Title Row --
    XLSX.utils.sheet_add_aoa(ws, [["FLIGHT BOOKING REPORT"]], { origin: "A1" });
    
    // -- Metadata Row --
    XLSX.utils.sheet_add_aoa(ws, [[`Generated on: ${new Date().toLocaleString()}`]], { origin: "A2" });

    // -- Header Row --
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A4" });

    // -- Data Rows --
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A5" });

    // 4. Styling (Professional Layout)
    const cols = [
        { wch: 10 }, // PNR
        { wch: 12 }, // Status
        { wch: 12 }, // Category
        { wch: 25 }, // Client
        { wch: 20 }, // Notes
        { wch: 35 }, // Passengers
        { wch: 20 }, // Route
        { wch: 20 }, // Airline
        { wch: 12 }, // Dep
        { wch: 12 }, // Ret
        { wch: 10 }, // Price
        { wch: 8 },  // Curr
        { wch: 22 }  // Deadline
    ];
    ws['!cols'] = cols;

    // Merges for Title
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Merge Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }  // Merge Metadata
    ];

    // Apply Styles to Cells
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            if (!ws[cellRef]) continue;

            if (!ws[cellRef].s) ws[cellRef].s = {};

            // Default Border for all table cells
            if (R >= 3) {
                ws[cellRef].s.border = {
                    top: { style: "thin", color: { rgb: "E2E8F0" } },
                    bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                    left: { style: "thin", color: { rgb: "E2E8F0" } },
                    right: { style: "thin", color: { rgb: "E2E8F0" } }
                };
                ws[cellRef].s.alignment = { vertical: "center", horizontal: "left", wrapText: true };
                ws[cellRef].s.font = { name: "Arial", sz: 10, color: { rgb: "334155" } };
            }

            // Title Style (Row 0)
            if (R === 0) {
                ws[cellRef].s = {
                    font: { name: "Arial", sz: 18, bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4F46E5" } }, // Indigo
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }
            // Metadata Style (Row 1)
            else if (R === 1) {
                ws[cellRef].s = {
                    font: { name: "Arial", sz: 10, italic: true, color: { rgb: "64748B" } },
                    alignment: { horizontal: "right", vertical: "center" },
                    fill: { fgColor: { rgb: "F1F5F9" } } // Light Slate
                };
            }
            // Header Style (Row 3 - Actual headers)
            else if (R === 3) {
                ws[cellRef].s = {
                    font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "1E293B" } }, // Slate 800
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        bottom: { style: "medium", color: { rgb: "FFFFFF" } },
                        right: { style: "thin", color: { rgb: "FFFFFF" } }
                    }
                };
            }
            // Status Column Styling (Column 1)
            else if (R > 3 && C === 1) {
                const status = ws[cellRef].v;
                let color = "334155";
                if (status === "Ticketed") color = "16A34A"; // Green
                if (status === "Pending") color = "CA8A04"; // Yellow/Orange
                if (status === "Optioned") color = "9333EA"; // Purple
                if (status === "Cancelled") color = "DC2626"; // Red
                
                ws[cellRef].s.font = { bold: true, color: { rgb: color } };
                ws[cellRef].s.alignment = { horizontal: "center" };
            }
            // Price Column (Column 10)
            else if (R > 3 && C === 10) {
                 ws[cellRef].s.font = { bold: true };
                 ws[cellRef].s.alignment = { horizontal: "right" };
            }
        }
    }

    // 5. Write File
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    const fileName = `TravelPro_Bookings_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Booking Management</h1>
        <div className="flex gap-2">
            <button 
                onClick={handleExportToExcel}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
                title="Download Professional Excel Report"
            >
                <Download size={18} /> Export Report
            </button>
            <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
            >
                <Plus size={18} /> New Booking
            </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            {['All', 'Client', 'Colleague'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {tab === 'All' ? 'All Bookings' : `${tab} Bookings`}
                </button>
            ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search PNR, Client, Route..." 
                className="w-full pl-10 pr-4 py-2 bg-black text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
            <Filter size={18} className="text-slate-400" />
            {['All', 'Pending', 'Optioned', 'Ticketed', 'Cancelled'].map(s => (
                <button 
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                >
                {s}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm">PNR</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Type</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Client / Pax</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Route</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Dates</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Deadline</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-600">{booking.pnr}</td>
                    <td className="p-4">
                        {booking.category === 'Client' ? 
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100"><Users size={12}/> Client</span> : 
                            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100"><Briefcase size={12}/> Colleague</span>
                        }
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{booking.clientName}</div>
                      {booking.clientDivers && <div className="text-xs text-slate-500 italic">{booking.clientDivers}</div>}
                      <div className="text-xs text-slate-400 mt-1">{booking.passengers.length} Passenger(s)</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <Plane size={14} className="text-slate-400" /> {booking.route}
                      </div>
                      <div className="text-xs text-slate-500">{booking.airline}</div>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                        <div>Dep: {new Date(booking.departureDate).toLocaleDateString()}</div>
                        {booking.returnDate && <div className="text-xs text-slate-400">Ret: {new Date(booking.returnDate).toLocaleDateString()}</div>}
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className={`text-sm ${new Date(booking.ticketingDeadline) < new Date() && booking.status !== BookingStatus.TICKETED ? 'text-red-600 font-bold' : ''}`}>
                         {new Date(booking.ticketingDeadline).toLocaleDateString([], {month:'short', day:'numeric'})}
                      </div>
                      <div className="text-xs text-slate-400">{new Date(booking.ticketingDeadline).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 flex justify-end items-center">
                        {booking.status !== BookingStatus.TICKETED && booking.status !== BookingStatus.CANCELLED && (
                             <button 
                                onClick={() => onUpdateStatus(booking.id, BookingStatus.TICKETED)}
                                className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100"
                            >
                                Ticket
                            </button>
                        )}
                        <button 
                            onClick={() => onOpenMessage(booking)}
                            className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-100"
                        >
                            Msg
                        </button>
                        <button
                            onClick={() => onDeleteBooking(booking.id)}
                            className="text-xs text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                            title="Delete Booking"
                        >
                            <Trash2 size={16}/>
                        </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="p-8 text-center text-slate-400">No bookings found matching your criteria.</div>
          )}
        </div>
      </div>

      {/* NEW BOOKING MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh]">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white sticky top-0 z-10">
              <h2 className="font-bold text-lg flex items-center gap-2"><Plane size={20}/> New Booking Record</h2>
              <button onClick={() => setIsFormOpen(false)} className="hover:bg-indigo-700 p-1 rounded">✕</button>
            </div>
            
            <form onSubmit={handleAdd} className="p-6 space-y-6">
                
                {/* 1. Header & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Booking Category</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 border border-slate-200 p-3 rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                                <input type="radio" name="category" checked={newBooking.category === 'Client'} onChange={() => setNewBooking({...newBooking, category: 'Client'})} />
                                <span className="font-medium text-slate-700">Client Booking</span>
                            </label>
                            <label className="flex items-center gap-2 border border-slate-200 p-3 rounded-lg cursor-pointer hover:bg-slate-50 flex-1">
                                <input type="radio" name="category" checked={newBooking.category === 'Colleague'} onChange={() => setNewBooking({...newBooking, category: 'Colleague'})} />
                                <span className="font-medium text-slate-700">Colleague Booking</span>
                            </label>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {newBooking.category === 'Client' ? 'Client En Compte (Name)' : 'Colleague Name'}
                        </label>
                        <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500" 
                            list="client-suggestions"
                            value={newBooking.clientName || ''}
                            onChange={(e) => setNewBooking({...newBooking, clientName: e.target.value})}
                        />
                        <datalist id="client-suggestions">
                            {clients.map(c => <option key={c.id} value={c.name} />)}
                        </datalist>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {newBooking.category === 'Client' ? 'Client Divers (Notes)' : 'Colleague Dept/Notes'}
                        </label>
                        <input type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500" 
                            value={newBooking.clientDivers || ''}
                            onChange={(e) => setNewBooking({...newBooking, clientDivers: e.target.value})}
                        />
                    </div>
                </div>

                {/* 2. Passengers */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><Users size={16}/> Passengers</h3>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-600">Total Pax:</label>
                            <input type="number" min="1" max="50" className="w-16 p-1 bg-black text-white border border-slate-700 rounded text-center font-bold"
                                value={newBooking.passengers?.length || 1}
                                onChange={(e) => handlePassengerCountChange(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {newBooking.passengers?.map((pax, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-white border border-slate-200 rounded shadow-sm">
                                <div className="md:col-span-1">
                                    <input required placeholder={`Passenger ${idx+1} Name`} className="w-full p-2 text-sm bg-black text-white border border-slate-700 rounded"
                                        value={pax.name} onChange={(e) => handlePaxChange(idx, 'name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input placeholder="Phone (WhatsApp)" className="w-full p-2 text-sm bg-black text-white border border-slate-700 rounded"
                                        value={pax.phone} onChange={(e) => handlePaxChange(idx, 'phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input placeholder="Email" className="w-full p-2 text-sm bg-black text-white border border-slate-700 rounded"
                                        value={pax.email} onChange={(e) => handlePaxChange(idx, 'email', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2"><Plane size={16}/> Travel Details</h3>
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Route (Parcours)</label>
                         <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 uppercase" placeholder="CMN - CDG - JFK"
                            value={newBooking.route || ''} onChange={(e) => setNewBooking({...newBooking, route: e.target.value})}
                         />
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Airline</label>
                         <input type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Royal Air Maroc"
                            value={newBooking.airline || ''} onChange={(e) => setNewBooking({...newBooking, airline: e.target.value})}
                         />
                    </div>

                    <div className="col-span-2 flex gap-4 my-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <input type="radio" name="tripType" checked={newBooking.tripType === 'One-way'} onChange={() => setNewBooking({...newBooking, tripType: 'One-way'})} />
                            One-way
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <input type="radio" name="tripType" checked={newBooking.tripType === 'Round-trip'} onChange={() => setNewBooking({...newBooking, tripType: 'Round-trip'})} />
                            Round-trip
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date</label>
                        <input required type="date" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
                            value={newBooking.departureDate?.split('T')[0] || ''} 
                            onChange={(e) => setNewBooking({...newBooking, departureDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label>
                        <input type="date" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-800 disabled:text-slate-400 [color-scheme:dark]"
                            disabled={newBooking.tripType === 'One-way'}
                            value={newBooking.returnDate?.split('T')[0] || ''} 
                            onChange={(e) => setNewBooking({...newBooking, returnDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                        />
                    </div>
                </div>

                {/* 4. Commercial & Amadeus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amadeus PNR</label>
                        <input required type="text" maxLength={6} className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 uppercase font-mono" placeholder="XJ59LM"
                            value={newBooking.pnr || ''} onChange={(e) => setNewBooking({...newBooking, pnr: e.target.value.toUpperCase()})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price ({newBooking.currency})</label>
                        <input required type="number" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={newBooking.price || ''} onChange={(e) => setNewBooking({...newBooking, price: parseFloat(e.target.value)})}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ticketing Deadline</label>
                        <input required type="datetime-local" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 font-bold [color-scheme:dark]"
                             value={newBooking.ticketingDeadline?.slice(0, 16) || ''} 
                             onChange={(e) => setNewBooking({...newBooking, ticketingDeadline: e.target.value ? new Date(e.target.value).toISOString() : undefined})} 
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                         <select className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={newBooking.status} onChange={(e) => setNewBooking({...newBooking, status: e.target.value as BookingStatus})}
                         >
                            <option value={BookingStatus.PENDING}>Pending</option>
                            <option value={BookingStatus.OPTIONED}>Optioned</option>
                            <option value={BookingStatus.TICKETED}>Ticketed</option>
                            <option value={BookingStatus.CANCELLED}>Cancelled</option>
                         </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-medium">Create Record</button>
                </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManager;