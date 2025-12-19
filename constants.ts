import { Booking, BookingStatus, UserRole, Client, Colleague, CorporatePartner } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Sarah Amrani',
    email: 'sarah.am@example.com',
    phone: '+212600112233',
    role: UserRole.CLIENT,
    language: 'fr',
    preferredComm: 'WhatsApp',
    notes: 'Frequent traveler to Paris. Prefers window seats.'
  },
  {
    id: 'c2',
    name: 'Karim Bennani',
    email: 'karim.ben@example.com',
    phone: '+212661223344',
    role: UserRole.CLIENT,
    language: 'ar',
    preferredComm: 'Email',
    notes: 'Vegetarian meal request usually.'
  }
];

export const MOCK_COLLEAGUES: Colleague[] = [
  {
    id: 'col1',
    name: 'Mehdi Tazi',
    position: 'Senior Agent',
    email: 'm.tazi@agency.com',
    phone: '+212661998877'
  },
  {
    id: 'col2',
    name: 'Leila Hachimi',
    position: 'Ticketing Specialist',
    email: 'l.hachimi@agency.com',
    phone: '+212600554433'
  }
];

export const MOCK_PARTNERS: CorporatePartner[] = [
  {
    id: 'p1',
    companyName: 'TechSolutions Morocco',
    contactPerson: 'Omar Fassi',
    email: 'omar.f@techsolutions.ma',
    phone: '+212522998877',
    address: '123 Bd Anfa, Casablanca',
    notes: 'Net 30 payment terms.'
  }
];

// Helper to get future dates
const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Intentionally empty to comply with "Delete all imported PNRs" rule.
export const MOCK_BOOKINGS: Booking[] = [];