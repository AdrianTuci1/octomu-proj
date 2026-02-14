import HeroVisual from './HeroVisual';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container">
                <div className="hero-content">
                    <h1>
                        Connect LLMs to Any Tool
                    </h1>
                    <p>
                        Intelligence is better with context. Connect your LLM to the world’s tools with the simplest MCP gateway ever built. Zero dev knowledge required.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary">
                            Start Building
                        </button>
                        <button className="btn-secondary">
                            View Documentation
                        </button>
                    </div>
                </div>
            </div>

            <div className="hero-frame">
                <div className="container">
                    <div className="hero-visual">
                        <HeroVisual />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
