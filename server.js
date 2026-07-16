import fs from 'fs';
import path from 'path';
import express from 'express';

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;
  const projectRoot = path.resolve();

  // Simple API proxy for production
  if (isProd) {
    // Serve static files in production
    app.use(express.static(path.resolve(projectRoot, 'dist')));
    
    // Proxy API requests to backend
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    app.use('/api', async (req, res) => {
      const targetUrl = `${backendUrl}${req.originalUrl}`;
      try {
        const method = req.method;
        const headers = { ...req.headers };
        delete headers.host; // Remove host header to avoid mismatches
        
        let body = undefined;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          // Read request body
          body = await new Promise((resolve) => {
            let data = [];
            req.on('data', chunk => data.push(chunk));
            req.on('end', () => resolve(Buffer.concat(data)));
          });
        }

        const fetchRes = await fetch(targetUrl, {
          method,
          headers,
          body,
          duplex: body ? 'half' : undefined
        });

        res.status(fetchRes.status);
        fetchRes.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        
        const resBody = await fetchRes.arrayBuffer();
        res.send(Buffer.from(resBody));
      } catch (err) {
        console.error(`Proxy error for ${targetUrl}:`, err);
        res.status(500).send({ detail: 'Proxy gateway error' });
      }
    });

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(projectRoot, 'dist', 'index.html'));
    });
  } else {
    // In development, set up Vite as a middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(
          path.resolve(projectRoot, 'index.html'),
          'utf-8'
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(port, () => {
    console.log(`BizPilot Frontend Server running at http://localhost:${port}`);
  });
}

startServer();
