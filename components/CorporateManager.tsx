import React, { useState } from 'react';
import { CorporatePartner } from '../types';
import { Building2, Plus, Search, MapPin, User, Phone, Mail, FileText, Trash2 } from 'lucide-react';

interface CorporatePartnerManagerProps {
  partners: CorporatePartner[];
  onAddPartner: (partner: CorporatePartner) => void;
  onDeletePartner: (id: string) => void;
}

const CorporateManager: React.FC<CorporatePartnerManagerProps> = ({ partners, onAddPartner, onDeletePartner }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newPartner, setNewPartner] = useState<Partial<CorporatePartner>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.companyName || !newPartner.contactPerson) return;

    const partner: CorporatePartner = {
      id: Math.random().toString(36).substr(2, 9),
      companyName: newPartner.companyName,
      contactPerson: newPartner.contactPerson,
      email: newPartner.email || '',
      phone: newPartner.phone || '',
      address: newPartner.address || '',
      notes: newPartner.notes || ''
    };

    onAddPartner(partner);
    setIsModalOpen(false);
    setNewPartner({});
  };

  const filteredPartners = partners.filter(p => 
    p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Corporate Partners (STE)</h1>
                <p className="text-slate-500">Manage B2B contracts and company profiles.</p>
            </div>
            <button 
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md cursor-pointer"
            >
                <Plus size={18} /> Add Corporate Partner
            </button>
       </div>

       {/* Search */}
       <div className="mb-6 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search companies or contact persons..." 
            className="w-full pl-10 pr-4 py-2 bg-black text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
         {filteredPartners.map(partner => (
           <div key={partner.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
             
             {/* Delete Button - Improved clickability */}
             <button 
                type="button"
                onClick={() => onDeletePartner(partner.id)}
                className="absolute top-4 right-4 z-20 text-slate-300 hover:text-red-500 p-2.5 bg-white rounded-full transition-all border border-slate-100 shadow-sm hover:shadow-md cursor-pointer"
                title="Delete Partner"
             >
                <Trash2 size={18}/>
             </button>

             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Building2 size={80} className="text-indigo-600"/>
             </div>
             
             <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="p-3 rounded-lg bg-indigo-100 text-indigo-700">
                    <Building2 size={24}/>
                </div>
                <div className="pr-10">
                    <h3 className="font-bold text-slate-800 text-lg truncate max-w-[150px]">{partner.companyName}</h3>
                    <p className="text-xs text-slate-500">Partner ID: {partner.id}</p>
                </div>
             </div>
             
             <div className="space-y-3 text-sm text-slate-600 flex-1 relative z-10">
                <div className="flex items-start gap-3">
                    <User size={16} className="text-slate-400 mt-0.5"/> 
                    <div>
                        <span className="font-semibold text-slate-700 block">{partner.contactPerson}</span>
                        <span className="text-xs text-slate-400">Contact Person</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-400"/> 
                    <span>{partner.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400"/> 
                    <span className="truncate">{partner.email}</span>
                </div>
                {partner.address && (
                    <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-slate-400 mt-0.5"/> 
                        <span className="line-clamp-2">{partner.address}</span>
                    </div>
                )}
                {partner.notes && (
                    <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100 mt-2 italic">
                        "{partner.notes}"
                    </div>
                )}
             </div>
           </div>
         ))}
       </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="bg-indigo-600 p-4 rounded-t-xl flex justify-between items-center text-white">
                    <h2 className="font-bold text-lg flex items-center gap-2"><Building2 size={20}/> Register New Partner</h2>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="hover:bg-indigo-700 p-1 rounded">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                        <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={newPartner.companyName || ''} onChange={(e) => setNewPartner({...newPartner, companyName: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                            <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                                value={newPartner.contactPerson || ''} onChange={(e) => setNewPartner({...newPartner, contactPerson: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                                value={newPartner.phone || ''} onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input required type="email" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={newPartner.email || ''} onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={newPartner.address || ''} onChange={(e) => setNewPartner({...newPartner, address: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                        <textarea className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 h-20 resize-none" placeholder="Payment terms, contract info..."
                            value={newPartner.notes || ''} onChange={(e) => setNewPartner({...newPartner, notes: e.target.value})}
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold mt-2 shadow-lg transition-colors cursor-pointer">
                        Register Partner
                    </button>
                </form>
            </div>
        </div>
       )}
    </div>
  );
};

export default CorporateManager;
