import type { VercelRequest, VercelResponse } from '@vercel/node';
import { solveHomework } from '../../src/server/solver';

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const result = await solveHomework(req.body);
    return res.status(result.status).json(result.data);
  } catch (error: any) {
    console.error('Erreur API solve:', error);
    return res.status(500).json({
      error: error.message || 'Une erreur interne est survenue.',
    });
  }
}
