import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plane, Users, CalendarDays, Settings, LogOut, Briefcase, MessageCircle, Database, ShieldCheck, Download } from 'lucide-react';
import Dashboard from './components/Dashboard';
import BookingManager from './components/BookingManager';
import ClientManager from './components/ClientManager';
import CorporateManager from './components/CorporateManager';
import SettingsManager from './components/SettingsManager';
import MessageCenter from './components/MessageCenter';
import { storage } from './services/storage';
import { MOCK_CLIENTS, MOCK_COLLEAGUES, MOCK_PARTNERS } from './constants';
import { Booking, BookingStatus, Client, Colleague, CorporatePartner, AgentProfile } from './types';

// --- Internal Components for Calendar ---
const CalendarView: React.FC<{ bookings: Booking[] }> = ({ bookings }) => {
  const events = bookings.flatMap(b => [
    { date: new Date(b.departureDate), type: 'Travel', booking: b },
    { date: new Date(b.ticketingDeadline), type: 'Deadline', booking: b }
  ]).sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingEvents = events.filter(e => e.date >= new Date());

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Schedule & Deadlines</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {upcomingEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No upcoming events found.</div>
          ) : (
            upcomingEvents.map((event, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition flex items-center gap-4">
                 <div className={`flex-shrink-0 w-16 text-center py-2 rounded-lg ${event.type === 'Deadline' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <div className="text-xs font-bold uppercase">{event.date.toLocaleString('en-US', { month: 'short' })}</div>
                    <div className="text-xl font-bold">{event.date.getDate()}</div>
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full ${event.type === 'Deadline' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {event.type}
                        </span>
                        <span className="text-xs text-slate-400">{event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <h3 className="font-medium text-slate-800 mt-1">
                        {event.booking.route} <span className="text-slate-400 font-normal">({event.booking.pnr})</span>
                    </h3>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Nav Item ---
interface NavItemProps {
  view: string;
  currentView: string;
  icon: any;
  label: string;
  onClick: (view: any) => void;
}

const NavItem: React.FC<NavItemProps> = ({ view, currentView, icon: Icon, label, onClick }) => (
  <button
    onClick={() => onClick(view)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      currentView === view 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'bookings' | 'clients' | 'partners' | 'calendar' | 'settings'>('dashboard');
  
  // Data State - Initialize from Local Storage
  const [bookings, setBookings] = useState<Booking[]>(() => storage.loadBookings());
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = storage.loadClients();
    return saved.length > 0 ? saved : MOCK_CLIENTS;
  });
  const [colleagues, setColleagues] = useState<Colleague[]>(() => {
    const saved = storage.loadColleagues();
    return saved.length > 0 ? saved : MOCK_COLLEAGUES;
  });
  const [partners, setPartners] = useState<CorporatePartner[]>(() => {
    const saved = storage.loadPartners();
    return saved.length > 0 ? saved : MOCK_PARTNERS;
  });
  
  const [agentProfile, setAgentProfile] = useState<AgentProfile>(() => {
    return storage.loadProfile() || {
      name: 'Travel Agent Pro',
      agencyName: 'MHT Travel',
      email: 'fly@mht.ma',
      phone: '+212661866437',
      website: 'www.mht.ma'
    };
  });

  const [messageModal, setMessageModal] = useState<{isOpen: boolean, booking: Booking | null}>({ isOpen: false, booking: null });

  // Persistence Effects
  useEffect(() => storage.saveBookings(bookings), [bookings]);
  useEffect(() => storage.saveClients(clients), [clients]);
  useEffect(() => storage.saveColleagues(colleagues), [colleagues]);
  useEffect(() => storage.savePartners(partners), [partners]);
  useEffect(() => storage.saveProfile(agentProfile), [agentProfile]);

  // --- CRUD Handlers ---
  const handleAddBooking = (newBooking: Booking) => setBookings([newBooking, ...bookings]);
  const handleUpdateStatus = (id: string, status: BookingStatus) => setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  const handleDeleteBooking = (id: string) => {
    if(window.confirm('Are you sure you want to delete this booking?')) {
        setBookings(bookings.filter(b => b.id !== id));
    }
  };
  
  const handleAddClient = (newClient: Client) => setClients([...clients, newClient]);
  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };
  const handleDeleteClient = (id: string) => {
    if(window.confirm('Are you sure you want to delete this client profile?')) {
        setClients(clients.filter(c => c.id !== id));
    }
  };

  const handleAddColleague = (newColleague: Colleague) => setColleagues([...colleagues, newColleague]);
  const handleUpdateColleague = (updatedColleague: Colleague) => {
    setColleagues(colleagues.map(c => c.id === updatedColleague.id ? updatedColleague : c));
  };
  const handleDeleteColleague = (id: string) => {
     if(window.confirm('Are you sure you want to remove this colleague from the system?')) {
        setColleagues(colleagues.filter(c => c.id !== id));
     }
  };

  const handleAddPartner = (newPartner: CorporatePartner) => setPartners([...partners, newPartner]);
  const handleDeletePartner = (id: string) => {
    if(window.confirm('Delete this corporate partner?')) {
        setPartners(partners.filter(p => p.id !== id));
    }
  };

  const handleUpdateProfile = (profile: AgentProfile) => setAgentProfile(profile);

  const handleSupportWhatsApp = () => {
      window.open(`https://wa.me/212661866437`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-screen sticky top-0 z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xl">
             <Plane className="fill-current" />
             <span>TravelPro</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Local Desktop Vault</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem view="dashboard" currentView={currentView} onClick={setCurrentView} icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="bookings" currentView={currentView} onClick={setCurrentView} icon={Plane} label="Bookings" />
          <NavItem view="clients" currentView={currentView} onClick={setCurrentView} icon={Users} label="Clients" />
          <NavItem view="partners" currentView={currentView} onClick={setCurrentView} icon={Briefcase} label="Corporate (STE)" />
          
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
             <NavItem view="calendar" currentView={currentView} onClick={setCurrentView} icon={CalendarDays} label="Calendar" />
             <NavItem view="settings" currentView={currentView} onClick={setCurrentView} icon={Settings} label="Settings" />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
             <button 
                onClick={handleSupportWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-emerald-600 hover:bg-emerald-50"
             >
                <MessageCircle size={20} />
                <span>Local Support</span>
             </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="mb-4 px-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                 <Database size={10} className="text-indigo-500"/> Secure Local Storage
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Signed Agent</div>
              <div className="text-sm font-bold text-slate-700 truncate">{agentProfile.name}</div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 text-[10px] text-emerald-600 bg-emerald-100/50 rounded font-bold border border-emerald-200">
             <ShieldCheck size={12}/> Zero Cloud Syncing
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-white md:bg-slate-50">
        {currentView === 'dashboard' && <Dashboard bookings={bookings} clients={clients} />}
        
        {currentView === 'bookings' && (
            <BookingManager 
                bookings={bookings} 
                clients={clients} 
                onAddBooking={handleAddBooking} 
                onUpdateStatus={handleUpdateStatus}
                onDeleteBooking={handleDeleteBooking}
                onOpenMessage={(b) => setMessageModal({ isOpen: true, booking: b })}
            />
        )}
        
        {currentView === 'clients' && (
            <ClientManager 
                clients={clients} 
                onAddClient={handleAddClient} 
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
            />
        )}
        
        {currentView === 'partners' && (
            <CorporateManager 
                partners={partners}
                onAddPartner={handleAddPartner}
                onDeletePartner={handleDeletePartner}
            />
        )}

        {currentView === 'calendar' && <CalendarView bookings={bookings} />}
        
        {currentView === 'settings' && (
            <SettingsManager 
                colleagues={colleagues} 
                onAddColleague={handleAddColleague}
                onUpdateColleague={handleUpdateColleague}
                onDeleteColleague={handleDeleteColleague}
                agentProfile={agentProfile}
                onUpdateProfile={handleUpdateProfile}
            />
        )}
      </main>

      {/* Message Modal */}
      {messageModal.isOpen && (
        <MessageCenter 
            booking={messageModal.booking} 
            agentProfile={agentProfile}
            onClose={() => setMessageModal({ isOpen: false, booking: null })}
        />
      )}

    </div>
  );
}

export default App;
