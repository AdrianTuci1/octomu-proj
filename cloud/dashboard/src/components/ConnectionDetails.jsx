import React, { useState } from 'react';
import { Copy, Eye, EyeOff, Terminal, Bot } from 'lucide-react';
import './ConnectionDetails.css';

const ConnectionDetails = ({ apiKey, externalUserId }) => {
    const [activeTab, setActiveTab] = useState('llm'); // 'llm' or 'sdk'
    const [showApiKey, setShowApiKey] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUserId, setCopiedUserId] = useState(false);
    const [copiedSpec, setCopiedSpec] = useState(false);

    const handleCopy = (text, setCopied) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openApiSpec = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Octomus API",
    "version": "1.0.0",
    "description": "${apiKey || 'YOUR_API_KEY'}"
  },
  "servers": [
    {
      "url": "https://api.octomus.com/v1"
    }
  ],
  "paths": {
    "/sync": {
      "post": {
        "operationId": "sync",
        "parameters": [
          {
            "name": "X-External-User-Id",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string",
              "default": "${externalUserId || 'USER_ID'}"
            }
          }
        ],
        "responses": { "200": { "description": "OK" } }
      }
    },
    "/execute": {
      "post": {
        "operationId": "execute",
        "parameters": [
          {
            "name": "X-External-User-Id",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string",
              "default": "${externalUserId || 'USER_ID'}"
            }
          }
        ],
        "responses": { "200": { "description": "OK" } }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "description": "${apiKey || 'YOUR_API_KEY'}"
      }
    }
  },
  "security": [
    {
      "bearerAuth": []
    }
  ]
}`;

    const curlCommand = `curl -X POST https://api.octomus.com/v1/chat \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "X-External-User-Id: ${externalUserId || 'USER_ID'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "Hello world"}]
  }'`;

    return (
        <div className="connection-details-container">
            <div className="tabs-switcher">
                <button
                    className={`tab-box ${activeTab === 'llm' ? 'active' : ''}`}
                    onClick={() => setActiveTab('llm')}
                >
                    <Bot size={20} />
                    <div className="tab-info">
                        <span className="tab-title">LLM App</span>
                        <span className="tab-desc">Direct integration for AI</span>
                    </div>
                </button>
                <button
                    className={`tab-box ${activeTab === 'sdk' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sdk')}
                >
                    <Terminal size={20} />
                    <div className="tab-info">
                        <span className="tab-title">SDK</span>
                        <span className="tab-desc">For custom code setup</span>
                    </div>
                </button>
            </div>

            <div className="details-spacing">
                {activeTab === 'llm' ? (
                    <div className="tab-content">
                        <div className="instruction-header">
                            <label className="detail-label">OpenAPI Specification</label>
                            <button
                                onClick={() => handleCopy(openApiSpec, setCopiedSpec)}
                                className="copy-btn mini"
                                title="Copy OpenAPI spec"
                            >
                                <Copy size={14} />
                                {copiedSpec ? "Copied!" : "Copy spec"}
                            </button>
                        </div>
                        <p className="helper-text mt-4">
                            Paste this specification into the "Actions" or "Knowledge" section of your LLM or Claude Project.
                        </p>
                        <div className="code-block mt-4">
                            <pre className="code-content">
                                {openApiSpec}
                            </pre>
                        </div>

                    </div>
                ) : (
                    <div className="tab-content">
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
                        <div className="mt-6">
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
                        <div className="mt-6">
                            <label className="detail-label">Integration Example</label>
                            <div className="code-block">
                                <pre className="code-content">
                                    {curlCommand}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectionDetails;
