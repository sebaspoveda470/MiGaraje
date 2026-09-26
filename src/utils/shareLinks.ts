// Deep links: ?vehiculo=<id>, ?producto=<id>, ?comunidad=<id>
export type DeepLinkType = 'vehiculo' | 'producto' | 'comunidad';

export interface DeepLink {
  type: DeepLinkType;
  id: string;
}

const TYPES: DeepLinkType[] = ['vehiculo', 'producto', 'comunidad'];

export const TAB_FOR_LINK: Record<DeepLinkType, string> = {
  vehiculo: 'vehiculos',
  producto: 'productos',
  comunidad: 'comunidades',
};

export function readDeepLink(): DeepLink | null {
  const params = new URLSearchParams(window.location.search);
  for (const type of TYPES) {
    const id = params.get(type);
    if (id) return { type, id };
  }
  return null;
}

export function buildShareUrl(type: DeepLinkType, id: string): string {
  return `${window.location.origin}/?${type}=${encodeURIComponent(id)}`;
}

/**
 * Mirrors the open item in the address bar (without adding history entries),
 * so copying the URL or reloading keeps the same item open. Pass null to clear.
 */
export function syncDeepLink(link: DeepLink | null): void {
  const url = link ? `/?${link.type}=${encodeURIComponent(link.id)}` : '/';
  if (window.location.pathname + window.location.search !== url) {
    window.history.replaceState(null, '', url);
  }
}
