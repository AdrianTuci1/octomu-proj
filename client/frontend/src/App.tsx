import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { MainWindow } from './windows/MainWindow';
import { SettingsWindow } from './windows/SettingsWindow';
import { OnboardingWindow } from './windows/OnboardingWindow';
import './style.css';
import './App.css';

type WindowType = 'launcher' | 'settings' | 'onboarding';

function App() {
    const { core } = useStore();

    // Determine initial window from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const panelParam = urlParams.get('panel');

    let windowType: WindowType = 'launcher';
    if (panelParam === 'settings') windowType = 'settings';
    else if (panelParam === 'onboarding') windowType = 'onboarding';

    useEffect(() => {
        core.marketplace.initialize();
    }, [core.marketplace]);

    const renderWindow = () => {
        switch (windowType) {
            case 'settings':
                return <SettingsWindow />;
            case 'onboarding':
                return <OnboardingWindow />;
            default:
                return <MainWindow />;
        }
    };

    return (
        <>
            {renderWindow()}
        </>
    );
}

export default App;
