import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './CreateOrganization.css';

const CreateOrganization = () => {
    const navigate = useNavigate();
    const [orgName, setOrgName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!orgName.trim()) return;

        // Mock creation logic
        console.log('Creating organization:', orgName);
        // Successful creation would typically navigate to the new workspace
        // For now, let's just go back to projects
        navigate('/projects');
    };

    return (
        <div className="create-org-page">
            {/* Logo */}
            <div className="create-page-logo">
                <div className="logo-box">
                    <div className="logo-inner"></div>
                </div>
            </div>

            <Link to="/projects" className="back-link">
                <ArrowLeft size={16} />
                <span>Back</span>
            </Link>

            <div className="create-form-container">
                <h1 className="create-title">Create a new organization</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="orgName">
                            Organization name
                        </label>
                        <p className="form-hint">
                            Choose a URL-friendly name for your organization. Use only letters, numbers, and underscores.
                        </p>
                        <input
                            type="text"
                            id="orgName"
                            className="form-input"
                            placeholder="my_awesome_org"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={!orgName.trim()}
                        >
                            Create organization
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrganization;
