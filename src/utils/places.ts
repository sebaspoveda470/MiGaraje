import { MUNICIPIOS_POR_DEPARTAMENTO } from '../data/municipios';

export interface Place {
  /** Municipality, e.g. "Medellín" */
  city: string;
  /** Department, e.g. "Antioquia" */
  department: string;
  /** What people read and what profiles store: "Medellín, Antioquia" ("Bogotá D.C." has no department part) */
  label: string;
}

/** Lowercase, without accents: "Bogotá D.C." → "bogota d.c." */
export const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

// Only Bogotá goes without a department; "Arauca, Arauca" or "Sucre, Sucre" keep theirs to stay unambiguous
const makeLabel = (city: string, department: string) => (department === 'Bogotá D.C.' ? city : `${city}, ${department}`);

export const ALL_PLACES: Place[] = Object.entries(MUNICIPIOS_POR_DEPARTAMENTO).flatMap(([department, cities]) =>
  cities.map((city) => ({ city, department, label: makeLabel(city, department) }))
);

// Suggested before the person types anything
const MAIN_CITIES = [
  'Bogotá D.C.',
  'Medellín, Antioquia',
  'Cali, Valle del Cauca',
  'Barranquilla, Atlántico',
  'Cartagena, Bolívar',
  'Bucaramanga, Santander',
  'Pereira, Risaralda',
  'Cúcuta, Norte de Santander',
  'Manizales, Caldas',
  'Ibagué, Tolima',
];
export const MAIN_PLACES: Place[] = MAIN_CITIES.map((label) => ALL_PLACES.find((p) => p.label === label)).filter(Boolean) as Place[];

// Department capitals: listed before other places with the same or a similar name
const CAPITALS = new Set([
  'Armenia, Quindío', 'Santa Marta, Magdalena', 'Villavicencio, Meta', 'Pasto, Nariño', 'Neiva, Huila', 'Montería, Córdoba',
  'Valledupar, Cesar', 'Popayán, Cauca', 'Sincelejo, Sucre', 'Tunja, Boyacá', 'Riohacha, La Guajira', 'Yopal, Casanare',
  'Florencia, Caquetá', 'Quibdó, Chocó', 'Arauca, Arauca', 'Mocoa, Putumayo', 'Leticia, Amazonas', 'San José del Guaviare, Guaviare',
  'Inírida, Guainía', 'Mitú, Vaupés', 'Puerto Carreño, Vichada', 'San Andrés, San Andrés y Providencia',
]);

const SEARCH_INDEX = ALL_PLACES.map((place) => ({ place, city: normalizeText(place.city), label: normalizeText(place.label) }));

/** Municipalities matching what was typed: names that start with it first, then names that contain it. */
export function searchPlaces(query: string, limit = 8): Place[] {
  const q = normalizeText(query);
  if (!q) return MAIN_PLACES.slice(0, limit);
  const starts = SEARCH_INDEX.filter((e) => e.city.startsWith(q) || e.label.startsWith(q));
  const contains = SEARCH_INDEX.filter((e) => !starts.includes(e) && e.label.includes(q));
  // Big cities first among equals ("san" → the well-known ones before the rest)
  const rank = (p: Place) => (MAIN_PLACES.includes(p) ? 0 : CAPITALS.has(p.label) ? 1 : 2);
  return [...starts, ...contains]
    .map((e) => e.place)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}

/**
 * The municipality a stored text refers to: "Medellín, Antioquia", "Medellín", "Bogotá, Colombia"…
 * Names shared by several departments resolve to the main city when there is one, else the first match.
 */
export function findPlace(text?: string): Place | null {
  const q = normalizeText(text || '');
  if (!q) return null;
  const exact = SEARCH_INDEX.find((e) => e.label === q);
  if (exact) return exact.place;
  const cityOnly = normalizeText((text || '').split(',')[0]);
  const matches = SEARCH_INDEX.filter((e) => e.city === cityOnly || e.city === cityOnly.replace(/ d\.?c\.?$/, '') + ' d.c.');
  return (matches.find((e) => MAIN_PLACES.includes(e.place)) || matches.find((e) => CAPITALS.has(e.place.label)) || matches[0])?.place || null;
}

/**
 * The municipality for a text typed (not picked) in a city field: its full label, or a city name
 * that exists in only one department. Ambiguous names ("Armenia") need to be picked from the list.
 */
export function resolveTyped(text: string): Place | null {
  const q = normalizeText(text);
  if (!q) return null;
  const exact = SEARCH_INDEX.find((e) => e.label === q);
  if (exact) return exact.place;
  const sameName = SEARCH_INDEX.filter((e) => e.city === q);
  return sameName.length === 1 ? sameName[0].place : null;
}
