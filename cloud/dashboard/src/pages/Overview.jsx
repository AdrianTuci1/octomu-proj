import React from 'react';
import ConnectionDetails from '../components/ConnectionDetails';
import { Grid, Users, Book, MessageCircle, ExternalLink, Cpu } from 'lucide-react';
import './Overview.css';

const Overview = () => {
    // Mock data
    const mockApiKey = "sk-live-51Ms...3x4y";
    const mockExternalUserId = "user_123456";


    const exploreItems = [
        {
            icon: <Grid size={20} />,
            title: "Browse Toolkits",
            description: "Explore our toolkits for more than 500 services. See supported tools, triggers, and schema details.",
            link: "#"
        },
        {
            icon: <Users size={20} />,
            title: "Invite a team member",
            description: "Invite a team member to your organisation to collaborate on the project. They will receive an email with a link to join the organisation.",
            link: "#"
        },
        {
            icon: <Book size={20} />,
            title: "Documentation and SDKs",
            description: "Get started with Composio SDK, guides, and best practices in building AI Agents with Composio tools.",
            link: "#"
        },
        {
            icon: <MessageCircle size={20} />,
            title: "Community",
            description: "Join our community to get help, share your work, and connect with other developers.",
            link: "#"
        }
    ];

    return (
        <div className="overview-page">
            <h1 className="page-title">Get started with building smarter agents</h1>
            <p className="page-subtitle">Jump into the playground and explore powerful AI tools in action, or head straight to setting up Auth for toolkits</p>

            <div className="overview-grid">
                {/* Left Column */}
                <div className="overview-left-col">
                    <ConnectionDetails
                        apiKey={mockApiKey}
                        externalUserId={mockExternalUserId}
                    />
                </div>

                {/* Right Column - Explore the Platform */}
                <div className="overview-right-col">
                    <h2 className="section-header">Explore the Platform</h2>
                    <div className="explore-list">
                        {exploreItems.map((item, index) => (
                            <a key={index} href={item.link} className="explore-item">
                                <div className="explore-icon-wrapper">
                                    {item.icon}
                                </div>
                                <div className="explore-content">
                                    <div className="explore-header">
                                        <h3 className="explore-title">{item.title}</h3>
                                        <ExternalLink size={14} className="explore-link-icon" />
                                    </div>
                                    <p className="explore-description">{item.description}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div >
            </div >
        </div >
    );
};

export default Overview;
