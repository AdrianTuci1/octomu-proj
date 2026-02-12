import React from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import './ProjectSettings.css';

const WebhookSettings = () => {
    return (
        <div className="webhook-settings">
            <h2 className="settings-section-title">Events and Triggers</h2>
            <p className="settings-section-subtitle">Configure webhook endpoints and manage event notifications</p>

            <div className="settings-card webhook-card">
                <div className="card-text-group">
                    <h3 className="card-title">Subscribe to triggers and events via webhooks</h3>
                    <p className="settings-section-subtitle" style={{ margin: 0 }}>
                        Start receiving events via webhooks directly to your application
                    </p>
                </div>
                <button className="subscribe-btn">
                    <Plus size={18} />
                    Subscribe
                </button>
            </div>

            <a href="#" className="inline-link" onClick={(e) => e.preventDefault()}>
                View Webhooks Documentation
                <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
            </a>

            <div className="tip-box">
                <p className="tip-text">
                    <span className="tip-bold">Pro tip:</span> Keep your webhook secret secure and never expose it in client-side code.
                </p>
            </div>
        </div>
    );
};

export default WebhookSettings;
