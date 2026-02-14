import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="how-it-works">
            <div className="container">
                <div className="how-it-works-grid">
                    <div className="how-it-works-content">
                        <h2 className="text-gradient">How it Works</h2>
                        <h3>OpenAPI & LLM Empowerment</h3>
                        <p>
                            We use the <strong>OpenAPI standard</strong> to bridge your favorite tools. Simply provide the specification to an LLM, and it will be empowered to act on your behalf within your authorized applications.
                        </p>
                        <p>
                            Once connected, your AI assistant can execute tasks, sync data, and manage workflows across all integrated platforms with complete security and precision.
                        </p>
                        <div className="how-it-works-highlights">
                            <div className="highlight-item">
                                <span className="check">✓</span> Dynamic Tool Discovery
                            </div>
                            <div className="highlight-item">
                                <span className="check">✓</span> Secure OAuth2 Authentication
                            </div>
                            <div className="highlight-item">
                                <span className="check">✓</span> Full LLM Autonomy
                            </div>
                        </div>
                    </div>
                    <div className="how-it-works-preview">
                        <div className="code-window">
                            <div className="code-header">
                                <div className="dots">
                                    <div className="dot red"></div>
                                    <div className="dot yellow"></div>
                                    <div className="dot green"></div>
                                </div>
                                <span className="file-name">openapi.yaml</span>
                            </div>
                            <pre className="code-content">
                                <code>{`openapi: 3.0.0
info:
  title: Octomus Tool API
  version: 1.0.0
paths:
  /execute-action:
    post:
      summary: LLM Action
      operationId: executeAction
      responses:
        '200':
          description: Success`}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
