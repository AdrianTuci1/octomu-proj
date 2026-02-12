import React from 'react';
import { Search, Copy, Plus } from 'lucide-react';

const ActiveTriggersView = ({ config, copyToClipboard }) => {
    return (
        <div className="tab-content triggers-tab">
            <div className="tab-header">
                <h3 className="tab-title">Triggers</h3>
                <div className="tab-actions">
                    <div className="ui-input-group">
                        <select className="ui-select">
                            <option>Connected Account ID</option>
                        </select>
                        <div className="ui-search">
                            <Search size={14} />
                            <input type="text" placeholder="Search by Connected Account ID" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State with Grid Background */}
            <div className="triggers-empty-state">
                <div className="grid-background"></div>
                <div className="empty-content">
                    <h2>No triggers yet!</h2>
                    <p>Create a trigger to automate your workflows.</p>
                    <div className="empty-actions">
                        <button className="secondary-btn" onClick={() => copyToClipboard(config.id)}>
                            <Copy size={14} /> Copy Auth Config ID
                        </button>
                        <button className="primary-btn">
                            <Plus size={14} /> Create Trigger
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveTriggersView;
