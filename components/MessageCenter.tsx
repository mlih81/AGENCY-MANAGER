import React, { useState, useEffect } from 'react';
import { Booking, AgentProfile } from '../types';
import { generateDraftMessage } from '../services/geminiService';
import { Send, Sparkles, MessageSquare, Copy, RefreshCw } from 'lucide-react';

interface MessageCenterProps {
  booking: Booking | null;
  agentProfile: AgentProfile;
  onClose: () => void;
}

const MessageCenter: React.FC<MessageCenterProps> = ({ booking, agentProfile, onClose }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<'professional' | 'friendly' | 'urgent'>('professional');
  const [msgType, setMsgType] = useState<'offer' | 'reminder' | 'status'>('offer');

  // Generate draft on open if data exists
  useEffect(() => {
    if (booking) {
      handleGenerate();
    }
  }, [booking]);

  const handleGenerate = async () => {
    if (!booking) return;
    setLoading(true);
    let text = await generateDraftMessage(booking, msgType, tone);
    
    // Append Signature
    text += `\n\nBest regards,\n${agentProfile.name}\n${agentProfile.agencyName}\n📞 ${agentProfile.phone}\n📧 ${agentProfile.email}`;

    setMessage(text);
    setLoading(false);
  };

  const handleSendWhatsApp = () => {
    if(!booking) return;
    // Try to find a valid phone number from passengers or prompt user
    const firstPaxWithPhone = booking.passengers.find(p => p.phone);
    const phone = firstPaxWithPhone ? firstPaxWithPhone.phone.replace(/[^0-9]/g, '') : '';
    
    if (phone) {
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        onClose();
    } else {
        alert("No phone number found in passenger details. Please copy the text manually.");
    }
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare size={24}/> {booking.category} Communication
                </h2>
                <p className="text-emerald-100 text-sm mt-1">
                    Drafting message for {booking.clientName} (PNR: {booking.pnr})
                </p>
             </div>
             <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition">
                 ✕
             </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="flex flex-wrap gap-4 mb-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Message Type</label>
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                        {(['offer', 'reminder', 'status'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setMsgType(t)}
                                className={`px-3 py-1 text-sm rounded-md capitalize transition-all ${msgType === t ? 'bg-emerald-100 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Tone</label>
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                        {(['professional', 'friendly', 'urgent'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                className={`px-3 py-1 text-sm rounded-md capitalize transition-all ${tone === t ? 'bg-emerald-100 text-emerald-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg transition-all shadow-sm disabled:opacity-50"
            >
                {loading ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18} className="text-yellow-400"/>}
                {loading ? 'AI is Drafting...' : 'Regenerate with Gemini AI'}
            </button>
        </div>

        {/* Editor */}
        <div className="p-6 flex-1 flex flex-col min-h-0">
            <label className="block text-sm font-medium text-slate-700 mb-2">Message Preview</label>
            <textarea
                className="w-full flex-1 p-4 bg-black text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none leading-relaxed font-sans placeholder-slate-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message will appear here..."
            ></textarea>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                onClick={() => navigator.clipboard.writeText(message)}
            >
                <Copy size={16}/> Copy Text
            </button>

            <button 
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all transform hover:scale-105"
            >
                <Send size={18}/> Send via WhatsApp
            </button>
        </div>

      </div>
    </div>
  );
};

export default MessageCenter;