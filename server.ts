import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini API client with required header
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper: Call Gemini with fallback models for high demand periods
async function safeGenerateContent(params: any): Promise<any> {
  const ai = getAiClient();
  const modelsToTry = [params.model || "gemini-3.7-flash", "gemini-flash-latest"];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      return await ai.models.generateContent({
        ...params,
        model,
      });
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === "UNAVAILABLE" ||
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("503");

      if (isTransient) {
        continue;
      }
      break;
    }
  }
  throw lastError;
}

// Fallback generator for Vehicle Insights when AI service experiences high demand
function generateFallbackVehicleInsights(vehicle: {
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  engine?: string;
  type?: string;
}) {
  const brand = vehicle.brand || "General";
  const model = vehicle.model || "Vehículo";
  const year = Number(vehicle.year) || 2018;
  const mileage = Number(vehicle.mileage) || 60000;
  const isClassic = year <= 1994 || vehicle.type === "clasico_placas";

  let maintenanceChecklist = [
    {
      item: "Inspección de Pastillas de Freno y Purga con Líquido DOT 4",
      priority: "Alta",
      intervalKm: "Cada 20.000 km",
      reason: `Garantiza frenado óptimo y previene desgaste irregular de discos en ${brand} ${model}.`,
    },
    {
      item: "Juego de Bujías de Iridio / Encendido Calibradas",
      priority: "Media",
      intervalKm: "Cada 40.000 - 50.000 km",
      reason: `Mejora la eficiencia volumétrica, combustión limpia y respuesta del acelerador para el motor ${vehicle.engine || "estándar"}.`,
    },
    {
      item: "Reemplazo de Filtro de Aire de Alto Flujo y Filtro de Cabina",
      priority: "Preventiva",
      intervalKm: "Cada 15.000 km",
      reason: "Protege los sensores MAF/MAP y mantiene la calidad del aire en cabina.",
    },
  ];

  if (mileage >= 80000) {
    maintenanceChecklist.unshift({
      item: "Kit de Distribución / Bomba de Agua y Correa de Accesorios",
      priority: "Alta",
      intervalKm: "80.000 - 100.000 km",
      reason: `Previene desincronización de válvulas y sobrecalentamiento crítico característico de la etapa de kilometraje.`,
    });
  }

  let commonKnownIssues = [
    {
      issue: "Desgaste en bujes de tijera y bieletas de barra estabilizadora",
      symptom: "Golpeteo seco o crujido al pasar por desniveles o giros cerrados.",
      prevention: "Revisar silentblocks y engrasar terminales en cada rotación de neumáticos.",
    },
    {
      issue: "Acumulación de carbonilla en cuerpo de aceleración y válvulas",
      symptom: "Ralentí inestable o ligera pérdida de potencia en recuperaciones.",
      prevention: "Limpieza ultrasónica del cuerpo y uso de aditivo limpiador de inyectores cada 10.000 km.",
    },
  ];

  if (isClassic) {
    maintenanceChecklist = [
      {
        item: "Ajuste de Carburador / Sincronización y Puntos de Encendido",
        priority: "Alta",
        intervalKm: "Cada 5.000 km",
        reason: `Mantiene la mezcla aire/combustible estequiométrica y conserva la originalidad del motor clásico.`,
      },
      {
        item: "Engrase de Terminales de Dirección y Crucetas de Cardán",
        priority: "Alta",
        intervalKm: "Cada 10.000 km",
        reason: "Evita holguras mecánicas y desgaste prematuro de piezas difíciles de conseguir.",
      },
      {
        item: "Inspección de Mangueras de Refrigerante y Termostato Original",
        priority: "Media",
        intervalKm: "Cada 15.000 km",
        reason: "Previene roturas por fatiga de caucho en vehículos de más de 30 años.",
      },
    ];

    commonKnownIssues = [
      {
        issue: "Corrosión y fatiga en pasos de rueda y zócalos inferiores",
        symptom: "Burbujas en la pintura o acumulación de óxido en puntos de desagüe.",
        prevention: "Aplicación de cera para cavidades (anti-rust cavity wax) y limpieza periódica de drenajes.",
      },
      {
        issue: "Resequedad en empaquetaduras y retenes de cigüeñal",
        symptom: "Pequeñas gotas de aceite tras estacionar varios días.",
        prevention: "Uso de aceites minerales o semisintéticos con aditivo acondicionador de sellos.",
      },
    ];
  }

  return {
    summary: `${brand} ${model} (${year}) con ${mileage.toLocaleString()} km se encuentra en ${
      isClassic
        ? "etapa de preservación histórica. Requiere mantenimiento preventivo enfocado en originalidad mecánica y protección anticorrosiva."
        : mileage > 100000
        ? "etapa de alto kilometraje. Se recomienda especial atención a elementos de suspensión, refrigeración y fluidos de transmisión."
        : "etapa óptima de rendimiento. Requiere servicios periódicos de fluidos, bujías y filtros para conservar su valor de reventa."
    }`,
    maintenanceChecklist,
    commonKnownIssues,
    recommendedCareAndDetailing: [
      {
        area: "Pintura exterior",
        recommendation: "Sellador cerámico SiO2 o cera de carnauba pura para proteger el barniz de rayos UV y lluvia ácida.",
      },
      {
        area: "Motor",
        recommendation: isClassic
          ? "Tratamiento antifricción con zinc/ZDDP para protección de árboles de levas planos."
          : "Aceite sintético con aditivo antifricción de molibdeno o cerámica líquida.",
      },
      {
        area: "Interior",
        recommendation: "Nutridor hidrofóbico para cueros y acondicionador mate con filtro UV para el tablero.",
      },
    ],
    estimatedMarketRange: isClassic
      ? "Vehículo con alta tendencia a la valorización y potencial de exhibición."
      : "Conservación de valor estable con historial de mantenimiento al día y repuestos de intermediación certificada.",
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "MiGaraje", timestamp: new Date().toISOString() });
});

// Endpoint: Vehicle Insights & AI Recommendations based on registered vehicle
app.post("/api/gemini/vehicle-insights", async (req, res) => {
  const { brand, model, year, mileage, engine, type, state } = req.body;

  try {
    const prompt = `Actúa como el experto automotriz en jefe de MiGaraje.
Analiza este vehículo registrado por el usuario:
- Marca: ${brand || "General"}
- Modelo: ${model || "General"}
- Año: ${year || "2018"}
- Kilometraje: ${mileage || 80000} km
- Motor / Versión: ${engine || "Gasolina"}
- Tipo / Condición: ${type || "Uso Diario"} (${state || "Operativo"})

Proporciona un diagnóstico y recomendaciones personalizadas, altamente prácticas y específicas para este modelo exacto en español en formato JSON.`;

    const response = await safeGenerateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres un ingeniero automotriz y consultor de talleres mecánicos de élite de MiGaraje en español. Devuelve siempre un JSON estructurado y riguroso sobre repuestos, mantenimiento por kilometraje, fallas conocidas del modelo y consejos de cuidado.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Resumen ejecutivo del estado del auto y su etapa según año y kilometraje.",
            },
            maintenanceChecklist: {
              type: Type.ARRAY,
              description: "Tareas de mantenimiento recomendadas a este kilometraje exacto.",
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING, description: "Componente o servicio (ej: Kit de distribución, cambio de líquido de frenos DOT4)" },
                  priority: { type: Type.STRING, description: "Alta, Media o Preventiva" },
                  intervalKm: { type: Type.STRING, description: "Intervalo recomendado" },
                  reason: { type: Type.STRING, description: "Por qué es crucial para este modelo" },
                },
                required: ["item", "priority", "reason"],
              },
            },
            commonKnownIssues: {
              type: Type.ARRAY,
              description: "Puntos débiles o fallas comunes reportadas por la comunidad de dueños de este modelo.",
              items: {
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING, description: "Descripción de la falla típica" },
                  symptom: { type: Type.STRING, description: "Síntoma o ruido característico" },
                  prevention: { type: Type.STRING, description: "Cómo prevenirlo o qué repuesto anticipar" },
                },
                required: ["issue", "symptom", "prevention"],
              },
            },
            recommendedCareAndDetailing: {
              type: Type.ARRAY,
              description: "Consejos específicos de cuidado estético y aditivos de motor según la edad del vehículo.",
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING, description: "Motor, Pintura exterior, Interior o Chasis" },
                  recommendation: { type: Type.STRING, description: "Producto o técnica recomendada" },
                },
                required: ["area", "recommendation"],
              },
            },
            estimatedMarketRange: {
              type: Type.STRING,
              description: "Rango de apreciación o depreciación y consejo de reventa/conservación.",
            },
          },
          required: ["summary", "maintenanceChecklist", "commonKnownIssues", "recommendedCareAndDetailing"],
        },
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (_error: any) {
    const fallbackData = generateFallbackVehicleInsights({ brand, model, year, mileage, engine, type });
    res.json({
      success: true,
      data: fallbackData,
      isFallback: true,
    });
  }
});

// Endpoint: AI Automotive Mechanic & Restoration Chat Assistant
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, activeVehicle, conversationHistory } = req.body;

    let vehicleContext = "No hay vehículo seleccionado actualmente.";
    if (activeVehicle) {
      vehicleContext = `Vehículo actual del usuario: ${activeVehicle.brand} ${activeVehicle.model} ${activeVehicle.year} (${activeVehicle.mileage} km, motor ${activeVehicle.engine || "Estándar"}, Tipo: ${activeVehicle.type || "Estándar"}).`;
    }

    const historyFormatted = Array.isArray(conversationHistory)
      ? conversationHistory.map((m: any) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`).join("\n")
      : "";

    const prompt = `Contexto del Garaje del Usuario:
${vehicleContext}

Historial reciente:
${historyFormatted}

Pregunta o consulta del usuario:
"${message}"

Responde como un Asesor Técnico Automotriz experto de MiGaraje. Sé conciso, profesional, muy claro y útil. Da consejos sobre mecánica, repuestos compatibles, productos de cuidado estético/motor, viabilidad de restauración de clásicos o soluciones a fallas comunes.`;

    const response = await safeGenerateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres el Asistente Técnico y Mecánico Inteligente de MiGaraje. Ayudas a los usuarios con diagnósticos preliminares, recomendaciones de repuestos, consejos de compra/venta, restauración de clásicos y mantenimiento preventivo.",
        temperature: 0.7,
      },
    });

    res.json({ success: true, reply: response.text || "No pude generar una respuesta en este momento." });
  } catch (_error: any) {
    res.json({
      success: true,
      reply: `Como asistente técnico de MiGaraje, te recomiendo revisar los intervalos de cambio de fluidos y filtros correspondientes al kilometraje de tu vehículo en la pestaña de Recomendaciones Inteligentes, o consultar la compatibilidad en el marketplace de repuestos certificados.`,
    });
  }
});

// Endpoint: AI Restoration Project Evaluator
app.post("/api/gemini/restoration-advisor", async (req, res) => {
  const { brand, model, year, bodyCondition, engineCondition, interiorCondition, hasOriginalParts, hasClassicPlates } = req.body;

  try {
    const prompt = `Evalúa la viabilidad y rentabilidad de restaurar este vehículo clásico / proyecto:
- Vehículo: ${year} ${brand} ${model}
- Estado de carrocería/óxido: ${bodyCondition || "Moderado"}
- Estado del motor/mecánica: ${engineCondition || "Requiere ajuste"}
- Estado de tapicería/interior: ${interiorCondition || "Deteriorado"}
- Disponibilidad de repuestos originales: ${hasOriginalParts || "Parcial"}
- Aspira a o tiene Placa de Antiguo: ${hasClassicPlates ? "Sí (Certificado o en trámite)" : "No"}

Devuelve un análisis técnico y financiero de restauración en formato JSON.`;

    const response = await safeGenerateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres un perito y restaurador automotriz de clásicos certificado internacionalmente de MiGaraje. Evalúas proyectos de restauración de manera realista en español.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restorationViabilityScore: {
              type: Type.NUMBER,
              description: "Puntuación de viabilidad del 1 al 100",
            },
            difficultyLevel: {
              type: Type.STRING,
              description: "Bajo, Medio, Alto o Proyecto Extremo para Maestros",
            },
            potentialClassicPlateEligibility: {
              type: Type.STRING,
              description: "Probabilidad de calificar para placa de antiguo (mínimo 85-90% originalidad, 30+ años) y qué falta",
            },
            estimatedBudgetRangeUSD: {
              type: Type.STRING,
              description: "Rango estimado en USD para restauración completa a nivel exhibición o calle",
            },
            estimatedValueAfterRestorationUSD: {
              type: Type.STRING,
              description: "Valor estimado de mercado del vehículo una vez restaurado en USD",
            },
            recommendedPhases: {
              type: Type.ARRAY,
              description: "Fases recomendadas de restauración",
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: "Nombre de la fase (ej: Desarmado y Chapería, Mecánica mayor)" },
                  keyTasks: { type: Type.STRING, description: "Tareas principales y repuestos críticos" },
                  difficulty: { type: Type.STRING, description: "Complejidad" },
                },
                required: ["phase", "keyTasks"],
              },
            },
            expertTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Consejos clave para no perder dinero ni originalidad en este modelo.",
            },
          },
          required: [
            "restorationViabilityScore",
            "difficultyLevel",
            "potentialClassicPlateEligibility",
            "estimatedBudgetRangeUSD",
            "estimatedValueAfterRestorationUSD",
            "recommendedPhases",
            "expertTips",
          ],
        },
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (_error: any) {
    const fallbackAssessment = {
      restorationViabilityScore: 82,
      difficultyLevel: "Medio - Requiere paciencia en chapistería",
      potentialClassicPlateEligibility: (Number(year) <= 1994) 
        ? "Alta (85%+ de probabilidad). Cumple con la antigüedad mínima de 30 años para peritaje de federación."
        : "Media-Baja. Aún no cumple los 30 años reglamentarios, pero califica como futuro clásico coleccionable.",
      estimatedBudgetRangeUSD: "$4,500 - $7,800 USD",
      estimatedValueAfterRestorationUSD: "$12,000 - $18,500 USD",
      recommendedPhases: [
        {
          phase: "Fase 1: Desarmado, chorreado de arena y tratamiento de chapa",
          keyTasks: "Erradicación de óxido estructural, soldadura en pisos y aplicación de fondo epóxico anticorrosivo.",
          difficulty: "Alta",
        },
        {
          phase: "Fase 2: Reconstrucción de motor, carburador y sistema eléctrico",
          keyTasks: "Reemplazo de retenes, rectificación de culata/bloque y restauración de arnés eléctrico a 12V.",
          difficulty: "Media",
        },
        {
          phase: "Fase 3: Pintura original y tapicería de época",
          keyTasks: "Aplicación de color de catálogo oficial y tapizado con materiales y patrones originales.",
          difficulty: "Media",
        },
      ],
      expertTips: [
        "Prioriza siempre conservar el motor y transmisión original con sus números de serie coincidentes (matching numbers).",
        "Documenta fotográficamente cada paso del proceso; los clubes y peritos de placas de antiguo valoran enormemente el archivo de restauración.",
        "Busca repuestos originales NOS (New Old Stock) a través de nuestra red de tiendas intermediadas en MiGaraje.",
      ],
    };

    res.json({
      success: true,
      data: fallbackAssessment,
      isFallback: true,
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MiGaraje server running on port ${PORT}`);
  });
}

startServer();
