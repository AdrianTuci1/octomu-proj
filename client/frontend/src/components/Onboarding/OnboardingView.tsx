import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowRight, ArrowLeft, Sparkles, Puzzle, Cloud, Check, X } from 'lucide-react';
import { Events } from '@wailsio/runtime';
import './OnboardingView.css';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.FC<any>;
    content: React.ReactNode;
}

export const OnboardingView: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const { core } = useStore();

    const steps: OnboardingStep[] = [
        {
            id: 'welcome',
            title: 'Welcome to Octomus',
            description: 'Your AI-powered command center',
            icon: Sparkles,
            content: (
                <div className="onboarding-welcome">
                    <div className="welcome-icon">
                        <Sparkles size={64} />
                    </div>
                    <h2>Welcome to Octomus</h2>
                    <p>Octomus is your AI-powered productivity launcher. Let's get you set up in just a few steps.</p>
                    <div className="welcome-features">
                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <span>Quick Commands</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🤖</span>
                            <span>AI Assistant</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🔌</span>
                            <span>Extensions</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'shortcuts',
            title: 'Keyboard Shortcuts',
            description: 'Learn the essential shortcuts',
            icon: Puzzle,
            content: (
                <div className="onboarding-shortcuts">
                    <h2>Essential Shortcuts</h2>
                    <p>Master these shortcuts to navigate Octomus efficiently.</p>
                    <div className="shortcuts-list">
                        <div className="shortcut-item">
                            <kbd>⌘</kbd> + <kbd>Space</kbd>
                            <span>Open Octomus</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Esc</kbd>
                            <span>Close / Go back</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>↑</kbd> <kbd>↓</kbd>
                            <span>Navigate results</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Enter</kbd>
                            <span>Select item</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>⌘</kbd> + <kbd>,</kbd>
                            <span>Open Settings</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Tab</kbd>
                            <span>Switch to chat mode</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'ai',
            title: 'AI Features',
            description: 'Set up your AI assistant',
            icon: Sparkles,
            content: (
                <div className="onboarding-ai">
                    <h2>AI Assistant</h2>
                    <p>Octomus comes with a powerful AI assistant. Configure your AI preferences.</p>
                    <div className="ai-options">
                        <div className="ai-option">
                            <div className="ai-option-header">
                                <Check size={16} className="check-icon" />
                                <span>Enable AI Suggestions</span>
                            </div>
                            <p>Get intelligent suggestions as you type</p>
                        </div>
                        <div className="ai-option">
                            <div className="ai-option-header">
                                <Check size={16} className="check-icon" />
                                <span>Chat Mode</span>
                            </div>
                            <p>Have conversations with AI to accomplish tasks</p>
                        </div>
                        <div className="ai-option">
                            <div className="ai-option-header">
                                <Check size={16} className="check-icon" />
                                <span>Context Awareness</span>
                            </div>
                            <p>AI understands your current context for better responses</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'cloud',
            title: 'Cloud Sync',
            description: 'Optional cloud features',
            icon: Cloud,
            content: (
                <div className="onboarding-cloud">
                    <h2>Cloud Sync (Optional)</h2>
                    <p>Sync your settings and preferences across devices.</p>
                    <div className="cloud-benefits">
                        <div className="benefit-item">
                            <Check size={16} />
                            <span>Sync extensions and preferences</span>
                        </div>
                        <div className="benefit-item">
                            <Check size={16} />
                            <span>Access from multiple devices</span>
                        </div>
                        <div className="benefit-item">
                            <Check size={16} />
                            <span>Backup your configuration</span>
                        </div>
                    </div>
                    <div className="cloud-cta">
                        <button className="btn-secondary">Sign In Later</button>
                        <button className="btn-primary">Sign In with Account</button>
                    </div>
                </div>
            )
        },
        {
            id: 'complete',
            title: 'All Set!',
            description: 'You\'re ready to go',
            icon: Check,
            content: (
                <div className="onboarding-complete">
                    <div className="complete-icon">
                        <Check size={64} />
                    </div>
                    <h2>You're All Set!</h2>
                    <p>Octomus is ready to boost your productivity.</p>
                    <div className="complete-tips">
                        <p><strong>Tip:</strong> Press <kbd>⌘</kbd> + <kbd>Space</kbd> to open Octomus anytime.</p>
                    </div>
                    <button className="btn-primary btn-large" onClick={() => {
                        core.settings.setOnboardingCompleted(true);
                        // Close the panel and return to compact mode
                        Events.Emit('octomus:close-panel');
                    }}>
                        Start Using Octomus
                    </button>
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        core.settings.setOnboardingCompleted(true);
        // Close the panel and return to compact mode
        Events.Emit('octomus:close-panel');
    };

    const currentStepData = steps[currentStep];
    const CurrentIcon = currentStepData.icon;

    return (
        <div className="onboarding-view">
            <div className="onboarding-header">
                <button className="skip-btn" onClick={handleSkip}>
                    Skip <ArrowRight size={14} />
                </button>
            </div>

            <div className="onboarding-progress">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                    />
                ))}
            </div>

            <div className="onboarding-content">
                {currentStepData.content}
            </div>

            <div className="onboarding-footer">
                <button
                    className="btn-secondary"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                >
                    <ArrowLeft size={16} /> Back
                </button>
                {currentStep < steps.length - 1 && (
                    <button className="btn-primary" onClick={handleNext}>
                        Continue <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};