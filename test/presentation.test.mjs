import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createPresentationSpec, normalizeBaseUrl } from '../web/src/presentation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(await readFile(path.join(root, 'openapi.json'), 'utf8'));

test('presentation keeps the endpoint contract but hides provenance and incomplete-ref annotations', () => {
  const original = structuredClone(source);
  const presentation = createPresentationSpec(source);
  const endpointPath = '/xrpc/org.hypercerts.claim.listActivities';

  assert.deepEqual(source, original, 'the authoritative generated artifact is not mutated');
  assert.deepEqual(
    presentation.paths[endpointPath].get.parameters,
    source.paths[endpointPath].get.parameters,
    'descriptions, requirements, array serialization, and constraints remain available',
  );
  assert.match(presentation.info.description, /response schemas may be partial/i);
  assert.deepEqual(presentation.servers, [
    { url: 'https://happyview-test.up.railway.app', description: 'HappyView test (default)' },
    { url: 'http://127.0.0.1:8080', description: 'Local (127.0.0.1:8080)' },
  ]);
  assert.equal(Object.hasOwn(presentation, 'x-hypercerts-source'), false);
  assert.equal(Object.hasOwn(presentation, 'x-hypercerts-unresolved-references'), false);
  assert.equal(Object.hasOwn(presentation.paths[endpointPath].get, 'x-hypercerts-coverage'), false);
  assert.equal(Object.hasOwn(presentation.paths[endpointPath].get, 'x-hypercerts-source'), false);
  assert.doesNotMatch(JSON.stringify(presentation), /x-hypercerts-|x-lexicon-ref|branch-only|unmanifested-unsupported/);
  assert.equal(
    presentation.components.schemas['org.hypercerts.collection.listCollectionItems.collectionSummaryView']
      .properties.title['x-lexicon-maxGraphemes'],
    80,
    'the Lexicon grapheme constraint remains in the presentation schema',
  );

  const placeholderName = Object.keys(source.components.schemas).find((name) =>
    Object.hasOwn(source.components.schemas[name], 'x-lexicon-ref'),
  );
  assert.ok(placeholderName, 'the source snapshot contains an unresolved response reference');
  assert.deepEqual(presentation.components.schemas[placeholderName], {});
});

test('base URL validation accepts the default and local servers but rejects unsafe custom URLs', () => {
  assert.equal(normalizeBaseUrl('https://api.example.test/v1/'), 'https://api.example.test/v1');
  assert.equal(normalizeBaseUrl('http://127.0.0.1:8080/'), 'http://127.0.0.1:8080');

  for (const invalid of [
    'ftp://api.example.test',
    'https://user:secret@api.example.test',
    'https://api.example.test?token=value',
    'https://api.example.test/#fragment',
    'not a URL',
  ]) {
    assert.throws(() => normalizeBaseUrl(invalid), TypeError, invalid);
  }
});
