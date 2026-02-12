import { useState, useEffect } from 'react';

export default function Settings() {
    const [spec, setSpec] = useState('');
    const [tunnelURL, setTunnelURL] = useState('');

    useEffect(() => {
        fetch('/api/spec')
            .then(res => res.json())
            .then(data => {
                setSpec(JSON.stringify(data, null, 2));
                if (data.servers && data.servers.length > 0) {
                    setTunnelURL(data.servers[0].url);
                }
            })
            .catch(err => console.error("Failed to fetch spec:", err));
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div>
            <h1>Settings</h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Credentials & Security</h2>
                <p>Manage your secure environment variables and API keys here.</p>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Master Key (for encryption)</label>
                    <input
                        type="password"
                        disabled
                        value="****************"
                        className="input"
                    />
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Connectors</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="http://localhost:8080/auth/login?provider=google" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
                            Connect Google (via Octomus Cloud)
                        </a>
                        <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>
                            Connect Slack (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>LLM Connection</h2>
                <p>Connect your LLM (Gemini, ChatGPT, etc.) to your local tools using this connection.</p>

                <div className="input-group" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Global Tunnel URL</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            readOnly
                            value={tunnelURL || "Loading..."}
                            className="input"
                            style={{ flex: 1, fontFamily: 'monospace' }}
                        />
                        <button className="btn btn-secondary" onClick={() => copyToClipboard(tunnelURL)}>Copy</button>
                    </div>
                </div>

                <div className="input-group" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>OpenAPI Specification</label>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            readOnly
                            value={spec}
                            style={{
                                width: '100%',
                                height: '200px',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                padding: '0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '0.375rem',
                                background: 'var(--bg-secondary)'
                            }}
                        />
                        <button
                            className="btn btn-secondary"
                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => copyToClipboard(spec)}
                        >
                            Copy Spec
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                    <strong>Instructions for Gemini / Custom GPTs:</strong>
                    <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>Go to "Configure" or "Edit GPT".</li>
                        <li>Add a new "Action".</li>
                        <li>Paste the OpenAPI Specification above into the Schema box.</li>
                        <li>The "Authentication" should be set to "None" (Authentication is handled via the Tunnel/Cloud).</li>
                        <li>Save and test connecting to your local tools!</li>
                    </ol>
                </div>
            </div>

            <div className="card">
                <h2 style={{ marginBottom: '1rem' }}>Installed Servers</h2>
                <p>No servers installed locally.</p>
            </div>
        </div>
    );
}
