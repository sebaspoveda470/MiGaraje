import { VehicleInsight, RestorationAnalysis } from '../types';

/**
 * Intelligent client-side fallback provider for AI Mechanic Chat.
 * Ensures the chat works seamlessly on static hosts like Vercel even when no custom Express backend is running.
 */
export function getClientChatResponse(
  message: string,
  vehicle: {
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
  } | null
): string {
  const q = message.toLowerCase();
  const vStr = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year || ''})` : 'tu vehículo';

  if (q.includes('ruido') || q.includes('chillido') || q.includes('freno') || q.includes('pastilla')) {
    return `Para ${vStr}, los ruidos o chillidos al frenar habitualmente indican desgaste en las pastillas (alcanzando el avisador metálico) o cristalización de los discos de freno por temperatura. Te recomendamos inspeccionar el espesor del ferodo en una tienda aliada de MiGaraje. Si el espesor es menor a 3mm, es momento de cambiarlas con repuestos certificados.`;
  }

  if (q.includes('aceite') || q.includes('viscosidad') || q.includes('lubricante') || q.includes('sintetico')) {
    return `Para ${vStr}, el lubricante recomendado depende del kilometraje y especificaciones OEM. Para motores modernos sugerimos aceites 100% sintéticos (5W-30 o 0W-20 con certificación API SP / ILSAC GF-6). Si tu motor supera los 120.000 km, un 5W-40 o 10W-40 de alto rendimiento protege tolerancias térmicas. Puedes encontrar filtros Mann y aceites Liqui Moly o Motul en nuestro marketplace.`;
  }

  if (q.includes('check engine') || q.includes('testigo') || q.includes('scanner') || q.includes('obd')) {
    return `El testigo de Check Engine en ${vStr} almacena códigos de falla DTC. Los más comunes son P0420 (eficiencia de catalizador), P0300 (fallas de encendido / bujías) o fallas en el sensor de oxígeno / MAF. Te sugerimos escanear con un conector OBD-II antes de cambiar piezas a ciegas.`;
  }

  if (q.includes('repuesto') || q.includes('precio') || q.includes('cotizar') || q.includes('comprar')) {
    return `En MiGaraje contamos con más de 80 tiendas aliadas con garantía certificada y peritaje. Puedes explorar la pestaña "Repuestos" para filtrar por la marca y modelo de tu vehículo, o solicitar una cotización especial con el número de chasis (VIN).`;
  }

  if (q.includes('restaur') || q.includes('clasico') || q.includes('placa') || q.includes('antiguo')) {
    return `Para proyectos de restauración y homologación de placas de antiguo en Colombia, el vehículo debe tener más de 35 años y conservar al menos el 75%-85% de originalidad (motor matching numbers, lámina, pintura de catálogo y arnés eléctrico). Puedes evaluar tu proyecto en la pestaña "Clásicos & Clubes".`;
  }

  return `Entendido. Como perito automotriz de MiGaraje para ${vStr}, te recomiendo realizar mantenimientos preventivos cada 5.000 o 10.000 km según tu pauta de servicio. Si necesitas repuestos originales (frenos, kit de embrague, suspensión o afinamiento), puedes consultar nuestras tiendas aliadas verificadas con garantía de satisfacción.`;
}

/**
 * Intelligent client-side fallback provider for Smart Vehicle Insights conforming to VehicleInsight type.
 */
export function getClientVehicleInsights(vehicle: {
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  engine?: string;
  type?: string;
}): VehicleInsight {
  const brand = vehicle.brand || 'Vehículo';
  const model = vehicle.model || 'Estándar';
  const year = Number(vehicle.year) || 2019;
  const mileage = Number(vehicle.mileage) || 50000;

  const maintenanceChecklist = [
    {
      item: 'Inspección de Pastillas de Freno y Líquido DOT 4',
      priority: 'Alta' as const,
      intervalKm: 'Cada 20.000 km',
      reason: `Garantiza frenado óptimo y previene desgaste irregular de discos en ${brand} ${model}.`,
    },
    {
      item: 'Juego de Bujías de Iridio / Encendido Calibradas',
      priority: 'Media' as const,
      intervalKm: 'Cada 40.000 - 50.000 km',
      reason: 'Mejora la eficiencia volumétrica, combustión limpia y respuesta del acelerador.',
    },
    {
      item: 'Reemplazo de Filtro de Aire de Alto Flujo y Filtro de Cabina',
      priority: 'Preventiva' as const,
      intervalKm: 'Cada 15.000 km',
      reason: 'Protege los sensores MAF/MAP y mantiene la pureza del aire en cabina.',
    },
  ];

  if (mileage >= 80000) {
    maintenanceChecklist.unshift({
      item: 'Kit de Distribución / Bomba de Agua y Correa de Accesorios',
      priority: 'Alta' as const,
      intervalKm: 'Cada 80.000 - 100.000 km',
      reason: 'Previene colisiones críticas de válvulas con pistones en motores de interferencia.',
    });
  }

  return {
    summary: `Diagnóstico y pauta de servicio preventiva recomendada para ${brand} ${model} modelo ${year} con ${mileage.toLocaleString()} km.`,
    maintenanceChecklist,
    commonKnownIssues: [
      {
        issue: 'Desgaste prematuro en silentblocks de tijera',
        symptom: 'Golpeteo seco al pasar por baches a baja velocidad',
        prevention: 'Revisión y lubricación de bujes de suspensión en cada rotación de llantas.',
      },
      {
        issue: 'Acumulación de carbonilla en cuerpo de aceleración',
        symptom: 'Ralentí inestable o fluctuante con aire acondicionado',
        prevention: 'Limpieza con aerosol específico para mariposa cada 25.000 km.',
      },
    ],
    recommendedCareAndDetailing: [
      {
        area: 'Pintura y Carrocería',
        recommendation: 'Descontaminado con barra de arcilla (clay bar) y sellado cerámico SiO2 para protección UV.',
      },
      {
        area: 'Habitáculo & Tapicería',
        recommendation: 'Limpieza y nutrición de cuero con protector contra rayos ultravioleta.',
      },
    ],
    estimatedMarketRange: '$35.000.000 - $48.000.000 COP',
  };
}

/**
 * Intelligent client-side fallback provider for Restoration Analysis conforming to RestorationAnalysis type.
 */
export function getClientRestorationAnalysis(car: {
  brand: string;
  model: string;
  year: number;
}): RestorationAnalysis {
  const isClassicEligible = Number(car.year) <= 1991;
  return {
    restorationViabilityScore: isClassicEligible ? 86 : 74,
    difficultyLevel: 'Media - Intermedia',
    potentialClassicPlateEligibility: isClassicEligible
      ? 'Alta (Cumple criterio de antigüedad superior a 35 años)'
      : 'En proceso (Vehículo con potencial de colección futuro)',
    estimatedBudgetRangeUSD: '$4.500 - $8.000 USD ($18.000.000 - $32.000.000 COP)',
    estimatedValueAfterRestorationUSD: '$12.000 - $22.000 USD',
    recommendedPhases: [
      {
        phase: 'Fase 1: Desarme, sandblasting y restauración de lámina y chasis',
        keyTasks: 'Remoción de óxido, cuadre de líneas de carrocería y tratamiento anticorrosivo epóxico.',
        difficulty: 'Alta',
      },
      {
        phase: 'Fase 2: Reconstrucción de motor, carburador y sistema eléctrico',
        keyTasks: 'Reemplazo de retenes, rectificación de culata/bloque y restauración de arnés eléctrico a 12V.',
        difficulty: 'Media',
      },
      {
        phase: 'Fase 3: Pintura original de catálogo y tapicería de época',
        keyTasks: 'Aplicación de tono de catálogo oficial con tapizado en materiales originales de fábrica.',
        difficulty: 'Media',
      },
    ],
    expertTips: [
      'Conserva siempre el motor y transmisión original con números de serie coincidentes (matching numbers).',
      'Documenta fotográficamente cada etapa para el peritaje de placas de clásico y antiguo.',
      'Utiliza la red de tiendas de MiGaraje para ubicar repuestos NOS (New Old Stock).',
    ],
  };
}
