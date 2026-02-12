import React, { useEffect } from 'react';
import { CATEGORIES } from '../data/mcpData';
import '../marketplace.css';

const Sidebar = ({ selectedCategory, onSelectCategory }) => {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -80% 0px', // Trigger when section hits upper middle
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    onSelectCategory(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        CATEGORIES.forEach((cat) => {
            const element = document.getElementById(cat.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [onSelectCategory]);

    const handleCategoryClick = (id) => {
        onSelectCategory(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="sidebar">
            <FilterSection title="Categories">
                {CATEGORIES.map(cat => (
                    <FilterItem
                        key={cat.id}
                        label={cat.label}
                        active={selectedCategory === cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                    />
                ))}
            </FilterSection>
        </div>
    );
};

const FilterSection = ({ title, children }) => (
    <div className="filter-section">
        <h4 className="filter-title">{title}</h4>
        <div className="filter-list">
            {children}
        </div>
    </div>
);

const FilterItem = ({ label, icon, active, onClick }) => (
    <div
        className={`filter-item ${active ? 'active' : ''}`}
        onClick={onClick}
    >
        {icon && <span className="filter-icon">{icon}</span>}
        <span>{label}</span>
    </div>
);

export default Sidebar;
