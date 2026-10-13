import { VehicleListing } from '../types';

/** Shown instead of the kilometers when the seller doesn't know them (classics, odometers that rolled over). */
export const MILEAGE_UNKNOWN_LABEL = 'Km no disponible';

/**
 * True when a listing has no trustworthy mileage: the seller said so, or an old vehicle
 * was published with 0 km before that option existed.
 */
export const isMileageUnknown = (car: Pick<VehicleListing, 'mileage' | 'year' | 'mileageUnknown'>) =>
  !!car.mileageUnknown || (car.mileage === 0 && car.year <= new Date().getFullYear() - 20);

/** "35.420 km", or the "not available" label. */
export const mileageLabel = (car: Pick<VehicleListing, 'mileage' | 'year' | 'mileageUnknown'>) =>
  isMileageUnknown(car) ? MILEAGE_UNKNOWN_LABEL : `${car.mileage.toLocaleString('es-CO')} km`;
