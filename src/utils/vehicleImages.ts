// Comprehensive Automotive Reference Image Engine for MiGaraje

export interface VehicleImageOption {
  url: string;
  label: string;
  tag?: string;
}

// Curated high-resolution vehicle database mapped by Model / Brand keywords
const MODEL_IMAGE_DATABASE: Array<{
  brandPattern: RegExp;
  modelPattern: RegExp;
  yearMin?: number;
  yearMax?: number;
  primaryImage: string;
  options?: VehicleImageOption[];
}> = [
  // MAZDA
  {
    brandPattern: /mazda/i,
    modelPattern: /miata|mx-?5/i,
    primaryImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', label: 'Rojo Soul Crystal', tag: 'ND Deportivo' },
      { url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80', label: 'Gris Grafito', tag: 'RF Targa' },
    ]
  },
  {
    brandPattern: /mazda/i,
    modelPattern: /3|tres|mazda3/i,
    primaryImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', label: 'Gris Polymetal', tag: 'Hatchback' },
      { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', label: 'Rojo Metálico', tag: 'Sedán' },
    ]
  },
  {
    brandPattern: /mazda/i,
    modelPattern: /cx-?30|cx-?5|cx-?50|cx-?9|cx-?60|cx-?90/i,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', label: 'Gris Titanio', tag: 'SUV 4x4' },
      { url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', label: 'Azul Noche', tag: 'Grand Touring' },
    ]
  },
  {
    brandPattern: /mazda/i,
    modelPattern: /rx-?7|rx-?8|rotativo|323|allegro/i,
    primaryImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
  },

  // TOYOTA
  {
    brandPattern: /toyota/i,
    modelPattern: /fj40|fj70|machito|land cruiser|prado|4runner/i,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', label: 'Beige Arena / Clásico', tag: '4x4 Offroad' },
      { url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80', label: 'Blanco Perla', tag: 'Prado TXL' },
    ]
  },
  {
    brandPattern: /toyota/i,
    modelPattern: /hilux|tacoma|tundra/i,
    primaryImage: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80', label: 'Gris Metálico', tag: 'Doble Cabina' },
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', label: 'Negro Ébano', tag: 'GR-Sport' },
    ]
  },
  {
    brandPattern: /toyota/i,
    modelPattern: /corolla|yaris|etios|avalon|camry/i,
    primaryImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80', label: 'Azul Cosmo', tag: 'Sedán' },
      { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', label: 'Plata Glaciar', tag: 'Híbrido' },
    ]
  },
  {
    brandPattern: /toyota/i,
    modelPattern: /supra|gr86|gt86|celica|mr2/i,
    primaryImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80', label: 'Amarillo Nitro', tag: 'GR Sport' },
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', label: 'Rojo Racing', tag: 'Bi-Turbo' },
    ]
  },

  // FORD
  {
    brandPattern: /ford/i,
    modelPattern: /mustang|shelby|mach-?e|fastback|hardtop/i,
    primaryImage: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80', label: 'Rojo Cherry', tag: 'GT 5.0 V8' },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', label: 'Azul Grabber', tag: 'Mach 1' },
      { url: 'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80', label: 'Negro Shadow', tag: 'Shelby GT350' },
    ]
  },
  {
    brandPattern: /ford/i,
    modelPattern: /ranger|f-?150|f-?100|raptor|bronco/i,
    primaryImage: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80', label: 'Gris Cemento', tag: '4x4 Raptor' },
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', label: 'Azul Cyber', tag: 'Bronco Badlands' },
    ]
  },
  {
    brandPattern: /ford/i,
    modelPattern: /fiesta|focus|st|rs|mondeo|fusion/i,
    primaryImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
  },

  // BMW
  {
    brandPattern: /bmw/i,
    modelPattern: /e30|e36|e46|2002|clasico/i,
    primaryImage: 'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80', label: 'Azul Alpina', tag: 'E30 / E46 Clásico' },
      { url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', label: 'Plata Metálico', tag: 'Serie 3' },
    ]
  },
  {
    brandPattern: /bmw/i,
    modelPattern: /serie 3|serie 4|serie 1|serie 2|m3|m4|m2|g20/i,
    primaryImage: 'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80', label: 'Azul Portimao', tag: 'M Sport' },
      { url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80', label: 'Gris Brooklyn', tag: 'M3 Competition' },
    ]
  },
  {
    brandPattern: /bmw/i,
    modelPattern: /x1|x3|x5|x6|x7|m-?sport/i,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
  },

  // CHEVROLET
  {
    brandPattern: /chevrolet|chevy/i,
    modelPattern: /camaro|corvette|chevelle|ss|stingray/i,
    primaryImage: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', label: 'Rojo Crush', tag: 'Camaro SS 6.2L' },
      { url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80', label: 'Negro Ónix', tag: 'Corvette C8' },
    ]
  },
  {
    brandPattern: /chevrolet|chevy/i,
    modelPattern: /silverado|c-?10|d-?max|tahoe|suburban/i,
    primaryImage: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    brandPattern: /chevrolet|chevy/i,
    modelPattern: /tracker|cruze|onix|sail|spark|aveo|captiva/i,
    primaryImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', label: 'Plata Metálico', tag: 'Sedán / Compacto' },
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', label: 'Azul Marino', tag: 'Tracker Turbo' },
    ]
  },

  // VOLKSWAGEN
  {
    brandPattern: /volkswagen|vw/i,
    modelPattern: /beetle|escarabajo|vocho|fusca|kombi|microbus|bug/i,
    primaryImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', label: 'Azul Turquesa', tag: 'Clásico Vintage' },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', label: 'Rojo Fresa', tag: 'Escarabajo 1974' },
    ]
  },
  {
    brandPattern: /volkswagen|vw/i,
    modelPattern: /golf|gti|r|gli|jetta|polo|gol|virtus/i,
    primaryImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', label: 'Gris Plomo', tag: 'Golf GTI MK7/8' },
      { url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', label: 'Blanco Puro', tag: 'Jetta / Polo' },
    ]
  },
  {
    brandPattern: /volkswagen|vw/i,
    modelPattern: /amarok|tiguan|taos|teramont|t-?cross/i,
    primaryImage: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
  },

  // MERCEDES-BENZ
  {
    brandPattern: /mercedes|mercedes-benz|amg/i,
    modelPattern: /clase g|g-?wagon|g63|gelandewagen/i,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', label: 'Negro Mate Magno', tag: 'G63 AMG 4x4' },
      { url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', label: 'Plata Iridio', tag: 'Clásico W463' },
    ]
  },
  {
    brandPattern: /mercedes|mercedes-benz|amg/i,
    modelPattern: /clase c|clase a|clase e|clase s|c63|amg gt|c200|c300/i,
    primaryImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', label: 'Plata Diamante', tag: 'Clase C AMG-Line' },
      { url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80', label: 'Gris Selenita', tag: 'C63 V8 Biturbo' },
    ]
  },

  // PORSCHE
  {
    brandPattern: /porsche/i,
    modelPattern: /911|carrera|turbo|gt3|targa|930|964|993|997|991|992/i,
    primaryImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', label: 'Negro Azabache', tag: '911 Carrera S' },
      { url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80', label: 'Azul Shark', tag: '911 GT3 RS' },
    ]
  },
  {
    brandPattern: /porsche/i,
    modelPattern: /cayman|boxster|718|cayenne|macan|panamera|taycan/i,
    primaryImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },

  // NISSAN
  {
    brandPattern: /nissan|datsun/i,
    modelPattern: /gt-?r|370z|350z|240z|300zx|fairlady|silvia|skyline/i,
    primaryImage: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80', label: 'Blanco Bayside', tag: '370Z / GT-R' },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', label: 'Naranja Nismo', tag: '240Z Clásico' },
    ]
  },
  {
    brandPattern: /nissan|datsun/i,
    modelPattern: /frontier|patrol|navara|samurai|x-?trail|kicks|qashqai/i,
    primaryImage: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    brandPattern: /nissan/i,
    modelPattern: /sentra|versa|march|tiida|altima|maxima/i,
    primaryImage: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80',
  },

  // RENAULT
  {
    brandPattern: /renault/i,
    modelPattern: /renault 4|r4|r12|renault 12|clio|sandero|duster|stepway|kwid|logan/i,
    primaryImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', label: 'Naranja Atacama', tag: 'Duster / Stepway 4x4' },
      { url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', label: 'Azul Iron', tag: 'Clio RS / Sandero' },
    ]
  },

  // HONDA
  {
    brandPattern: /honda/i,
    modelPattern: /civic|type-?r|si|s2000|cr-?v|accord|city|fit|hr-?v/i,
    primaryImage: 'https://images.unsplash.com/photo-1605816988069-b11383b50717?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1605816988069-b11383b50717?auto=format&fit=crop&w=1200&q=80', label: 'Blanco Championship', tag: 'Civic VTEC / Type R' },
      { url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80', label: 'Azul Egeo', tag: 'CR-V / Touring' },
    ]
  },

  // JEEP
  {
    brandPattern: /jeep/i,
    modelPattern: /wrangler|rubicon|cherokee|grand cherokee|cj-?5|cj-?7|gladiator|renegade/i,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', label: 'Verde Militar Sarge', tag: 'Wrangler Rubicon 4x4' },
      { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80', label: 'Rojo Firecracker', tag: 'Gladiator Trail-Rated' },
    ]
  },

  // SUBARU
  {
    brandPattern: /subaru/i,
    modelPattern: /wrx|sti|impreza|forester|outback|xv|brz/i,
    primaryImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', label: 'Azul World Rally Blue', tag: 'WRX STI AWD' },
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', label: 'Gris Magnetite', tag: 'Forester Boxer' },
    ]
  },

  // AUDI
  {
    brandPattern: /audi/i,
    modelPattern: /r8|rs|s3|s4|s5|a3|a4|a6|q3|q5|q7|q8|e-?tron/i,
    primaryImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
    options: [
      { url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80', label: 'Gris Nardo', tag: 'RS Quattro' },
      { url: 'https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1200&q=80', label: 'Azul Navarra', tag: 'Sedán Quattro' },
    ]
  },
];

// Fallbacks by Category
const CATEGORY_FALLBACKS: Record<string, string> = {
  deportivo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  camioneta: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
  clasico_placas: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
  proyecto_restauracion: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80',
  diario: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
};

/**
 * Returns a high-resolution model-accurate reference photo for the provided brand, model, and category.
 */
export function getVehicleReferenceImage(
  brand: string,
  model: string,
  year?: number,
  type?: string
): string {
  if (!brand) return CATEGORY_FALLBACKS['diario'];

  const cleanBrand = brand.trim();
  const cleanModel = model ? model.trim() : '';

  // 1. Search in MODEL_IMAGE_DATABASE
  for (const entry of MODEL_IMAGE_DATABASE) {
    if (entry.brandPattern.test(cleanBrand)) {
      if (cleanModel && entry.modelPattern.test(cleanModel)) {
        return entry.primaryImage;
      }
    }
  }

  // 2. Search brand only
  for (const entry of MODEL_IMAGE_DATABASE) {
    if (entry.brandPattern.test(cleanBrand)) {
      return entry.primaryImage;
    }
  }

  // 3. Fallback by Category if available
  if (type && CATEGORY_FALLBACKS[type]) {
    return CATEGORY_FALLBACKS[type];
  }

  return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80';
}

/**
 * Returns alternate angle and color options for the selected brand and model.
 */
export function getVehicleImageOptions(
  brand: string,
  model: string,
  type?: string
): VehicleImageOption[] {
  if (!brand) return [];

  const cleanBrand = brand.trim();
  const cleanModel = model ? model.trim() : '';

  for (const entry of MODEL_IMAGE_DATABASE) {
    if (entry.brandPattern.test(cleanBrand) && cleanModel && entry.modelPattern.test(cleanModel)) {
      if (entry.options && entry.options.length > 0) {
        return entry.options;
      }
      return [
        { url: entry.primaryImage, label: `${cleanBrand} ${cleanModel}`, tag: 'Referencia Original' }
      ];
    }
  }

  // Brand default options
  for (const entry of MODEL_IMAGE_DATABASE) {
    if (entry.brandPattern.test(cleanBrand)) {
      return entry.options || [
        { url: entry.primaryImage, label: `${cleanBrand} Estándar`, tag: 'Referencia Oficial' }
      ];
    }
  }

  return [
    { url: getVehicleReferenceImage(brand, model, undefined, type), label: 'Referencia Automotriz', tag: 'Estándar' }
  ];
}
