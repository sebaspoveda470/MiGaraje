export type VehicleCategory = 'diario' | 'clasico_placas' | 'proyecto_restauracion' | 'deportivo' | 'camioneta';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  version?: string;
  engine?: string;
  mileage: number;
  plate?: string;
  vin?: string;
  image?: string;
  type: VehicleCategory;
  transmission: 'Manual' | 'Automática' | 'Secuencial';
  fuelType: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
  hasClassicPlates?: boolean;
  notes?: string;
  dateAdded: string;
  /** Expiry dates as YYYY-MM-DD */
  soatExpiry?: string;
  tecnoExpiry?: string;
}

export type PartCategory = 
  | 'todos'
  | 'frenos' 
  | 'motor' 
  | 'suspension' 
  | 'filtracion' 
  | 'electrico' 
  | 'transmision' 
  | 'carroceria' 
  | 'refrigeracion';

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  category: PartCategory;
  brand: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  storeId: string;
  storeName: string;
  storeRating: number;
  storeVerified: boolean;
  storeLocation: string;
  description: string;
  compatibleBrands: string[];
  compatibleModels: string[];
  compatibleYears: [number, number];
  image: string;
  warrantyMonths: number;
  isOem: boolean;
  shippingDays: number;
  features: string[];
}

export interface VehicleListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  condition: 'usado' | 'seminuevo' | 'clasico_antiguo' | 'para_restaurar';
  location: string;
  city?: string;
  plateEnding?: string;
  plateCity?: string;
  isUniqueOwner?: boolean;
  isInsurable?: boolean;
  soatValid?: boolean;
  tecnoValid?: boolean;
  sellerName: string;
  sellerType: 'particular' | 'tienda_aliada' | 'coleccionista';
  sellerPhone: string;
  sellerVerified: boolean;
  whatsappNumber?: string;
  images: string[];
  specs: {
    engine: string;
    transmission: string;
    fuel: string;
    horsepower: number;
    color: string;
    doors: number;
  };
  isClassicPlate: boolean;
  restorationPotential?: {
    difficulty: 'Fácil' | 'Intermedio' | 'Avanzado' | 'Experto';
    completeness: number; // percentage
    bodyworkStatus: string;
    engineStatus: string;
    estimatedCost: string;
  };
  description: string;
  tags: string[];
  intermediationProtected: boolean;
  publishedAt: string;
  ownerId?: string;
  createdAt?: number;
  /** Missing on older listings, which count as available */
  status?: 'disponible' | 'vendido';
  /** Total photos: `images` holds the cover, the rest live in vehicleListings/{id}/photos */
  photoCount?: number;
}

export type CareCategory = 'exterior' | 'interior' | 'motor_aditivos' | 'herramientas';

export interface CareProduct {
  id: string;
  name: string;
  brand: string;
  category: CareCategory;
  subcategory: string;
  price: number;
  rating: number;
  reviewsCount: number;
  description: string;
  volume: string;
  applicationGuide: string[];
  benefits: string[];
  image: string;
  inStock: boolean;
  idealFor: string[];
  whatsappNumber?: string;
  createdAt?: number;
  /** All photos, main one first. `image` mirrors images[0] for older code paths. */
  images?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  /** Set when the reviewer ordered this product through the cart */
  orderId?: string;
  createdAt: number;
  updatedAt?: number;
}

export type MiGarajeProduct = CareProduct;

export type CommunityCategory = 'marca' | 'clasicos' | 'offroad' | 'rendimiento' | 'region';

export interface CommunityClub {
  id: string;
  name: string;
  brand: string;
  models: string[];
  description: string;
  logo: string;
  coverImage?: string;
  rules: string[];
  category: CommunityCategory;
  recommendedTips?: string[];
  /** uids of the users who joined */
  memberIds: string[];
  createdBy?: string;
  createdAt?: number;
}

export type BrandCommunity = CommunityClub;

export type PostCategory = 'fallas' | 'mantenimiento' | 'modificaciones' | 'rutas' | 'general';

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorCar?: string;
  content: string;
  createdAt: number;
}

export interface CommunityPost {
  id: string;
  clubId: string;
  authorId: string;
  authorName: string;
  authorCar?: string;
  title: string;
  content: string;
  category: PostCategory;
  modelTag?: string;
  likedBy: string[];
  commentsCount: number;
  createdAt: number;
}

export interface VehicleInsight {
  summary: string;
  maintenanceChecklist: Array<{
    item: string;
    priority: 'Alta' | 'Media' | 'Preventiva' | string;
    intervalKm?: string;
    reason: string;
  }>;
  commonKnownIssues: Array<{
    issue: string;
    symptom: string;
    prevention: string;
  }>;
  recommendedCareAndDetailing: Array<{
    area: string;
    recommendation: string;
  }>;
  estimatedMarketRange?: string;
}

export interface RestorationAnalysis {
  restorationViabilityScore: number;
  difficultyLevel: string;
  potentialClassicPlateEligibility: string;
  estimatedBudgetRangeUSD: string;
  estimatedValueAfterRestorationUSD: string;
  recommendedPhases: Array<{
    phase: string;
    keyTasks: string;
    difficulty?: string;
  }>;
  expertTips: string[];
}

export interface CartItem {
  type: 'repuesto' | 'cuidado';
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
  storeName?: string;
  warrantyMonths?: number;
}

export interface PartnerStore {
  id: string;
  commercialName: string;
  taxId?: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  specialties: string[];
  brands: string[];
  rating: number;
  verified: boolean;
  commissionRate: number; // e.g. 5% o 8% por intermediación
  bankAccount?: string;
  status: 'activa' | 'revision' | 'destacada';
  logoUrl?: string;
  description?: string;
  createdAt: string;
  catalogCount?: number;
  ownerId?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  avatar?: string;
  role?: 'propietario' | 'entusiasta' | 'coleccionista' | 'mecanico' | 'tienda_aliada';
  joinedDate: string;
  /** When the user authorized data processing and accepted the terms (Ley 1581) */
  acceptedTermsAt?: string;
  /** SOAT / tecnomecánica reminders by email (on unless the user turns them off) */
  emailReminders?: boolean;
  favoriteListings?: string[];
  favoriteProducts?: string[];
}

export interface CheckoutOrder {
  id: string;
  orderNumber: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: CartItem[];
  /** Ids of the ordered products, so reviews can reference the order */
  productIds: string[];
  total: number;
  currency: 'COP';
  status: 'pendiente' | 'confirmada' | 'despachada' | 'entregada' | 'cancelada';
  createdAt: number;
}
