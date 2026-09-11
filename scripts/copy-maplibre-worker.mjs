/**
 * MapLibre déduit l'adresse de son worker de `import.meta.url`. Après le
 * passage dans le bundler, cette adresse pointe sur la page elle-même : le
 * worker est refusé (type MIME text/html) et plus aucune tuile n'est demandée.
 *
 * On copie donc le worker et son module partagé dans `public/maplibre/`, et
 * l'application appelle `setWorkerUrl` sur ce chemin. Les fichiers sont
 * recopiés à chaque `pnpm dev` et `pnpm build`, ils ne sont pas versionnés.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];
const TARGET = join(process.cwd(), "public", "maplibre");

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));

await mkdir(TARGET, { recursive: true });
await Promise.all(FILES.map((file) => copyFile(join(dist, file), join(TARGET, file))));

console.log(`maplibre: ${FILES.length} fichiers copiés dans public/maplibre`);
