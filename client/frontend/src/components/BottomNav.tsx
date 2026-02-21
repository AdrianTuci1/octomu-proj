import React from 'react';
import { useStore } from '../store/useStore';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
    const { currentView, setCurrentView } = useStore();

    return (
        <div className="bottom-nav">
            <button
                className={`nav-item ${currentView === 'snippets' ? 'active' : ''}`}
                onClick={() => setCurrentView('snippets')}
            >
                Snippets
            </button>
            <button
                className={`nav-item ${currentView === 'authorizations' ? 'active' : ''}`}
                onClick={() => setCurrentView('authorizations')}
            >
                Authorizations
            </button>
            <button
                className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
                onClick={() => setCurrentView('history')}
            >
                Execution
            </button>
        </div>
    );
};
