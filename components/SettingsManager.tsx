import React, { useState, useRef } from 'react';
import { Colleague, AgentProfile } from '../types.ts';
import { storage } from '../services/storage.ts';
import { 
  Settings, Users, Plus, Trash2, Shield, Mail, Phone, 
  UserCheck, CheckCircle, Database, Download, Upload, FileJson, Edit2
} from 'lucide-react';

interface SettingsManagerProps {
    colleagues: Colleague[];
    onAddColleague: (colleague: Colleague) => void;
    onUpdateColleague: (colleague: Colleague) => void;
    onDeleteColleague: (id: string) => void;
    agentProfile: AgentProfile;
    onUpdateProfile: (profile: AgentProfile) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ 
    colleagues, onAddColleague, onUpdateColleague, onDeleteColleague, agentProfile, onUpdateProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'colleagues' | 'data'>('profile');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColleague, setEditingColleague] = useState<Colleague | null>(null);
  const [profileForm, setProfileForm] = useState(agentProfile);
  const [saveStatus, setSaveStatus] = useState(false);
  const [colleagueForm, setColleagueForm] = useState<Partial<Colleague>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddModal = () => {
    setEditingColleague(null);
    setColleagueForm({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (colleague: Colleague) => {
    setEditingColleague(colleague);
    setColleagueForm(colleague);
    setIsModalOpen(true);
  };

  const handleColleagueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colleagueForm.name || !colleagueForm.email) return;
    
    if (editingColleague) {
        onUpdateColleague({
            ...editingColleague,
            ...colleagueForm,
        } as Colleague);
    } else {
        onAddColleague({
            id: Math.random().toString(36).substr(2, 9),
            name: colleagueForm.name!,
            position: colleagueForm.position || 'Agent',
            email: colleagueForm.email!,
            phone: colleagueForm.phone || ''
        });
    }
    
    setIsModalOpen(false);
    setEditingColleague(null);
    setColleagueForm({});
  };

  const handleSaveProfile = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateProfile(profileForm);
      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleExport = () => {
      storage.exportDatabase();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (window.confirm("WARNING: Importing a backup will overwrite all current local data. Continue?")) {
          const success = await storage.importDatabase(file);
          if (success) {
              alert("Data restored successfully. The application will now reload.");
              window.location.reload();
          } else {
              alert("Error importing data. Please ensure the file is a valid TravelPro backup.");
          }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 h-full flex flex-col">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings className="text-slate-500"/> Settings & Administration
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="w-full lg:w-64 flex-shrink-0">
                <nav className="space-y-1">
                    <button 
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Shield size={18}/> Agent Profile
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('colleagues')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${activeTab === 'colleagues' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Users size={18}/> Team Members
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('data')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${activeTab === 'data' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Database size={18}/> Data Management
                    </button>
                </nav>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
                {activeTab === 'profile' && (
                    <div className="max-w-xl">
                        <h2 className="text-lg font-bold text-slate-800 mb-1">My Agent Profile</h2>
                        <p className="text-sm text-slate-500 mb-6">Manage your contact details used in messages and emails.</p>
                        
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500" 
                                    value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name</label>
                                <input className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500" 
                                    value={profileForm.agencyName} onChange={e => setProfileForm({...profileForm, agencyName: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Outlook)</label>
                                    <input className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500" 
                                        value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone (WhatsApp)</label>
                                    <input className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500" 
                                        value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                                {saveStatus ? <CheckCircle size={18}/> : null}
                                {saveStatus ? 'Saved!' : 'Save Profile'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'colleagues' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Team Members</h2>
                                <p className="text-sm text-slate-500">Manage agency colleagues who use this system.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={handleOpenAddModal}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
                            >
                                <Plus size={18}/> Add New Colleague
                            </button>
                        </div>

                        <div className="space-y-4">
                            {colleagues.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                    No team members registered.
                                </div>
                            ) : (
                                colleagues.map(colleague => (
                                    <div key={colleague.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors relative">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                {colleague.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{colleague.name}</h3>
                                                <p className="text-xs text-indigo-600 font-medium uppercase">{colleague.position}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="hidden lg:flex flex-col text-right mr-2">
                                                <span className="flex items-center gap-2 justify-end text-xs text-slate-500"><Mail size={12}/> {colleague.email}</span>
                                                <span className="flex items-center gap-2 justify-end text-xs text-slate-500"><Phone size={12}/> {colleague.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 z-50">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(colleague)}
                                                    className="p-2.5 text-slate-400 hover:text-indigo-600 bg-white rounded-full transition-all border border-slate-100 shadow-sm hover:shadow-md cursor-pointer"
                                                    title="Modify Profile"
                                                >
                                                    <Edit2 size={18}/>
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => onDeleteColleague(colleague.id)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 bg-white rounded-full transition-all border border-slate-100 shadow-sm hover:shadow-md cursor-pointer"
                                                    title="Remove Colleague"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="max-w-2xl">
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Local Database Controls</h2>
                        <p className="text-sm text-slate-500 mb-8">Manage the local storage vault on this device.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
                                <Download className="text-indigo-600 mb-4" size={32}/>
                                <h3 className="font-bold text-slate-800 mb-2">Full Database Backup</h3>
                                <button 
                                    type="button"
                                    onClick={handleExport}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-600 px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                                >
                                    <FileJson size={18}/> Export (.json)
                                </button>
                            </div>
                            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
                                <Upload className="text-orange-600 mb-4" size={32}/>
                                <h3 className="font-bold text-slate-800 mb-2">Restore Backup</h3>
                                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-orange-200 text-orange-600 px-4 py-2.5 rounded-lg font-bold hover:bg-orange-50 transition-colors shadow-sm"
                                >
                                    <Database size={18}/> Import & Restore
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        {editingColleague ? <Edit2 size={20}/> : <UserCheck size={20}/>} 
                        {editingColleague ? 'Modify Team Member' : 'New Team Member'}
                    </h2>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded transition-colors">✕</button>
                </div>
                <form onSubmit={handleColleagueSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={colleagueForm.name || ''} onChange={(e) => setColleagueForm({...colleagueForm, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Position / Title</label>
                        <input type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 placeholder-slate-500" placeholder="e.g. Senior Agent"
                            value={colleagueForm.position || ''} onChange={(e) => setColleagueForm({...colleagueForm, position: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input required type="email" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={colleagueForm.email || ''} onChange={(e) => setColleagueForm({...colleagueForm, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input required type="text" className="w-full p-2 bg-black text-white border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                            value={colleagueForm.phone || ''} onChange={(e) => setColleagueForm({...colleagueForm, phone: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold mt-2 shadow-lg transition-all active:scale-[0.98]">
                        {editingColleague ? 'Update Profile' : 'Register Colleague'}
                    </button>
                </form>
            </div>
        </div>
       )}
    </div>
  );
};

export default SettingsManager;