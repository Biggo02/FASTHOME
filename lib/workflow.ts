import type { PublicationStatus, VisitStatus } from './domain';

const publicationTransitions: Record<PublicationStatus, PublicationStatus[]> = {
  DRAFT: ['IN_REVIEW'],
  IN_REVIEW: ['VALIDATED', 'REJECTED', 'DRAFT'],
  VALIDATED: ['TO_PUBLISH'],
  TO_PUBLISH: ['PUBLISHED'],
  PUBLISHED: ['VISIT_REQUESTED', 'ARCHIVED'],
  VISIT_REQUESTED: ['VISIT_SCHEDULED', 'PUBLISHED'],
  VISIT_SCHEDULED: ['VISIT_COMPLETED', 'PUBLISHED'],
  VISIT_COMPLETED: ['RENTAL_IN_PROGRESS', 'PUBLISHED'],
  RENTAL_IN_PROGRESS: ['RENTED', 'PUBLISHED'],
  RENTED: ['ARCHIVED'],
  ARCHIVED: [],
  REJECTED: ['DRAFT'],
};

const visitTransitions: Record<VisitStatus, VisitStatus[]> = {
  PENDING: ['FASTHOME_APPROVED', 'CANCELLED', 'DECLINED'],
  FASTHOME_APPROVED: ['OWNER_APPROVED', 'CANCELLED', 'DECLINED'],
  OWNER_APPROVED: ['CONFIRMED', 'CANCELLED', 'DECLINED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  DECLINED: [],
};

export function canTransitionPublication(from: PublicationStatus, to: PublicationStatus) {
  return publicationTransitions[from].includes(to);
}

export function canTransitionVisit(from: VisitStatus, to: VisitStatus) {
  return visitTransitions[from].includes(to);
}

export function approveVisit(status: VisitStatus, approvedByFastHome: boolean, approvedByOwner: boolean): VisitStatus {
  if (status === 'PENDING' && approvedByFastHome) return 'FASTHOME_APPROVED';
  if ((status === 'FASTHOME_APPROVED' || status === 'OWNER_APPROVED') && approvedByFastHome && approvedByOwner) return 'CONFIRMED';
  if (status === 'PENDING' && approvedByOwner) return 'OWNER_APPROVED';
  return status;
}
