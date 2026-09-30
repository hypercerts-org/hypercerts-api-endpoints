# Hypercerts API Endpoints

A standalone static React/Scalar explorer for public Hypercerts XRPC queries served by HappyView. It uses committed Lexicon snapshots to generate its OpenAPI reference; running the explorer does not require a HappyView checkout.

## Run locally

Requires Node.js 22.12.0 or newer and pnpm.

```sh
pnpm install
pnpm dev
```

Open <http://127.0.0.1:5173>. The explorer defaults to `https://api.test.hypercerts.dev`; Local (`http://127.0.0.1:8080`) and Custom server choices are also available. Requests go directly from your browser to the selected server.

To offer named servers, set `VITE_HAPPYVIEW_SERVERS` when starting the dev server or building the site:

```sh
VITE_HAPPYVIEW_SERVERS='[{"label":"Staging","url":"https://staging.api.hypercerts.dev"},{"label":"Test","url":"https://test.api.hypercerts.dev"}]' pnpm dev
```

The value must be a nonempty JSON array of labeled, distinct http(s) base URLs without credentials, query, or fragment. The first entry is the default; Local and Custom remain available. These URLs are public in the browser bundle, so do not include secrets. Changing a deployed site's configuration requires a rebuild and redeploy.

## Build and check

```sh
pnpm build
pnpm preview
pnpm test
```

`pnpm build` writes the deployable static site to `dist/`; `pnpm preview` serves that build locally. `pnpm test` runs the test suite.

**Font licence:** This repo bundles Switzer Variable. Its redistribution through a repository or package may be restricted under the Fontshare ITF Free Font License; resolve that risk before distributing a release. This is not legal clearance.
