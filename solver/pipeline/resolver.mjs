// Node ESM loader hook so pipeline scripts can import the app's engine modules.
//
// The app is built by Vite, which resolves extensionless imports like
// `from './handClass'`. Plain Node does not. Rather than duplicating engine
// logic into the pipeline — which would silently drift from what the app
// actually uses — this appends the extension Vite would have found.

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (!specifier.startsWith('.')) throw err;
    for (const ext of ['.js', '.mjs', '/index.js']) {
      try {
        const candidate = new URL(specifier + ext, context.parentURL);
        if (existsSync(fileURLToPath(candidate))) {
          return await nextResolve(specifier + ext, context);
        }
      } catch { /* try the next extension */ }
    }
    throw err;
  }
}
