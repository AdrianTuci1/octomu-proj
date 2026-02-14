import React from 'react';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="container header-container">
                <div className="header-left">
                    <div className="logo-container">
                        <img src="/logo.png" alt="Octomus Logo" className="header-logo-icon" />
                        <span className="logo-text">Octomus</span>
                    </div>
                    <nav className="nav-links">
                        <a href="#cloud" className="nav-link">Cloud</a>
                        <a href="#open-source" className="nav-link">Open Source</a>
                        <a href="#marketplace" className="nav-link">Marketplace</a>
                        <a href="#pricing" className="nav-link">Pricing</a>
                    </nav>
                </div>

                <div className="header-right">
                    <a href="https://github.com/octomus" className="nav-link github-link" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                    <button className="btn-dashboard">
                        Dashboard <span className="arrow">&gt;</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
