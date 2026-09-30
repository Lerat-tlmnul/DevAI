import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveHomework } from './src/server/solver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for body parsing (allow image uploads up to 25MB)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API endpoint to solve homework questions
app.post('/api/homework/solve', async (req, res) => {
  try {
    const result = await solveHomework(req.body);
    return res.status(result.status).json(result.data);
  } catch (error: any) {
    console.error('Erreur API solve:', error);
    return res.status(500).json({
      error: error.message || 'Une erreur interne est survenue.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DevAI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
