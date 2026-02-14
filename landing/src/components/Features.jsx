import React from 'react';
import './Features.css';

const FeatureCard = ({ icon, title, description }) => (
    <div className="feature-card">
        <div className="feature-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

const Features = () => {
    const features = [
        {
            icon: '🔌',
            title: 'MCP Gateway',
            description: 'The easiest way to bridge your LLM with any external tool or API using the Model Context Protocol.'
        },
        {
            icon: '📦',
            title: 'Tool Marketplace',
            description: 'Browse hundreds of pre-built integrations for databases, local files, and SaaS platforms.'
        },
        {
            icon: '🔒',
            title: 'Privacy First',
            description: 'Run Octomus locally or in our private cloud. Your data and API keys stay under your control.'
        },
        {
            icon: '⚡',
            title: 'One-Click Setup',
            description: 'Import tools from GitHub or npm with a single click. No complex configuration files.'
        },
        {
            icon: '🛠️',
            title: 'SDK for Devs',
            description: 'Build your own custom MCP servers in minutes with our lightweight TypeScript SDK.'
        },
        {
            icon: '🌐',
            title: 'Cloud & OSS',
            description: 'Start for free in the cloud or self-host the entire core platform on your own infrastructure.'
        }
    ];

    return (
        <section id="features" className="features">
            <div className="container">
                <div className="section-header">
                    <h2 className="text-gradient">Powerful Features</h2>
                    <p>Everything you need to build next-gen AI applications with tool access.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
