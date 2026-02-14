import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-main">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="logo-container">
                            <img src="/logo.png" alt="Octomus Logo" className="footer-logo" />
                            <span className="logo-text">Octomus</span>
                        </div>
                        <p className="footer-tagline">
                            The simple Model Context Protocol gateway.
                        </p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <a href="#how-it-works">How it works</a>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#marketplace">Marketplace</a>
                        </div>
                        <div className="footer-column">
                            <h4>Resources</h4>
                            <a href="#docs">Documentation</a>
                            <a href="#mcp">What is MCP?</a>
                            <a href="#blog">Blog</a>
                        </div>
                        <div className="footer-column">
                            <h4>Company</h4>
                            <a href="#about">About</a>
                            <a href="https://github.com/octomus">GitHub</a>
                            <a href="#twitter">Twitter</a>
                            <a href="#contact">Contact</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Octomus. All rights reserved.</p>
                    <div className="footer-secondary-links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
