import React from 'react';
import './HeroVisual.css';

const HeroVisual = () => {
    const llms = [
        { name: 'ChatGPT', angle: 0 },
        { name: 'Claude', angle: 120 },
        { name: 'Gemini', angle: 240 },
    ];

    const appsCount = 24;
    const apps = Array.from({ length: appsCount }, (_, i) => ({
        id: i,
        angle: (i * 360) / appsCount,
    }));

    const innerRadius = 120;
    const outerRadius = 220;

    return (
        <div className="hero-visual-container">
            {/* Background Rings */}
            <div className="ring-guide inner-guide"></div>
            <div className="ring-guide outer-guide"></div>

            {/* Lines Connecting Center to LLMs */}
            <svg className="connecting-lines" viewBox="0 0 500 500">
                {llms.map((llm, i) => {
                    // Angles need to be adjusted: 0 should be top ( -90 deg )
                    const angleRad = ((llm.angle - 90) * Math.PI) / 180;
                    const x2 = 250 + innerRadius * Math.cos(angleRad);
                    const y2 = 250 + innerRadius * Math.sin(angleRad);
                    return (
                        <line
                            key={i}
                            x1="250"
                            y1="250"
                            x2={x2}
                            y2={y2}
                            className="line"
                        />
                    );
                })}
            </svg>

            {/* Central Logo */}
            <div className="radial-center">
                <img src="/logo.png" alt="Octomus Logo" />
            </div>

            {/* Intermediate LLM Logos */}
            {llms.map((llm, i) => {
                const angleRad = ((llm.angle - 90) * Math.PI) / 180;
                return (
                    <div
                        key={i}
                        className="inner-ring-item"
                        style={{
                            transform: `translate(
                ${innerRadius * Math.cos(angleRad)}px,
                ${innerRadius * Math.sin(angleRad)}px
              )`
                        }}
                    >
                        <span style={{ fontSize: '10px', opacity: 0.8 }}>{llm.name}</span>
                    </div>
                );
            })}

            {/* Outer App Logos */}
            {apps.map((app) => {
                const angleRad = ((app.angle - 90) * Math.PI) / 180;
                return (
                    <div
                        key={app.id}
                        className="outer-ring-item"
                        style={{
                            transform: `translate(
                ${outerRadius * Math.cos(angleRad)}px,
                ${outerRadius * Math.sin(angleRad)}px
              )`
                        }}
                    >
                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#cbd5e1' }}></div>
                    </div>
                );
            })}
        </div>
    );
};

export default HeroVisual;
