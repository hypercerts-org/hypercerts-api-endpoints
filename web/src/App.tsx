import { useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { Button, Input, Select } from '@hypercerts-org/ui-react';
import { ApiReferenceReact, type AnyApiReferenceConfiguration } from '@scalar/api-reference-react';
import generatedSpec from '../../openapi.json';
import { createClientConfiguration } from './client-configuration.mjs';
import {
  createPresentationSpec,
  DEFAULT_SERVER_URL,
  LOCAL_SERVER_URL,
  normalizeBaseUrl,
} from './presentation.mjs';
import './styles.css';

type ServerMode = 'default' | 'local' | 'custom';

const presentationSpec = createPresentationSpec(generatedSpec);

export function App() {
  const [serverMode, setServerMode] = useState<ServerMode>('default');
  const [activeServer, setActiveServer] = useState(DEFAULT_SERVER_URL);
  const [customServer, setCustomServer] = useState('');
  const [customError, setCustomError] = useState('');

  const selectedServers = useMemo(
    () => [{ url: activeServer, description: 'Selected server' }],
    [activeServer],
  );
  const activeSpec = useMemo(
    () => ({ ...presentationSpec, servers: selectedServers }),
    [selectedServers],
  );
  const configuration = useMemo<AnyApiReferenceConfiguration>(
    () => ({
      content: activeSpec,
      ...createClientConfiguration(),
      agent: { disabled: true, hideAddApi: true },
      mcp: { disabled: true },
      hideClientButton: true,
      servers: selectedServers,
      baseServerURL: activeServer,
      theme: 'default',
      layout: 'modern',
      darkMode: false,
      forceDarkModeState: 'light',
      hideDarkModeToggle: true,
      hideSearch: false,
      hideModels: false,
      hideTestRequestButton: false,
      showOperationId: false,
      showSidebar: true,
      showDeveloperTools: 'never',
      customCss: '.introduction-section .section-content > .flex.gap-1\\.5 { display: none; }',
      defaultOpenFirstTag: true,
      defaultOpenAllTags: false,
      expandAllParameters: false,
      expandAllResponses: false,
      expandAllSchemaProperties: false,
      orderRequiredPropertiesFirst: true,
      documentDownloadType: 'none',
      telemetry: false,
      withDefaultFonts: false,
    }),
    [activeServer, activeSpec, selectedServers],
  );

  function handleServerModeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextMode = event.target.value as ServerMode;
    setServerMode(nextMode);
    setCustomError('');

    if (nextMode === 'default') setActiveServer(DEFAULT_SERVER_URL);
    if (nextMode === 'local') setActiveServer(LOCAL_SERVER_URL);
  }

  function applyCustomServer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setActiveServer(normalizeBaseUrl(customServer));
      setCustomError('');
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : 'Enter a valid http(s) base URL.');
    }
  }

  return (
    <div className="app-frame">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Hypercerts API reference home">
          <img className="brand-logo" src="/brand/logo-horizontal.svg" alt="" />
          <span className="brand-api"><span className="brand-divider" aria-hidden="true">/</span> API</span>
        </a>
        <div className="header-actions">
          <div className="server-control">
            <label htmlFor="server-mode">Request server</label>
            <Select id="server-mode" value={serverMode} onChange={handleServerModeChange}>
              <option value="default">HappyView test · default</option>
              <option value="local">Local · 127.0.0.1:8080</option>
              <option value="custom">Custom base URL…</option>
            </Select>
          </div>
          {serverMode === 'custom' && (
            <form className="custom-server-form" onSubmit={applyCustomServer} noValidate>
              <label className="sr-only" htmlFor="custom-server">Custom base URL</label>
              <Input
                id="custom-server"
                type="url"
                value={customServer}
                onChange={(event) => setCustomServer(event.target.value)}
                placeholder="https://api.example.test"
                aria-invalid={Boolean(customError)}
                aria-describedby={customError ? 'server-error' : undefined}
                autoComplete="url"
              />
              <Button type="submit">Use URL</Button>
              {customError && <span id="server-error" className="server-error" role="alert">{customError}</span>}
            </form>
          )}
          <a className="download-link" href="/openapi.json" download="hypercerts-api-openapi.json">
            OpenAPI JSON <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      <aside className="usage-note" role="note">
        <span className="note-icon" aria-hidden="true">i</span>
        <p>
          Some response schemas may be partial where referenced types are outside the local snapshots. Requests go directly from your browser only after you press <strong>Send</strong>; browser CORS policies may block them.
        </p>
      </aside>

      <main className="reference-main" aria-label="Hypercerts API endpoints">
        <ApiReferenceReact key={activeServer} configuration={configuration} />
      </main>
    </div>
  );
}
