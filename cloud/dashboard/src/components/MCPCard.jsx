import React from 'react';

const MCPCard = ({ mcp, action }) => {
    // Determine icon to show
    let iconContent;
    if (mcp.icons && mcp.icons.length > 0 && mcp.icons[0].src) {
        iconContent = <img src={mcp.icons[0].src} alt={mcp.name} />;
    } else if (mcp.icon && typeof mcp.icon === 'string' && (mcp.icon.startsWith('http') || mcp.icon.startsWith('/'))) {
        iconContent = <img src={mcp.icon} alt={mcp.name} />;
    } else {
        const emoji = mcp.icon || '📦';
        iconContent = <span style={{ fontSize: '1.5rem' }}>{emoji}</span>;
    }

    return (
        <div className="mcp-card">
            <div className="mcp-header">
                <div className="mcp-icon-wrapper">
                    {iconContent}
                </div>
                <div className="mcp-main-info">
                    <div className="mcp-name-row">
                        <span className="mcp-name">{mcp.name}</span>
                        <svg className="external-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </div>
                    <p className="mcp-description">
                        {mcp.description}
                    </p>
                </div>
            </div>

            <div className="mcp-tags">
                <div className="mcp-tag">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>{mcp.vendor}</span>
                </div>
                {mcp.verified && (
                    <div className="mcp-tag verified">
                        <span>Verified</span>
                    </div>
                )}
            </div>

            <div className="mcp-platforms">
                <div className="platform-tag cursor">
                    <span>Cursor</span>
                </div>
                <div className="platform-tag claude">
                    <span>Claude</span>
                </div>
                <div className="platform-tag windsurf">
                    <span>Windsurf</span>
                </div>
            </div>

            {action}
        </div>
    );
};

export default MCPCard;
