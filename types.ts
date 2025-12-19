export enum BookingStatus {
  PENDING = 'Pending',
  OPTIONED = 'Optioned',
  TICKETED = 'Ticketed',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired'
}

export type BookingCategory = 'Client' | 'Colleague';

export interface Passenger {
  name: string;
  phone: string;
  email: string;
}

export interface Booking {
  id: string;
  createdAt: string;

  // Header
  category: BookingCategory;
  clientName: string; // "Client En Compte" or Colleague Name
  clientDivers?: string; // Extra info for casual clients

  // Passenger Details
  passengers: Passenger[];

  // Travel Details
  route: string;
  tripType: 'One-way' | 'Round-trip';
  departureDate: string;
  returnDate?: string;
  airline: string;

  // Commercial
  price: number;
  currency: string;
  pnr: string;
  ticketingDeadline: string;
  status: BookingStatus;
  conditions: string;
}

export enum UserRole {
  CLIENT = 'Client',
  COLLEAGUE = 'Colleague'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  language: 'en' | 'fr' | 'ar';
  preferredComm: 'Email' | 'WhatsApp' | 'Both';
  notes?: string;
}

export interface Colleague {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface CorporatePartner {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface AgentProfile {
  name: string;
  agencyName: string;
  email: string;
  phone: string;
  website?: string;
}