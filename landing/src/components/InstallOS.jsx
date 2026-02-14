import React from 'react';
import './InstallOS.css';

const InstallOS = () => {
    return (
        <section id="open-source" className="install-os">
            <div className="container">
                <div className="install-os-content">
                    <div className="install-os-text">
                        <h2 className="text-gradient">Fully Open Source</h2>
                        <p>
                            Octomus is built on the belief that the tools connecting us to AI should be transparent,
                            customizable, and community-driven. Host your own gateway and keep total control.
                        </p>
                        <div className="install-steps">
                            <div className="install-step">
                                <span className="step-tag"></span>
                                <div className="install-command">
                                    <code>curl -fsSL https://octomus.dev/install | bash</code>
                                </div>
                            </div>
                        </div>
                        <div className="install-actions">
                            <a href="https://github.com/octomus" className="btn-primary" target="_blank" rel="noopener noreferrer">
                                View on GitHub
                            </a>
                            <a href="#docs" className="btn-secondary">
                                Read Self-Hosting Guide
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstallOS;
