import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MCPCard from '../components/MCPCard';
import { CATEGORIES, MCP_DATA } from '../data/mcpData';
import * as LucideIcons from 'lucide-react';
import '../marketplace.css';

const Marketplace = () => {
    const [selectedCategory, setSelectedCategory] = useState("popular");

    const getMCPsByCategory = (catId) => {
        return MCP_DATA.filter(mcp => mcp.category === catId);
    };

    return (
        <div className="marketplace-container">
            <div className="marketplace-wrapper">
                <Sidebar
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
                <div className="marketplace-content">

                    {CATEGORIES.map(cat => {
                        const items = getMCPsByCategory(cat.id);
                        if (items.length === 0) return null;

                        const IconComponent = LucideIcons[cat.icon] || LucideIcons.Box;

                        return (
                            <div key={cat.id} id={cat.id} className="category-section">
                                <div className="category-header">
                                    <div className="category-title-row">
                                        <div className="category-icon-orb">
                                            <IconComponent size={24} />
                                        </div>
                                        <div className="category-text">
                                            <h3>{cat.label}</h3>
                                            <p>{cat.description}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mcp-grid">
                                    {items.map((mcp, idx) => (
                                        <MCPCard key={`${cat.id}-${idx}`} mcp={mcp} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
