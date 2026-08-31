export type PublicationStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'VALIDATED'
  | 'TO_PUBLISH'
  | 'PUBLISHED'
  | 'VISIT_REQUESTED'
  | 'VISIT_SCHEDULED'
  | 'VISIT_COMPLETED'
  | 'RENTAL_IN_PROGRESS'
  | 'RENTED'
  | 'ARCHIVED'
  | 'REJECTED';

export type VisitStatus = 'PENDING' | 'FASTHOME_APPROVED' | 'OWNER_APPROVED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'DECLINED';
export type ContractStatus = 'DRAFT' | 'AWAITING_SIGNATURES' | 'DOCUMENTS_UPLOADED' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
export type PaymentStatus = 'UPCOMING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';

export interface Property {
  id: string;
  reference: string;
  title: string;
  type: 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'VILLA' | 'OFFICE' | 'OTHER';
  province: string;
  city: string;
  commune: string;
  neighborhood: string;
  exactAddress?: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  livingRooms: number;
  bathrooms: number;
  toilets: number;
  floor?: number;
  parking: boolean;
  water: boolean;
  electricity: boolean;
  security: boolean;
  furnished: boolean;
  description: string;
  ownerId: string;
  ownerRent: number;
  fasthomeMargin: number;
  tenantRent: number;
  status: PublicationStatus;
  publishedAt?: string;
}

export interface MatchBreakdown {
  budget: number;
  location: number;
  bedrooms: number;
  amenities: number;
  propertyType: number;
  security: number;
  total: number;
}

export interface VisitRequest {
  id: string;
  propertyId: string;
  requesterId: string;
  preferredDate: string;
  preferredTime: string;
  status: VisitStatus;
  agentId?: string;
  ownerApproved?: boolean;
  fasthomeApproved?: boolean;
  notes?: string;
}

export interface Contract {
  id: string;
  reference: string;
  propertyId: string;
  partyId: string;
  role: 'TENANT' | 'OWNER';
  status: ContractStatus;
  startDate: string;
  endDate: string;
  amount: number;
  signedDocumentUrl?: string;
  qrToken: string;
}

export interface Payment {
  id: string;
  contractId: string;
  dueDate: string;
  expectedAmount: number;
  paidAmount: number;
  paidAt?: string;
  reference?: string;
  method?: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'OTHER';
  proofUrl?: string;
  status: PaymentStatus;
  comment?: string;
}

export function propertyReference(sequence: number) {
  return `FAST-BIEN-${String(sequence).padStart(6, '0')}`;
}

export function contractReference(year: number, sequence: number) {
  return `FAST-CTR-${year}-${String(sequence).padStart(6, '0')}`;
}
