// @use(kind)
// @kind(util)

export interface AIGenerationRequest {
  systemPrompt: string;
  schema?: string;
  taskDescription: string;
  userCode: string;
  modelIdentifier?: string;
}

import type { Concept } from '../data/gameState';
import type { VaultDocument } from '../context/VaultContext';

export interface PrestigeRecommendation {
  isEligible: boolean;
  name?: string;
  context?: string;
  icon?: string;
}

export interface AIGenerationResponse {
  feedback: string;
  isCorrect: boolean;
}

export interface GeneratedCurriculum {
  levels: {
    id: string;
    title: string;
    description: string;
    exercises: {
      id: string;
      title: string;
      description: string;
      taskDescription: string;
      xpValue: number;
      dependencies: string[];
    }[];
  }[];
}

interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
}

const getActiveModel = (): AIModelConfig => {
  try {
    const saved = localStorage.getItem('opl_ai_models');
    if (saved) {
      const models = JSON.parse(saved);
      const active = models.find((m: any) => m.isDefault);
      if (active) return active;
    }
  } catch (e) {}
  return { id: 'ollama-local', name: 'llama3', provider: 'Ollama', apiKey: '' };
};

const executePrompt = async (
  endpointType: 'chat' | 'generate',
  promptOrMessages: any,
  options: { format?: 'json' } = {}
): Promise<string> => {
  const modelConfig = getActiveModel();
  
  const callOllama = async (modelName: string) => {
    const url = `http://localhost:11434/api/${endpointType}`;
    const body: any = {
      model: modelName,
      stream: false,
      ...(options.format && { format: options.format })
    };
    if (endpointType === 'chat') {
      body.messages = promptOrMessages;
    } else {
      body.prompt = promptOrMessages;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Ollama API error: ${res.status}`);
    const data = await res.json();
    return endpointType === 'chat' ? (data.message?.content || '') : (data.response || '');
  };

  if (modelConfig.provider === 'OpenRouter' || modelConfig.provider === 'Custom' || modelConfig.provider === 'Gemini') {
    try {
      const messages = endpointType === 'chat' 
        ? promptOrMessages 
        : [{ role: 'user', content: promptOrMessages }];

      let url = 'https://openrouter.ai/api/v1/chat/completions';
      if (modelConfig.provider === 'Custom' && modelConfig.baseUrl) {
        url = `${modelConfig.baseUrl.replace(/\/$/, '')}/chat/completions`;
      } else if (modelConfig.provider === 'Gemini') {
        url = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${modelConfig.apiKey}`
        },
        body: JSON.stringify({
          model: modelConfig.name,
          messages: messages,
          ...(options.format === 'json' && { response_format: { type: "json_object" } })
        }),
      });
      if (!res.ok) throw new Error(`${modelConfig.provider} API error: ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      console.warn(`${modelConfig.provider} API Failed. Fallback to local Ollama llama3...`, e);
      return callOllama('llama3'); // Fallback to local
    }
  } else {
    // Default Ollama
    return callOllama(modelConfig.name);
  }
};

/**
 * Calculates cosine similarity between two vectors.
 */
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Servicio para conectarse al LLM (Ollama / OpenRouter) y evaluar misiones.
 */
export const aiService = {
  async generateEmbedding(text: string): Promise<number[]> {
    const modelConfig = getActiveModel();
    if (modelConfig.provider === 'Ollama') {
      try {
        const res = await fetch('http://localhost:11434/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'nomic-embed-text', // Prefer dedicated embedding model
            prompt: text
          })
        });
        if (res.ok) {
          const data = await res.json();
          return data.embedding;
        } else if (res.status === 404) {
          // Fallback to active model if nomic-embed-text is not installed
          const fallbackRes = await fetch('http://localhost:11434/api/embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: modelConfig.name, 
              prompt: text
            })
          });
          const fallbackData = await fallbackRes.json();
          return fallbackData.embedding;
        }
      } catch (e) {
        console.error('Error generating local embedding:', e);
      }
    } else if (modelConfig.provider === 'Gemini' && modelConfig.apiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${modelConfig.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text: text }] }
          })
        });
        if (res.ok) {
          const data = await res.json();
          return data.embedding.values;
        }
      } catch (e) {
        console.error('Error generating Gemini embedding:', e);
      }
    }
    // Si no es Ollama o falla, por ahora devolvemos un vector vacío o mock.
    // TBD: Añadir endpoints de OpenAI compatibles para OpenRouter
    return new Array(768).fill(0).map(() => Math.random() * 0.1); 
  },

  retrieveRelevantContext(queryEmbedding: number[], documents: VaultDocument[], topK: number = 3): string {
    if (queryEmbedding.length === 0) return "";
    
    // Calcular similitud para cada documento que tenga embedding
    const scoredDocs = documents
      .filter(doc => doc.embedding && doc.embedding.length > 0)
      .map(doc => ({
        doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding!)
      }))
      .sort((a, b) => b.score - a.score);

    // Seleccionar los top K
    const topDocs = scoredDocs.slice(0, topK);
    
    if (topDocs.length === 0) return "";
    
    const contextStr = topDocs.map(d => `--- [Fragmento de ${d.doc.name}] ---\n${d.doc.content}`).join('\n\n');
    return contextStr;
  },

  async generateFeedback(req: AIGenerationRequest): Promise<AIGenerationResponse> {
    const prompt = `
[SYSTEM PROMPT]
${req.systemPrompt}

[MISSION CONTEXT]
Misión: ${req.taskDescription}
Esquema disponible: ${req.schema || 'Ninguno'}

[USER INPUT / CODE]
El jugador ha enviado el siguiente código:
\`\`\`
${req.userCode}
\`\`\`

Eres un MENTOR ITERATIVO SOCRÁTICO. Sigue estas reglas estrictas basadas en el modelo TeachMeUnit:
1. REGLA DE ORO: NUNCA le des la respuesta final en código de inmediato.
2. Diagnóstico de Errores: Si hay un error, identifícalo bajo la estructura (Síntoma -> Causa Lógica -> Solución conceptual).
3. Metáforas: Si el usuario falla en un concepto lógico (ej. orden de ejecución), usa una metáfora del mundo real (como organizar objetos) para explicar POR QUÉ falla, en lugar de solo apuntar al error de sintaxis.
4. Si el código está vacío, dale la bienvenida y preséntale un "Guided Exercise" (Paso a paso con pistas).
5. Si el código es 100% correcto y cumple el criterio de dominio, añade EXACTAMENTE la palabra clave "[CORRECTO]" al final de tu mensaje.
    `.trim();

    try {
      const text = await executePrompt('generate', prompt);
      const isCorrect = text.includes('[CORRECTO]');

      return {
        feedback: text.replace('[CORRECTO]', '').trim(),
        isCorrect
      };
    } catch (error) {
      console.error('Error connecting to AI:', error);
      return {
        feedback: "Error de red: No se pudo conectar a la IA. Asegúrate de tener conexión a internet o Ollama corriendo.",
        isCorrect: false
      };
    }
  },

  async evaluateMissionChat(
    chatHistory: {role: 'user'|'assistant', content: string}[],
    systemPrompt: string,
    taskDescription: string,
    schema?: string,
    _modelIdentifier?: string,
    userNotesContext?: string
  ): Promise<AIGenerationResponse> {
    const historyText = chatHistory.map(m => `${m.role === 'user' ? 'Jugador' : 'Oráculo'}: ${m.content}`).join('\n');
    
    const prompt = `
[SYSTEM PROMPT]
${systemPrompt}

[MISSION CONTEXT]
Misión: ${taskDescription}
Esquema disponible: ${schema || 'Ninguno'}

[HISTORIAL DEL CHAT (Incluyendo el último mensaje del Jugador)]
${historyText}

${userNotesContext ? `[APUNTES DEL ESTUDIANTE]
El estudiante ha creado los siguientes apuntes relacionados con este tema. Analiza si su respuesta demuestra que comprendió estos apuntes, o si está cometiendo errores que contradicen lo que él mismo anotó:
${userNotesContext}` : ''}

Eres un MENTOR ITERATIVO SOCRÁTICO. Evalúa la conversación actual basándote en la regla TeachMeUnit:
1. Si el último mensaje del jugador es código que resuelve correctamente la misión, responde con feedback positivo y DEBES INCLUIR EXACTAMENTE la palabra clave "[CORRECTO]" al final de tu mensaje.
2. Si es código incorrecto, identifica el error bajo la estructura (Síntoma -> Causa Lógica -> Solución conceptual) usando una metáfora. NO le des la respuesta directa.
3. Si el jugador hace una pregunta, respóndele amablemente y guíalo hacia la resolución de la misión.
4. MANTÉN TUS RESPUESTAS CORTAS Y PRECISAS. No te extiendas demasiado.
    `.trim();

    try {
      const text = await executePrompt('generate', prompt);
      const isCorrect = text.includes('[CORRECTO]');

      return {
        feedback: text.replace('[CORRECTO]', '').trim(),
        isCorrect
      };
    } catch (error) {
      console.error('Error connecting to AI:', error);
      return {
        feedback: "Error de red: No se pudo conectar a la IA. Asegúrate de tener conexión a internet o Ollama corriendo.",
        isCorrect: false
      };
    }
  },

  async generateCurriculum(subject: string, diagnosticText: string, studyContext?: string, isPrestige?: boolean): Promise<GeneratedCurriculum> {
    const focusContext = studyContext ? `\nEnfoque y contexto de estudio solicitado: "${studyContext}"\nAdapta todo el contenido, ejemplos y enfoque a este contexto específicamente.` : `\nEnfoque por defecto: Aprender desde cero, adaptando el contenido con micro-tasking y pasos atómicos.`;
    
    const prestigeContext = isPrestige 
      ? `\n¡ATENCIÓN ORÁCULO! Esta es una "CLASE DE PRESTIGIO" (Meta-Materia). El jugador YA DOMINA la sintaxis base. Genera misiones enfocadas EXCLUSIVAMENTE en Arquitectura, Diseño de Sistemas, Patrones de Integración y Casos de Uso Reales complejos. NO ENSEÑES SINTAXIS BÁSICA.`
      : '';

    const prompt = `
Eres el "Game Master" de un RPG de aprendizaje. Tu objetivo es generar un árbol de habilidades (Curriculum) para la materia "${subject}".
El jugador ha realizado una prueba de nivel y ha dado esta respuesta: "${diagnosticText}"
${focusContext}
${prestigeContext}

Basado en el modelo pedagógico TeachMeUnit, diseña un currículo dividido en Módulos (Levels). 
CRÍTICO: Cada Módulo (Level) DEBE contener la cantidad necesaria de Islas/Misiones (exercises) acorde a la complejidad del tema para poder completarlo de forma correcta. No generes solo un ejercicio por módulo si el tema es amplio; divide el conocimiento en 2, 3 o más misiones progresivas dentro de ese mismo nivel.
Para cada "taskDescription" de una misión, no des solo el problema. Estructúralo como un Ejercicio Guiado obligatorio:
"Objetivo: [Lo que aprenderá]\nProblema: [Descripción].\nPasos lógicos requeridos:\n1. ...\n2. ...\nErrores comunes a evitar: [Sintoma -> Solución]"

Responde ÚNICA Y EXCLUSIVAMENTE con un JSON válido usando el siguiente esquema (sin formato markdown):
{
  "levels": [
    {
      "id": "level1",
      "title": "Nombre del módulo (Ej. Fundamentos Básicos)",
      "description": "Descripción inmersiva del módulo",
      "exercises": [
        {
          "id": "ex1",
          "title": "Nombre de la misión",
          "theory": "Sección de TEORÍA PROFUNDA en Markdown que explica el concepto. Usa ejemplos de código claros, explica el por qué y cómo funciona. Esta será la lección del alumno.",
          "description": "La misión práctica específica que el usuario debe resolver en el chat basándose estrictamente en la teoría anterior.",
          "taskDescription": "La tarea estructurada oculta con objetivo, problema, pasos lógicos y errores comunes para que el Oráculo evalúe.",
          "xpValue": 100,
          "dependencies": []
        }
      ]
    }
  ]
}
`.trim();

    try {
      const text = await executePrompt('generate', prompt, { format: 'json' });
      let jsonText = text;
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonText = match[1];
      }
      return JSON.parse(jsonText.trim()) as GeneratedCurriculum;
    } catch (error) {
      console.error('Error generating curriculum:', error);
      throw error;
    }
  },

  async generateDiagnosticQuestion(subject: string, difficulty: 'Basica' | 'Intermedia' | 'Avanzada', isPrestige?: boolean): Promise<string> {
    
    const prestigeRules = isPrestige 
      ? `\n¡ATENCIÓN! Esta es una CLASE DE PRESTIGIO. Las preguntas NO deben ser sobre código simple ni sintaxis.
- Básica -> (Arquitectura conceptual): "¿Qué componentes necesitas para construir X?"
- Intermedia -> (Diseño de Integración): "Explica cómo comunicarías el servicio A con el B."
- Avanzada -> (Troubleshooting de Sistemas): Presenta un escenario de falla en producción y pregúntale cómo lo diagnostica.`
      : `
- Básica -> (recognizes / explains): Pregunta conceptual o diferencia entre dos conceptos.
- Intermedia -> (applies_guided / applies_alone): Problema que requiere escribir 1 a 3 líneas de código.
- Avanzada -> (transfers / teaches): Un código con un error lógico oculto ("troubleshooting") que el alumno debe arreglar.`;

    const prompt = `
Eres un evaluador técnico experto. Genera UNA ÚNICA PREGUNTA de nivel "${difficulty}" sobre "${subject}".
Debes basarte en la taxonomía de dominio (recognizes, explains, applies_guided, applies_alone, transfers, teaches).
Dependiendo del nivel de dificultad solicitado, genera:${prestigeRules}

Solo devuelve el texto de la pregunta, directa y sin introducciones.
`.trim();

    try {
      const text = await executePrompt('generate', prompt);
      return text.trim();
    } catch (error) {
      console.error('Error generating diagnostic question:', error);
      return `¿Puedes escribir un ejemplo básico de código en ${subject}?`;
    }
  },

  async evaluateDiagnosticAnswer(question: string, answer: string): Promise<{isCorrect: boolean, feedback: string, achievement?: {title: string, description: string, icon: string}}> {
    const prompt = `
Pregunta: "${question}"
Respuesta del usuario: "${answer}"

Evalúa si la respuesta es conceptualmente correcta.
Responde estrictamente en formato JSON con la siguiente estructura:
{
  "isCorrect": boolean,
  "feedback": "Breve explicación de por qué es correcto o incorrecto (1 oración)",
  "achievement": null // Opcional. SI y SÓLO SI el usuario dio una respuesta excepcionalmente buena o demostró un gran conocimiento, devuelve un objeto: { "title": "Nombre Épico", "description": "Por qué lo ganó", "icon": "emoji" }
}
`.trim();

    try {
      const text = await executePrompt('generate', prompt, { format: 'json' });
      return JSON.parse(text.trim());
    } catch (error) {
      console.error('Error evaluating diagnostic answer:', error);
      return { isCorrect: true, feedback: "Asumiremos que es correcto por un fallo de conexión." };
    }
  },

  async extractConcepts(subject: string): Promise<Concept[]> {
    const prompt = `
Eres un maestro experto. Extrae 5 conceptos fundamentales y atómicos sobre "${subject}".
Responde estrictamente en formato JSON:
[
  {
    "id": "c_unico",
    "name": "Nombre del Concepto",
    "description": "Descripción corta",
    "explanation": "Explicación detallada de cómo funciona",
    "example": "Ejemplo de código o uso",
    "relatedConcepts": []
  }
]
`.trim();

    try {
      const text = await executePrompt('generate', prompt, { format: 'json' });
      return JSON.parse(text.trim()) as Concept[];
    } catch (error) {
      console.error('Error extracting concepts:', error);
      return [];
    }
  },

  async generateBossTest(subject: string): Promise<{questions: {q: string, a: string}[]}> {
    const prompt = `
Eres el Jefe Final (Boss) de un nivel.
Genera un test de 10 preguntas desafiantes sobre "${subject}".
Las preguntas deben requerir respuestas de texto corto (código o concepto).
Responde STRICTAMENTE en este formato JSON:
{ "questions": [ { "q": "pregunta", "a": "respuesta esperada" } ] }
`;
    try {
      const response = await executePrompt('generate', prompt);
      const text = (response as any).response || (response as any).choices?.[0]?.message?.content || (typeof response === 'string' ? response : "");
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error generating boss test:', error);
      return { questions: [{ q: `Pregunta de emergencia sobre ${subject}`, a: 'ok' }] };
    }
  },

  async generateReviewTest(subject: string, notesContext: string): Promise<{questions: {q: string, a: string}[]}> {
    const prompt = `
Eres un examinador de repaso inteligente. 
El estudiante ha guardado los siguientes apuntes sobre "${subject}":
---
${notesContext}
---
Genera un test de 5 preguntas desafiantes basadas ESTRICTAMENTE en estos apuntes para evaluar su retención.
Las preguntas deben requerir respuestas de texto corto (código o concepto clave).
Responde STRICTAMENTE en este formato JSON:
{ "questions": [ { "q": "pregunta basada en los apuntes", "a": "respuesta esperada" } ] }
`;
    try {
      const response = await executePrompt('generate', prompt);
      const text = (response as any).response || (response as any).choices?.[0]?.message?.content || (typeof response === 'string' ? response : "");
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error generating review test:', error);
      return { questions: [{ q: `¿Cúal es el concepto principal de tus apuntes sobre ${subject}?`, a: 'ok' }] };
    }
  },

  async askOracle(messages: {role: 'user'|'assistant', content: string}[], subject: string, contextProfile: string = "", allSubjects: string[] = [], vaultDocs: VaultDocument[] = []): Promise<string> {
    
    let retrievedContext = "";
    if (vaultDocs.length > 0 && messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || "";
      if (lastUserMessage) {
        try {
          const queryEmbedding = await this.generateEmbedding(lastUserMessage);
          retrievedContext = this.retrieveRelevantContext(queryEmbedding, vaultDocs, 2);
        } catch (e) {
          console.error("Semantic search failed:", e);
        }
      }
    }

    const systemPrompt = `Eres el Oráculo místico del Conocimiento.
El hechicero está estudiando actualmente estas materias: ${allSubjects.length > 0 ? allSubjects.join(', ') : subject}.
El foco principal de su consulta en este momento es: "${subject}".
Puedes ayudarle y responderle preguntas sobre cualquiera de las materias que estudia.
Respondes a las dudas del hechicero de forma técnica y precisa, pero usando sutilmente un tono místico, mágico y sabio (referencias a magia, maná, hechizos, grimorios).
Mantén tus respuestas relativamente cortas y directas al punto técnico. No resuelvas las tareas por el usuario, dales pistas o explica los conceptos que no entienden.

CONTEXTO DEL HECHICERO (Lo que sabes de él):
${contextProfile}

${retrievedContext ? `GRIMORIOS DE REFERENCIA (Conocimiento recuperado de la bóveda para ayudar a responder):\n${retrievedContext}` : ''}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    try {
      const text = await executePrompt('chat', apiMessages);
      return text || "El oráculo está en silencio...";
    } catch (error) {
      console.error('Error asking oracle:', error);
      return "El oráculo ha perdido su conexión con el éter mágico (Error de conexión a la IA local).";
    }
  },

  async condenseOracleContext(chatHistory: {role: 'user'|'assistant', content: string}[], previousContext: string = ""): Promise<string> {
    const historyText = chatHistory.map(m => `${m.role === 'user' ? 'Jugador' : 'Oráculo'}: ${m.content}`).join('\n');
    const prompt = `
Eres un analista de perfiles educativos. 
Tienes un "Contexto Actual" de un estudiante y un "Historial de Chat Reciente".
Tu tarea es leer el historial y actualizar el contexto del estudiante, resumiendo su nivel, en qué se equivoca, qué sabe bien y cómo le gusta ser tratado (por ejemplo si la IA lo conoce por nombre o tiene cierta familiaridad).

CONTEXTO ACTUAL:
${previousContext || "No hay contexto previo. Es la primera vez que interactúan."}

HISTORIAL RECIENTE:
${historyText}

Devuelve SOLO el nuevo contexto actualizado en texto plano, sin explicaciones extra.`;
    try {
      const response = await executePrompt('generate', prompt);
      return (response as any).response || (response as any).choices?.[0]?.message?.content || (typeof response === 'string' ? response : previousContext);
    } catch (error) {
      console.error('Error condensing context:', error);
      return previousContext;
    }
  },

  async synthesizeLearning(missionContent: string, codeSolution: string): Promise<string> {
    const prompt = `
Eres un amanuense mágico. El estudiante acaba de superar la siguiente misión:
Misión: "${missionContent}"
Código Exitoso:
\`\`\`
${codeSolution}
\`\`\`

Tu tarea es abstraer el aprendizaje de esta misión en un "Apunte de Grimorio" corto y conciso.
Estructúralo en Markdown:
1. Concepto clave aprendido.
2. El código de ejemplo.
3. Un tip rápido para recordarlo.

Devuelve SOLO el texto en markdown.
`.trim();
    try {
      const response = await executePrompt('generate', prompt);
      return (response as any).response || (response as any).choices?.[0]?.message?.content || (typeof response === 'string' ? response : "Aprendizaje sintetizado con éxito.");
    } catch (error) {
      console.error('Error synthesizing learning:', error);
      return "Concepto aprendido: " + codeSolution;
    }
  },

  async validateKnowledgeDocument(content: string): Promise<{valid: boolean, reason: string, extractedContext?: string}> {
    const sample = content.length > 5000 ? content.substring(0, 5000) + '\n... (truncado)' : content;
    const prompt = `
Eres el "Oráculo Inquisidor", encargado de procesar los documentos que el usuario introduce en la Bóveda de Conocimiento.
Debes leer el siguiente extracto de texto y:
1. Determinar si tiene valor educativo (conceptos, definiciones, apuntes o código útiles).
2. Si tiene valor, abstraer y estructurar la información útil para eliminar basura (índices, números de página sin contexto, caracteres corruptos) y devolver un "bloque de contexto" limpio.
Si el texto es basura completa, recházalo (valid: false).

EXTRACTO DEL DOCUMENTO:
---
${sample}
---

Responde ESTRICTAMENTE con este formato JSON:
{
  "valid": true o false,
  "reason": "Explicación breve de por qué se acepta o rechaza",
  "extractedContext": "El bloque de texto limpio y estructurado con el conocimiento útil (sólo si valid es true)"
}`;

    try {
      const response = await executePrompt('generate', prompt);
      const text = (response as any).response || (response as any).choices?.[0]?.message?.content || (typeof response === 'string' ? response : "");
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const parsed = JSON.parse(jsonStr);
      return {
        valid: Boolean(parsed.valid),
        reason: parsed.reason || "Evaluado por el Oráculo Inquisidor",
        extractedContext: parsed.extractedContext || sample
      };
    } catch (error) {
      console.error('Error validating document:', error);
      return { valid: true, reason: "Error en la validación, admitido crudo.", extractedContext: sample };
    }
  },

  async validateSubjectFeasibility(description: string, documents: any[]): Promise<{valid: boolean, reason: string, suggestedName?: string}> {
    // Tomar un resumen de los documentos de la bóveda para saber de qué trata el contexto
    const vaultSummary = documents.map(d => d.name).join(", ");
    
    const prompt = `
Eres el Oráculo del Conocimiento. Un estudiante desea añadir una nueva materia a su plan de estudios.
Su descripción de lo que quiere aprender es:
"${description}"

Contexto actual de la Bóveda del estudiante: [${vaultSummary}]

Tu tarea es evaluar si esta materia es factible, real y tiene sentido educativo.
1. Si el tema es absurdo, ficticio o imposible de enseñar (ej. "viajar en el tiempo", "magia de unicornios"), recházalo.
2. Si el tema es real y educativo (ej. "React Hooks", "Machine Learning", "Patrones de diseño"), acéptalo.
3. Si lo aceptas, genera un nombre corto, formal y elegante para la materia (máximo 4 palabras, ej. "Programación en Python", "React Intermedio").

Responde ESTRICTAMENTE con este formato JSON:
{
  "valid": true o false,
  "reason": "Explicación de por qué se acepta o rechaza. Si se rechaza, sé directo y diles por qué no pueden aprender eso.",
  "suggestedName": "Nombre formal sugerido (sólo si valid es true)"
}`;

    try {
      const response = await executePrompt('generate', prompt);
      const text = (response as any).response || (response as any).choices?.[0]?.message?.content || (typeof response === 'string' ? response : "");
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const parsed = JSON.parse(jsonStr);
      
      return {
        valid: Boolean(parsed.valid),
        reason: parsed.reason || "Evaluado por el Oráculo",
        suggestedName: parsed.suggestedName
      };
    } catch (error) {
      console.error('Error validating subject feasibility:', error);
      // Fallback: accept it by default if AI fails
      return { valid: true, reason: "Error en la validación del Oráculo, materia aceptada por defecto." };
    }
  },

  async evaluatePrestigeEligibility(completedSubjects: string[], vaultTags: string[]): Promise<PrestigeRecommendation> {
    const prompt = `
Eres el Gran Oráculo, arquitecto de conocimiento.
El Buscador ha dominado las siguientes materias: [${completedSubjects.join(', ')}].
En su grimorio, resuenan estos conceptos (tags): [${vaultTags.join(', ')}].

Tu tarea es determinar si existe una SINERGIA LÓGICA entre 2 o más de estas materias para forjar una "Clase de Prestigio" (Una materia avanzada que una estos conocimientos).
Para pruebas, si el usuario tiene al menos 1 o 2 materias, SIEMPRE intenta encontrar una excusa para forjar una sinergia y devuelve isEligible: true.

Responde ÚNICA Y EXCLUSIVAMENTE con un JSON válido usando el siguiente esquema (sin formato markdown):
{
  "isEligible": boolean,
  "name": "Nombre de la Meta-Materia (Ej. Sistemas Distribuidos)",
  "context": "Contexto épico y Socrático explicando por qué se desbloquea esto basado en sus materias",
  "icon": "🌌" // Un emoji épico
}
`.trim();

    try {
      const text = await executePrompt('generate', prompt, { format: 'json' });
      let jsonText = text;
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonText = match[1];
      }
      return JSON.parse(jsonText.trim()) as PrestigeRecommendation;
    } catch (error) {
      console.error('Error in evaluatePrestigeEligibility:', error);
      return { isEligible: false };
    }
  }
};
