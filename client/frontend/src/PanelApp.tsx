import React from 'react';
import { useStore } from './store/useStore';
import { SettingsView } from './components/Settings/SettingsView';
import { OnboardingView } from './components/Onboarding/OnboardingView';
import './style.css';
import './App.css';

function PanelApp() {
    // The panel type is determined by URL param or store state
    const urlParams = new URLSearchParams(window.location.search);
    const panelType = urlParams.get('panel') || 'settings';
    
    return (
        <div className="panel-container">
            {panelType === 'onboarding' ? <OnboardingView /> : <SettingsView />}
        </div>
    );
}

export default PanelApp;