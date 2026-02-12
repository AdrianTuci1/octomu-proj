import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Github, Slack, Grid } from 'lucide-react';
import './CreateProject.css';

const CreateProject = () => {
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState('');
    const [configs, setConfigs] = useState({
        gmail: false,
        github: false,
        slack: false,
        linear: false
    });

    const toggleConfig = (key) => {
        setConfigs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        // Mock creation logic
        console.log('Creating project:', projectName, configs);
        navigate('/overview');
    };

    return (
        <div className="create-project-page">
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
                <h1 className="create-title">Create a new project</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="projectName">
                            Project name
                        </label>
                        <p className="form-hint">
                            Choose a URL-friendly name for your project. Use only letters, numbers, and underscores.
                        </p>
                        <input
                            type="text"
                            id="projectName"
                            className="form-input"
                            placeholder="my_awesome_project"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            required
                        />
                    </div>

                    <div className="auth-config-section">
                        <h3 className="auth-config-title">Default Auth Config (optional)</h3>
                        <p className="auth-config-hint">
                            Select auth config to set up with your project. You can always add or remove these later.
                        </p>

                        <div className="auth-config-list">
                            <AuthConfigItem
                                icon={<Mail size={16} color="#EA4335" />}
                                name="Gmail"
                                checked={configs.gmail}
                                onChange={() => toggleConfig('gmail')}
                            />
                            <AuthConfigItem
                                icon={<Github size={16} />}
                                name="Github"
                                checked={configs.github}
                                onChange={() => toggleConfig('github')}
                            />
                            <AuthConfigItem
                                icon={<Slack size={16} color="#4A154B" />}
                                name="Slack"
                                checked={configs.slack}
                                onChange={() => toggleConfig('slack')}
                            />
                            <AuthConfigItem
                                icon={<Grid size={16} color="#5E6AD2" />}
                                name="Linear"
                                checked={configs.linear}
                                onChange={() => toggleConfig('linear')}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={!projectName.trim()}
                        >
                            Create project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AuthConfigItem = ({ icon, name, checked, onChange }) => (
    <div className="auth-config-item">
        <div className="auth-config-info">
            <div className="auth-icon-wrapper">
                {icon}
            </div>
            <span className="auth-config-name">{name}</span>
        </div>
        <label className="switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="slider"></span>
        </label>
    </div>
);

export default CreateProject;
