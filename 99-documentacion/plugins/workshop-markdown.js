import fs from 'fs';
import path from 'path';

/**
 * Vite plugin that:
 * 1. Discovers all WORKSHOP.md files in sibling project folders
 * 2. Serves them via /__api/workshops endpoint
 * 3. Watches for changes and triggers hot reload
 */
export default function workshopMarkdown() {
  const rootDir = path.resolve(process.cwd(), '..');
  let server;

  function discoverWorkshops() {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    const workshops = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === '99-documentacion') continue;
      if (entry.name === 'node_modules') continue;
      if (entry.name.startsWith('.')) continue;

      const mdPath = path.join(rootDir, entry.name, 'WORKSHOP.md');
      if (fs.existsSync(mdPath)) {
        workshops.push({
          folder: entry.name,
          path: mdPath,
        });
      }
    }

    return workshops.sort((a, b) => a.folder.localeCompare(b.folder));
  }

  function folderToTitle(folder) {
    // "01-inicio" → "01 · Inicio"
    // "03-module-federation" → "03 · Module Federation"
    const match = folder.match(/^(\d+)-(?:spec-)?(.+)$/);
    if (!match) return folder;
    const num = match[1];
    const name = match[2]
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return `${num} · ${name}`;
  }

  return {
    name: 'workshop-markdown',

    configureServer(srv) {
      server = srv;

      // Watch all WORKSHOP.md files for changes
      const workshops = discoverWorkshops();
      for (const w of workshops) {
        srv.watcher.add(w.path);
      }

      // Also watch root for new folders
      srv.watcher.add(rootDir);

      srv.watcher.on('change', (filePath) => {
        if (filePath.endsWith('WORKSHOP.md')) {
          srv.ws.send({ type: 'full-reload' });
        }
      });

      srv.watcher.on('add', (filePath) => {
        if (filePath.endsWith('WORKSHOP.md')) {
          srv.watcher.add(filePath);
          srv.ws.send({ type: 'full-reload' });
        }
      });

      // API middleware
      srv.middlewares.use((req, res, next) => {
        // GET /__api/workshops → list of workshops
        if (req.url === '/__api/workshops') {
          const workshops = discoverWorkshops();
          const list = workshops.map((w) => ({
            folder: w.folder,
            title: folderToTitle(w.folder),
          }));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(list));
          return;
        }

        // GET /__api/workshops/:folder → markdown content
        const match = req.url?.match(/^\/__api\/workshops\/(.+)$/);
        if (match) {
          const folder = decodeURIComponent(match[1]);
          const mdPath = path.join(rootDir, folder, 'WORKSHOP.md');
          if (fs.existsSync(mdPath)) {
            const content = fs.readFileSync(mdPath, 'utf-8');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(content);
          } else {
            res.statusCode = 404;
            res.end('Not found');
          }
          return;
        }

        next();
      });
    },
  };
}
