import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_API_KEY = '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';

const MODEL_MAP: Record<string, string> = {
  rapide: 'google/gemma-4-31b-it',
  normal: 'meta/muse-glimmer-30b',
  max: 'deepseek-ai/deepseek-v4.1-flash',
};

function getSystemPrompt(difficulty: string, subject?: string): string {
  const subjectContext = subject ? `Matière scolaire concernée : ${subject}.` : '';

  switch (difficulty?.toLowerCase()) {
    case 'facile':
      return `Tu es un tuteur scolaire ultra bienveillant, clair et pédagogue pour collégiens et lycéens, créé par Liam (4°1).
${subjectContext}
MODE DIFFICULTÉ : FACILE.
Règles d'or :
- Explique avec des mots simples de la vie courante et sans jargon compliqué.
- Ne donne JAMAIS juste le résultat brut sans explication : découpe en petites étapes simples numérotées (Étape 1, Étape 2, Étape 3).
- Utilise des métaphores ou des exemples concrets pour que l'élève comprenne le "pourquoi".
- Mets en évidence la règle simple à retenir avec un encadré ou des puces.
- Termine par un encouragement chaleureux et une question rapide pour vérifier s'il a compris.`;

    case 'difficile':
      return `Tu es un tuteur d'excellence académique, niveau concours / prépa / olympiades, créé par Liam (4°1).
${subjectContext}
MODE DIFFICULTÉ : DIFFICILE.
Règles d'or :
- Rigueur mathématique, scientifique ou littéraire absolue.
- Démonstrations formelles complètes, axiomes, théorèmes exacts et contre-exemples éventuels.
- Vocabulaire académique précis, rédaction soignée et élégante.
- Fournis une analyse en profondeur, les cas particuliers ou subtilités de raisonnement.
- Présentation structurée : Hypothèses, Méthode & Théorèmes, Démonstration / Résolution détaillée, Conclusion & Synthèse.`;

    case 'moyen':
    default:
      return `Tu es un professeur particulier d'excellence, méthodique et encourageant, créé par Liam (4°1).
${subjectContext}
MODE DIFFICULTÉ : MOYEN.
Règles d'or :
- Donne une explication claire et structurée.
- Énonce la règle, formule ou notion de cours indispensable.
- Montre l'application détaillée pas à pas de la méthode.
- Donne la réponse finale bien mise en valeur.
- Ajoute une courte astuce d'auto-vérification pour que l'élève évite les pièges typiques.`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const {
      prompt,
      image,
      intelligence = 'normal',
      difficulty = 'moyen',
      subject = 'Général',
      history = [],
    } = req.body || {};

    if (!prompt && !image) {
      return res.status(400).json({ error: 'Veuillez poser une question ou envoyer une photo de devoir.' });
    }

    const selectedModel = MODEL_MAP[intelligence.toLowerCase()] || MODEL_MAP.normal;
    const systemInstruction = getSystemPrompt(difficulty, subject);

    // Prepare messages for chat completion
    const messages: Array<{ role: string; content: any }> = [
      { role: 'system', content: systemInstruction },
    ];

    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-4)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    let userContent: any = prompt || 'Résous et explique cet exercice de devoir en détail.';
    if (image && typeof image === 'string' && image.startsWith('data:')) {
      userContent = [
        { type: 'text', text: prompt || 'Voici la photo de mon devoir. Résous-le et explique la méthode pas à pas.' },
        { type: 'image_url', image_url: { url: image } },
      ];
    }

    messages.push({
      role: 'user',
      content: userContent,
    });

    let solvedText = '';
    let usedProvider = 'primary';

    // 1. Fast attempt with Nvidia endpoint
    const nvidiaAbort = new AbortController();
    const timeoutId = setTimeout(() => nvidiaAbort.abort(), 1800);

    try {
      const nvidiaResponse = await fetch(NVIDIA_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          temperature: difficulty.toLowerCase() === 'facile' ? 0.7 : 0.3,
          max_tokens: 2500,
        }),
        signal: nvidiaAbort.signal,
      });

      clearTimeout(timeoutId);

      if (nvidiaResponse.ok) {
        const data = await nvidiaResponse.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          solvedText = content;
          usedProvider = 'nvidia-secret';
        }
      }
    } catch {
      // Proceed to fallback
    }

    // 2. High-speed neural fallback
    if (!solvedText) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const contents: any[] = [];

        if (Array.isArray(history) && history.length > 0) {
          for (const msg of history.slice(-4)) {
            contents.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            });
          }
        }

        const userParts: any[] = [];
        if (prompt) {
          userParts.push({ text: prompt });
        } else {
          userParts.push({ text: 'Voici la photo de mon devoir. Résous-le et explique la méthode pas à pas.' });
        }

        if (image && typeof image === 'string' && image.startsWith('data:')) {
          const match = image.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            userParts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }

        contents.push({
          role: 'user',
          parts: userParts,
        });

        try {
          const geminiRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction,
              temperature: difficulty.toLowerCase() === 'facile' ? 0.7 : 0.3,
            },
          });
          solvedText = geminiRes.text || '';
        } catch {
          await new Promise((r) => setTimeout(r, 600));
          const retryRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
              systemInstruction,
              temperature: difficulty.toLowerCase() === 'facile' ? 0.7 : 0.3,
            },
          });
          solvedText = retryRes.text || '';
        }
        usedProvider = 'neural-fast';
      }
    }

    if (!solvedText) {
      return res.status(500).json({
        error: 'Erreur lors de la génération. Veuillez réessayer dans un instant.',
      });
    }

    return res.status(200).json({
      text: solvedText,
      provider: usedProvider,
      model: selectedModel,
      difficulty,
      intelligence,
    });
  } catch (error: any) {
    console.error('Serverless solve error:', error);
    return res.status(500).json({
      error: error.message || 'Une erreur interne est survenue.',
    });
  }
}
