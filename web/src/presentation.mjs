export const DEFAULT_SERVER_URL = 'https://happyview-test.up.railway.app';
export const LOCAL_SERVER_URL = 'http://127.0.0.1:8080';

const PRESENTATION_DESCRIPTION =
  'Public Hypercerts XRPC endpoints. Response schemas may be partial where they depend on types outside the local snapshots. Requests are sent directly from your browser only after you select Send; browser CORS policies may block them.';

/**
 * Validate and normalize a server base URL for the request client.
 * @param {string} input
 */
export function normalizeBaseUrl(input) {
  let url;
  const candidate = input.trim();
  try {
    url = new URL(candidate);
  } catch {
    throw new TypeError('Enter a complete http(s) base URL, such as https://api.example.test.');
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    candidate.includes('?') ||
    candidate.includes('#')
  ) {
    throw new TypeError(
      'Use an http(s) base URL without credentials, a query, or a fragment.',
    );
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

/**
 * Make an in-memory presentation copy without changing generated artifacts.
 * @param {Record<string, any>} source
 */
export function createPresentationSpec(source) {
  const spec = structuredClone(source);
  spec.info = {
    ...spec.info,
    version: 'local',
    description: PRESENTATION_DESCRIPTION,
  };
  spec.servers = [
    { url: DEFAULT_SERVER_URL, description: 'HappyView test (default)' },
    { url: LOCAL_SERVER_URL, description: 'Local (127.0.0.1:8080)' },
  ];

  for (const schema of Object.values(spec.components?.schemas ?? {})) {
    if (Object.hasOwn(schema, 'x-lexicon-ref')) {
      delete schema.description;
    }
  }

  stripPresentationExtensions(spec);
  return spec;
}

/**
 * @param {unknown} value
 */
function stripPresentationExtensions(value) {
  if (Array.isArray(value)) {
    for (const item of value) stripPresentationExtensions(item);
    return;
  }
  if (!value || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('x-') && key !== 'x-lexicon-maxGraphemes') {
      delete value[key];
    } else {
      stripPresentationExtensions(child);
    }
  }
}
