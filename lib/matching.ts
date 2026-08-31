import type { MatchBreakdown, Property } from './domain';

export interface SearchCriteria {
  budget?: number;
  city?: string;
  commune?: string;
  neighborhood?: string;
  bedrooms?: number;
  propertyType?: Property['type'];
  parking?: boolean;
  water?: boolean;
  electricity?: boolean;
  security?: boolean;
  furnished?: boolean;
}

const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[-_]/g, ' ')
  .trim();

const locationScore = (wanted: string | undefined, actual: string) => {
  if (!wanted) return 0;
  const a = normalize(wanted);
  const b = normalize(actual);
  if (!a) return 0;
  if (a === b) return 25;
  if (b.includes(a) || a.includes(b)) return 20;
  const wantedWords = new Set(a.split(/\s+/));
  const actualWords = new Set(b.split(/\s+/));
  const overlap = [...wantedWords].filter((word) => actualWords.has(word)).length;
  return overlap ? 12 : 0;
};

export function calculateMatch(property: Property, criteria: SearchCriteria): MatchBreakdown {
  const budget = criteria.budget == null ? 25 : property.tenantRent <= criteria.budget ? 25 : property.tenantRent <= criteria.budget * 1.1 ? 18 : property.tenantRent <= criteria.budget * 1.2 ? 10 : 0;
  const location = Math.min(25, Math.max(locationScore(criteria.city, property.city), locationScore(criteria.commune, property.commune), locationScore(criteria.neighborhood, property.neighborhood)));
  const bedrooms = criteria.bedrooms == null ? 15 : property.bedrooms >= criteria.bedrooms ? 15 : property.bedrooms === criteria.bedrooms - 1 ? 8 : 0;
  const amenities = [criteria.parking === undefined || criteria.parking === property.parking, criteria.water === undefined || criteria.water === property.water, criteria.electricity === undefined || criteria.electricity === property.electricity, criteria.furnished === undefined || criteria.furnished === property.furnished].filter(Boolean).length * 5;
  const propertyType = !criteria.propertyType || criteria.propertyType === property.type ? 10 : 0;
  const security = criteria.security === undefined || criteria.security === property.security ? 10 : 0;
  const total = budget + location + bedrooms + amenities + propertyType + security;
  return { budget, location, bedrooms, amenities, propertyType, security, total: Math.min(100, total) };
}

export function explainMatch(breakdown: MatchBreakdown) {
  const strengths: string[] = [];
  if (breakdown.budget >= 25) strengths.push('votre budget');
  if (breakdown.bedrooms >= 15) strengths.push('le nombre de chambres');
  if (breakdown.location >= 20) strengths.push('votre zone préférée');
  if (breakdown.security >= 10) strengths.push('la sécurité');
  const strong = strengths.length ? `Ce bien correspond bien à ${strengths.join(', ')}.` : 'Ce bien correspond partiellement à vos critères.';
  return `${strong} Score global : ${breakdown.total}%.`;
}
