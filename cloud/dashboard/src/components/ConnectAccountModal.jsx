import { X, Github } from 'lucide-react';
import './ConnectAccountModal.css';
import { useState } from 'react';

const ConnectAccountModal = ({ isOpen, onClose, config }) => {
    const [externalUserId, setExternalUserId] = useState('pg-test-a8838117-879c-407d-aad7-b25ae0c52326');

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="modal-icon-box">
                            <Github size={24} />
                        </div>
                        <div className="modal-title-group">
                            <h3 className="modal-title">{config?.name || 'mcp_github-ceobxg'}</h3>
                            <p className="modal-subtitle">Connect an account</p>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="modal-form-group">
                        <label className="modal-label">
                            External User ID <span className="required-star">*</span>
                        </label>
                        <p className="modal-description">
                            Unique id used to identify the user in your system. <a href="#" className="modal-link">Learn more</a>
                        </p>
                        <input
                            type="text"
                            className="modal-input"
                            value={externalUserId}
                            onChange={(e) => setExternalUserId(e.target.value)}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="modal-primary-btn" onClick={onClose}>
                        Connect Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectAccountModal;
