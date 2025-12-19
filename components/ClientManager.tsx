import React, { useState } from 'react';
import { Client, UserRole } from '../types';
import { User, Phone, Mail, Briefcase, Plus, Search, MessageCircle, Send, FileText, Trash2, Megaphone, Edit3 } from 'lucide-react';

interface ClientManagerProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [clientForm, setClientForm] = useState<Partial<Client>>({
    role: UserRole.CLIENT,
    language: 'fr',
    preferredComm: 'WhatsApp'
  });

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setClientForm({ role: UserRole.CLIENT, language: 'fr', preferredComm: 'WhatsApp' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setClientForm(client);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) return;

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        ...clientForm,
      } as Client);
    } else {
      const client: Client = {
        id: Math.random().toString(36).substr(2, 9),
        name: clientForm.name,
        email: clientForm.email || '',
        phone: clientForm.phone,
        role: UserRole.CLIENT,
        language: clientForm.language as any || 'fr',
        preferredComm: clientForm.preferredComm as any || 'WhatsApp',
        notes: clientForm.notes || ''
      };
      onAddClient(client);
    }

    setIsModalOpen(false);
    setEditingClient(null);
    setClientForm({ role: UserRole.CLIENT, language: 'fr', preferredComm: 'WhatsApp' });
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWhatsApp = (phone: string) => {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleEmail = (email: string) => {
      window.open(`mailto:${email}`, '_blank');
  };
  
  const handleBroadcastEmail = () => {
    const allEmails = clients.map(c => c.email).filter(Boolean);
    if(allEmails.length === 0) {
        alert("No client emails found.");
        return;
    }
    const mailtoLink = `mailto:?bcc=${allEmails.join(',')}&subject=Announcement from MHT Travel`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Client Database</h1>
                <p className="text-slate-500">Manage individual client profiles and communication.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    type="button"
                    onClick={handleBroadcastEmail}
                    className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
                    title="Send email to all clients"
                >
                    <Megaphone size={18} className="text-orange-500" /> Group Email
                </button>
                <button 
                    type="button"
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                >
                    <Plus size={18} /> Add New Client
                </button>
            </div>
       </div>

       {/* Search */}
       <div className="mb-6 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients by name, phone or email..." 
            className="w-full pl-10 pr-4 py-2 bg-black text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
         {filteredClients.map(client => (
           <div key={client.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col relative">
             
             {/* Action Buttons - Fixed click area and z-index */}
             <div className="absolute top-4 right-4 flex gap-2 z-30">
                <button 
                    type="button"
                    onClick={() => handleOpenEditModal(client)}
                    className="text-slate-400 hover:text-indigo-600 p-2.5 bg-white rounded-full transition-all border border-slate-100 shadow-sm hover:shadow-md cursor-pointer"
                    title="Modify Profile"
                >
                    <Edit3 size={18}/>
                </button>
                <button 
                    type="button"
                    onClick={() => onDeleteClient(client.id)}
                    className="text-slate-400 hover:text-red-500 p-2.5 bg-white rounded-full transition-all border border-slate-100 shadow-sm hover:shadow-md cursor-pointer"
                    title="Delete Client Profile"
                >
                    <Trash2 size={18}/>
                </button>
             </div>

             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <User size={24}/>
                </div>
                <div className="pr-20"> {/* Padding to avoid overlapping buttons */}
                    <h3 className="font-bold text-slate-800 text-lg truncate max-w-[150px]">{client.name}</h3>
                    <div className="flex gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {client.language}
                        </span>
                    </div>
                </div>
             </div>
             
             <div className="space-y-3 text-sm text-slate-600 flex-1">
                <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400"/> 
                    <span className="truncate">{client.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-400"/> 
                    <span>{client.phone}</span>
                </div>
                {client.notes && (
                    <div className="bg-yellow-50 p-2 rounded text-xs text-slate-600 border border-yellow-100 mt-2 flex gap-2">
                        <FileText size={14} className="text-yellow-500 flex-shrink-0 mt-0.5"/>
                        <span className="line-clamp-2">{client.notes}</span>
                    </div>
                )}
             </div>

             {/* Communication Actions */}
             <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                <button 
                    type="button"
                    onClick={() => handleWhatsApp(client.phone)}
                    className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2 rounded-lg transition-colors font-medium text-sm border border-emerald-100"
                >
                    <MessageCircle size={16}/> WhatsApp
                </button>
                <button 
                    type="button"
                    onClick={() => handleEmail(client.email)}
                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 rounded-lg transition-colors font-medium text-sm border border-blue-100"
                >
                    <Send size={16}/> Email
                </button>
             </div>
           </div>
         ))}
       </div>

       {/* Modal for Add / Edit */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="bg-indigo-600 p-4 rounded-t-xl flex justify-between items-center text-white">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        {editingClient ? <Edit3 size={20}/> : <Plus size={20}/>}
                        {editingClient ? 'Edit Client Profile' : 'Add New Client'}
                    </h2>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="hover:bg-indigo-700 p-1 rounded">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={clientForm.name || ''} onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 placeholder-slate-500" placeholder="+212..."
                                value={clientForm.phone || ''} onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                            <select className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                                value={clientForm.language} onChange={(e) => setClientForm({...clientForm, language: e.target.value as any})}
                            >
                                <option value="fr">French</option>
                                <option value="en">English</option>
                                <option value="ar">Arabic</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={clientForm.email || ''} onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Tags</label>
                        <textarea className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 h-20 resize-none" placeholder="e.g. VIP, Vegetarian, Frequent Flyer..."
                            value={clientForm.notes || ''} onChange={(e) => setClientForm({...clientForm, notes: e.target.value})}
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-bold mt-2 shadow-lg transition-colors">
                        {editingClient ? 'Update Profile' : 'Save Client Profile'}
                    </button>
                </form>
            </div>
        </div>
       )}
    </div>
  );
};

export default ClientManager;
