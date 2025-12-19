import { Booking, Client, Colleague, CorporatePartner, AgentProfile } from '../types';

const STORAGE_KEYS = {
  BOOKINGS: 'travelpro_bookings',
  CLIENTS: 'travelpro_clients',
  COLLEAGUES: 'travelpro_colleagues',
  PARTNERS: 'travelpro_partners',
  PROFILE: 'travelpro_profile'
};

export const storage = {
  saveBookings: (data: Booking[]) => localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(data)),
  loadBookings: (): Booking[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]'),

  saveClients: (data: Client[]) => localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data)),
  loadClients: (): Client[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]'),

  saveColleagues: (data: Colleague[]) => localStorage.setItem(STORAGE_KEYS.COLLEAGUES, JSON.stringify(data)),
  loadColleagues: (): Colleague[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.COLLEAGUES) || '[]'),

  savePartners: (data: CorporatePartner[]) => localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(data)),
  loadPartners: (): CorporatePartner[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTNERS) || '[]'),

  saveProfile: (data: AgentProfile) => localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data)),
  loadProfile: (): AgentProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  // Desktop Data Management
  exportDatabase: () => {
    const database = {
      bookings: storage.loadBookings(),
      clients: storage.loadClients(),
      colleagues: storage.loadColleagues(),
      partners: storage.loadPartners(),
      profile: storage.loadProfile(),
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };
    
    const blob = new Blob([JSON.stringify(database, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TravelPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importDatabase: async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.bookings) storage.saveBookings(data.bookings);
      if (data.clients) storage.saveClients(data.clients);
      if (data.colleagues) storage.saveColleagues(data.colleagues);
      if (data.partners) storage.savePartners(data.partners);
      if (data.profile) storage.saveProfile(data.profile);
      
      return true;
    } catch (e) {
      console.error("Failed to import database", e);
      return false;
    }
  }
};
