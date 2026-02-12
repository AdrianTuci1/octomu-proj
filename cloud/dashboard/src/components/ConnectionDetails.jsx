import React, { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import './ConnectionDetails.css';

const ConnectionDetails = ({ apiKey, externalUserId }) => {
    const [showApiKey, setShowApiKey] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUserId, setCopiedUserId] = useState(false);

    const handleCopy = (text, setCopied) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const curlCommand = `curl -X POST https://api.octomus.com/v1/chat \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "X-External-User-Id: ${externalUserId || 'USER_ID'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "Hello world"}]
  }'`;

    return (
        <div className="connection-details-container">
            <div className="details-spacing">
                {/* API Key Section */}
                <div>
                    <label className="detail-label">API Key</label>
                    <div className="input-group">
                        <div className="input-wrapper">
                            <input
                                type={showApiKey ? "text" : "password"}
                                value={apiKey || ''}
                                readOnly
                                className="api-input"
                            />
                            <button
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="toggle-visibility-btn"
                            >
                                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <button
                            onClick={() => handleCopy(apiKey, setCopiedKey)}
                            className="copy-btn"
                            title="Copy API Key"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    {copiedKey && <span className="copy-success">Copied to clipboard!</span>}
                </div>

                {/* External User ID Section */}
                <div>
                    <label className="detail-label">External User ID</label>
                    <div className="input-group">
                        <div className="user-id-display">
                            {externalUserId || 'Not assigned'}
                        </div>
                        <button
                            onClick={() => handleCopy(externalUserId, setCopiedUserId)}
                            className="copy-btn"
                            title="Copy User ID"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    {copiedUserId && <span className="copy-success">Copied to clipboard!</span>}
                    <p className="helper-text">
                        Use this ID to identify your end-users in gateway requests.
                    </p>
                </div>

                {/* Integration Snippet */}
                <div>
                    <label className="detail-label">Integration Example</label>
                    <div className="code-block">
                        <pre className="code-content">
                            {curlCommand}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionDetails;
