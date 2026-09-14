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
  sellerName: string;
  sellerType: 'particular' | 'tienda_aliada' | 'coleccionista';
  sellerPhone: string;
  sellerVerified: boolean;
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
}

export interface CommunityClub {
  id: string;
  name: string;
  brand: string;
  models: string[];
  description: string;
  membersCount: number;
  postsCount: number;
  logo: string;
  coverImage: string;
  rules: string[];
  category: 'marca' | 'clasicos' | 'offroad' | 'rendimiento';
  recommendedTips?: string[];
  recommendedWorkshops?: Array<{
    id: string;
    name: string;
    location: string;
    phone: string;
    rating: number;
    reviewsCount: number;
    specialty: string;
  }>;
}

export type BrandCommunity = CommunityClub;

export interface PostComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  vehicle?: string;
  authorCar?: string;
  content: string;
  createdAt: string;
  likes?: number;
  isVerifiedExpert?: boolean;
  isExpertAnswer?: boolean;
}

export interface CommunityPost {
  id: string;
  clubId?: string;
  clubName?: string;
  authorName: string;
  authorAvatar: string;
  authorCar?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  authorBadge?: string;
  title: string;
  content: string;
  category: 'discusion' | 'brico_diy' | 'falla_solucionada' | 'recomendacion' | 'evento_ruta' | 'mecanica' | 'repuestos' | 'bricos_detailing' | 'eventos' | 'compra_venta' | string;
  likes: number;
  likedByMe?: boolean;
  commentsCount: number;
  createdAt: string;
  hasSolution?: boolean;
  images?: string[];
  tags?: string[];
  comments: PostComment[];
  specificModelTag?: string;
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
}

export interface CheckoutOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  intermediationFee: number;
  total: number;
  currency: string;
  paymentMethod: 'tarjeta' | 'pse_transferencia' | 'contraentrega_custodia';
  paymentStatus: 'aprobado' | 'pendiente' | 'en_custodia';
  orderStatus: 'confirmada' | 'en_preparacion' | 'despachada' | 'entregada';
  trackingNumber: string;
  warrantyProtected: boolean;
  createdAt: string;
  storeNames: string[];
}


