import React from 'react';
import { useStore } from '../../../store/useStore';
import { Sparkles, Info, Globe } from 'lucide-react';

export const AISettings: React.FC = () => {
    return (
        <div className="settings-tab-content ai-settings">
            <div className="ai-settings-layout">
                <div className="ai-sidebar">
                    <div className="ai-brand-card">
                        <div className="ai-icon-large">
                            <Sparkles size={48} color="#FF4D4D" />
                        </div>
                        <h2>Octomus AI</h2>
                        <p>Unlock the power of AI on your Mac. Write smarter, code faster, and answer questions quicker with Octomus AI.</p>
                        <div className="ai-status-toggle">
                            <div className="toggle-pill active"></div>
                        </div>
                    </div>

                    <div className="ai-pro-card">
                        <div className="pro-badge">Pro</div>
                        <h3>Upgrade for unlimited messages</h3>
                        <p>Start a 14-day free trial</p>
                    </div>
                </div>

                <div className="ai-main-settings">
                    <div className="settings-group">
                        <div className="settings-row">
                            <div className="settings-label">Quick AI</div>
                            <div className="settings-control">
                                <span className="settings-description">Get instant AI responses directly from the root search</span>
                            </div>
                        </div>

                        <div className="settings-row">
                            <div className="settings-label">Trigger</div>
                            <div className="settings-control">
                                <select className="settings-select">
                                    <option>Tab to Ask AI</option>
                                    <option>Type @ to Ask AI</option>
                                </select>
                                <div className="checkbox-row">
                                    <input type="checkbox" defaultChecked />
                                    <span>Show Ask AI hint in root search</span>
                                </div>
                            </div>
                        </div>

                        <div className="settings-row">
                            <div className="settings-label">Quick AI Model</div>
                            <div className="settings-control">
                                <select className="settings-select">
                                    <option>GPT-4o mini</option>
                                    <option>GPT-4o</option>
                                    <option>Claude 3.5 Sonnet</option>
                                </select>
                                <div className="checkbox-row">
                                    <input type="checkbox" defaultChecked />
                                    <span>Web Search</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="settings-group">
                        <div className="settings-row">
                            <div className="settings-label">AI Chat</div>
                            <div className="settings-control">
                                <span className="settings-description">Dedicated chat window for longer conversations with AI</span>
                            </div>
                        </div>

                        <div className="settings-row">
                            <div className="settings-label">Hotkey</div>
                            <div className="settings-control">
                                <div className="hotkey-record">Record Hotkey</div>
                            </div>
                        </div>

                        <div className="settings-row">
                            <div className="settings-label">Start New Chat</div>
                            <div className="settings-control">
                                <select className="settings-select">
                                    <option>After 5 minutes</option>
                                    <option>After 1 hour</option>
                                    <option>Daily</option>
                                    <option>Never</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
