import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolve the frontend dist directory.
 *
 * When recall-cli is installed globally, the monorepo structure is not
 * available, so we fall back to the working directory. In both dev and
 * production we prefer an already-built `frontend/dist` (served via
 * `vite preview`) and fall back to the monorepo's `frontend/` source
 * directory so `recall web` can still `vite dev`.
 */
export function resolveFrontendDist(): { dir: string; isPreview: boolean } {
  const here = path.dirname(fileURLToPath(import.meta.url));

  const candidates = [
    // Installed globally / packed: cli is a sibling of frontend
    path.resolve(here, '../../frontend/dist'),
    // Running from monorepo: cli/dist/src -> frontend/dist
    path.resolve(here, '../../../frontend/dist'),
    // CWD-relative fallback
    path.resolve(process.cwd(), 'frontend/dist'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      return { dir, isPreview: true };
    }
  }

  // No build available — fall back to the source dir so `vite` can dev-serve
  const devCandidates = [
    path.resolve(here, '../../frontend'),
    path.resolve(here, '../../../frontend'),
    path.resolve(process.cwd(), 'frontend'),
  ];
  for (const dir of devCandidates) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return { dir, isPreview: false };
    }
  }

  throw new Error(
    'Could not locate the Recall frontend. Run `npm run build` in the monorepo first.',
  );
}

/**
 * Launch the webapp: spawn Vite (preview or dev), open the URL in the
 * default browser, and keep the process alive until Ctrl-C.
 */
export async function launchWebapp(port = 21120): Promise<void> {
  const { dir, isPreview } = resolveFrontendDist();
  const url = `http://localhost:${port}`;

  const args = isPreview
    ? ['vite', 'preview', '--port', String(port), '--strictPort']
    : ['vite', '--port', String(port), '--strictPort'];

  const child = spawn('npx', args, {
    cwd: dir,
    stdio: isPreview ? 'ignore' : 'inherit',
    detached: isPreview,
    shell: process.platform === 'win32',
    env: { ...process.env, BROWSER: 'none' },
  });

  if (isPreview) child.unref();

  // Open the URL in the default browser once Vite has had a moment to bind.
  setTimeout(() => openUrl(url), 1500);

  console.log(`\n  Recall webapp is served from ${url}`);
  console.log(`  Frontend dir: ${dir}`);
  console.log(`  Mode:         ${isPreview ? 'vite preview' : 'vite dev'}`);
  console.log(`\n  Press Ctrl-C to stop.\n`);

  const shutdown = () => {
    try {
      if (child.pid) {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
            stdio: 'ignore',
          });
        } else {
          process.kill(-child.pid, 'SIGTERM');
        }
      }
    } catch {
      // child already exited
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  if (!isPreview) {
    // Dev mode — keep this process attached to the child until it exits.
    await new Promise<void>((resolve) => {
      child.on('exit', () => resolve());
    });
  } else {
    // Preview mode — detached child, so just keep the parent alive.
    await new Promise<void>(() => {
      // intentionally never resolves
    });
  }
}

function openUrl(url: string): void {
  const platform = process.platform;
  const cmd =
    platform === 'win32' ? 'start' : platform === 'darwin' ? 'open' : 'xdg-open';
  const args = platform === 'win32' ? ['""', url] : [url];
  spawn(cmd, args, {
    shell: platform === 'win32',
    stdio: 'ignore',
    detached: true,
  }).unref();
}
