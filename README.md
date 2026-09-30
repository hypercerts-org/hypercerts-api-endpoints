# Hypercerts API Endpoints

A standalone, generated explorer for public Hypercerts XRPC queries served by HappyView. The committed Lexicon snapshots are the complete input for regeneration; no HappyView checkout or package install is needed to rebuild the OpenAPI artifact.

## Coverage and source policy

The primary source is `happyview/hypercerts-api/manifest.json` on branch `api/profile-queries` at `4a3477631e08345c239ca9596c70cd08473812e6`. It contains 9 public query Lexicons. The union of real `main` query definitions referenced by active module manifests in the inspected HappyView worktrees adds 18 branch-only definitions. Four additional query Lexicons for badge definitions and funding receipts exist in worktree files but are not referenced by an active root module manifest; they are included as **unmanifested / unsupported**, not as part of the installable bundle. The snapshot contains 31 query definitions total; no procedure definitions were found.

Coverage labels describe source-manifest membership only. They do **not** assert that branch-only or unmanifested endpoints are deployed, enabled, or verified on any HappyView instance. Source worktree, commit, Lexicon path, and manifest status are recorded in `sources/index.json`.

The generator preserves Lexicon parameter requirements, descriptions, primitive formats, bounds, enums, examples/defaults when present, array serialization as repeated query keys, method, and local references. Lexicon `maxGraphemes` has no equivalent OpenAPI constraint, so it is retained as `x-lexicon-maxGraphemes` on the generated schema. Cross-Lexicon references that are not defined by the committed endpoint snapshots are emitted as explicit placeholder schemas carrying `x-lexicon-ref`; they are not silently presented as resolved schemas. Consequently, response schemas are partial wherever they depend on those unresolved refs. The JSON artifacts retain unresolved-reference details; the explorer displays only a global notice that some response schemas may be partial.

## Use

The React SPA requires Node.js 22.12.0 or newer and pnpm. Install the UI dependencies and start the Vite development server:

```sh
pnpm install
pnpm dev
```

Open <http://127.0.0.1:5173>. The root `index.html` starts the Scalar reference. Its initial server is `https://happyview-test.up.railway.app`; you can switch to `http://127.0.0.1:8080` or enter a custom http(s) base URL without credentials, query, or fragment. Changing the server only changes the request target shown by Scalar. No API request is made until you press **Send**. Requests go directly from your browser without a proxy or credentials; browser CORS policy can block a request even when the API is reachable.

The explorer uses Hypercerts’ light palette and `@hypercerts-org/ui-react` controls. Code samples are limited to Node.js `fetch` (default), Go `native`, and shell `curl`. Headings prefer Instrument Serif with a Georgia fallback; body text prefers Switzer Variable with a system sans-serif fallback. The favicon and all three font files are bundled in `public/`; Scalar's default fonts remain disabled, so the explorer does not fetch fonts from a CDN.

**Release risk:** `Switzer-Variable.woff2` is subject to Fontshare's ITF Free Font License. The `hypercerts-design/assets/fonts/README.md` clarifies that the licence permits ordinary self-hosted website webfont delivery, but prohibits redistribution through a repository, package, or font service. This explorer intentionally tracks and serves Switzer as requested; the tracked font file remains an unresolved licence risk even though serving it as a website webfont is permitted. Whether to retain the tracked font is the user's choice; resolve this risk before distributing a release. This note is not legal clearance.

Build the static site with `pnpm build`; the deployable SPA is written to `dist/`. `dist/openapi.json` is copied byte-for-byte from the authoritative root artifact and is also downloadable from the UI. Preview the build locally with `pnpm preview`.

The artifact generator is dependency-free and can be run directly:

```sh
node scripts/generate-openapi.mjs
```

Install dependencies with `pnpm install` before running the full test suite with `pnpm test`; some tests import Vite and its React plugin.

## Refreshing sources

`node scripts/generate-openapi.mjs` regenerates `openapi.json` and `coverage.json` from the committed `sources/lexicons/` and `sources/index.json`, offline and deterministically. To refresh the recorded files from existing HappyView worktrees, run `node scripts/refresh-sources.mjs /path/to/hypercerts-worktrees-root` (for example, `/home/kzoeps/Projects/hypercerts`). The refresh command follows the worktree names and relative Lexicon paths already recorded in `sources/index.json`, reads each worktree's current branch and full commit SHA, and regenerates the artifacts. It does not install dependencies or contact a server. New endpoints require adding their Lexicon and provenance entry to the index before refreshing. Keep the source ref (branch and full commit SHA), Lexicon `id`, path, and whether the definition appears in the primary manifest, a branch manifest, or no active root manifest. Do not infer deployment status from a source snapshot.
