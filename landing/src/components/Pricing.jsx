import React from 'react';
import './Pricing.css';

const PricingCard = ({ tier, price, description, features, buttonText, highlighted }) => (
    <div className={`pricing-card ${highlighted ? 'highlighted' : ''}`}>
        <div className="pricing-tier">{tier}</div>
        <div className="pricing-price">
            <span className="currency">$</span>
            <span className="amount">{price}</span>
            <span className="period">/month</span>
        </div>
        <p className="pricing-description">{description}</p>
        <ul className="pricing-features">
            {features.map((feature, index) => (
                <li key={index}>
                    <span className="check">✓</span> {feature}
                </li>
            ))}
        </ul>
        <button className={highlighted ? 'btn-primary' : 'btn-secondary'}>
            {buttonText}
        </button>
    </div>
);

const Pricing = () => {
    const plans = [
        {
            tier: 'Free',
            price: '0',
            description: 'Perfect for exploring Octomus and local experimentation.',
            features: [
                'Connect up to 3 tools',
                'Local & Cloud models',
                'Community access',
                'Basic Marketplace'
            ],
            buttonText: 'Get Started',
            highlighted: false
        },
        {
            tier: 'Pro',
            price: '29',
            description: 'For power users needing advanced tool connectivity.',
            features: [
                'Unlimited tools',
                'Priority execution',
                'Private MCP servers',
                'Email support',
                'Custom SDK access'
            ],
            buttonText: 'Upgrade to Pro',
            highlighted: true
        },
        {
            tier: 'Enterprise',
            price: '99',
            description: 'Scalable solutions for teams and organizations.',
            features: [
                'Single Sign-On (SSO)',
                'Team collaboration',
                'Dedicated support',
                'Audit logs',
                'SLA guarantees'
            ],
            buttonText: 'Contact Sales',
            highlighted: false
        }
    ];

    return (
        <section id="pricing" className="pricing">
            <div className="container">
                <div className="section-header">
                    <h2 className="text-gradient">Simple Pricing</h2>
                    <p>Transparent plans for every stage of your AI journey.</p>
                </div>
                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <PricingCard key={index} {...plan} />
                    ))}
                </div>
                <div className="pricing-footer">
                    <p>Need something else? Octomus Core is <a href="#open-source">Open Source</a>.</p>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
