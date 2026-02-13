import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    Settings,
    HelpCircle,
    Grid,
    Play,
    ChevronDown,
    ChevronsUpDown,
    Search,
    Check,
    Plus,
    Key,
    Users,
    CreditCard,
    LogOut
} from 'lucide-react';
import './Header.css';



const Header = () => {
    const navigate = useNavigate();
    const { organizations, currentOrg, currentProject, selectOrg, selectProject } = useWorkspace();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleOrgSelect = (org) => {
        selectOrg(org.id);
        navigate(`/${org.id}/projects`);
    };

    const handleProjectSelect = (project) => {
        selectProject(project.id);
        if (currentOrg) {
            navigate(`/${currentOrg.id}/${project.id}/overview`);
        }
        setIsDropdownOpen(false);
    };

    return (
        <header className="app-header">
            {/* Left Section: Logo, Workspace, Nav */}
            <div className="header-left">
                {/* Logo */}
                <div className="logo-container">
                    <div className="logo-box">
                        <div className="logo-inner">
                            <img src='/logo.png' alt="Logo" style={{ width: '28px', height: '28px' }} />
                        </div>
                    </div>
                </div>

                {/* Workspace Selector */}
                <div className="workspace-select-container" ref={dropdownRef}>
                    <div className="workspace-select" onClick={toggleDropdown}>
                        <span>/</span>
                        <span className="workspace-name">
                            {currentOrg ? currentOrg.name : 'Select Org'}
                            {currentProject && <span className="project-breadcrumb"> / {currentProject.name}</span>}
                        </span>
                        <ChevronsUpDown size={14} style={{ opacity: 0.5 }} />
                    </div>

                    {/* Workspace Dropdown */}
                    {isDropdownOpen && (
                        <div className="workspace-dropdown">
                            {/* Organizations Column */}
                            <div className="dropdown-column org-column">
                                <div className="column-header">Organisations</div>
                                <div className="column-list">
                                    {organizations.map(org => (
                                        <div
                                            key={org.id}
                                            className={`dropdown-item ${currentOrg?.id === org.id ? 'active' : ''}`}
                                            onClick={() => handleOrgSelect(org)}
                                        >
                                            <div className="org-avatar"></div>
                                            <span className="item-name">{org.name}</span>
                                            {currentOrg?.id === org.id && <Check size={14} className="check-icon" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="column-footer">
                                    <button className="create-btn" onClick={() => { navigate('/organizations/new'); setIsDropdownOpen(false); }}>
                                        <Plus size={14} />
                                        <span>Create Organisation</span>
                                    </button>
                                </div>
                            </div>

                            {/* Projects Column */}
                            <div className="dropdown-column project-column">
                                <div className="column-header">Projects</div>
                                <div className="column-list">
                                    {currentOrg?.projects.length > 0 ? (
                                        currentOrg.projects.map(project => (
                                            <div
                                                key={project.id}
                                                className={`dropdown-item ${currentProject?.id === project.id ? 'active' : ''}`}
                                                onClick={() => handleProjectSelect(project)}
                                            >
                                                <div className="project-avatar"></div>
                                                <span className="item-name">{project.name}</span>
                                                {currentProject?.id === project.id && <Check size={14} className="check-icon" />}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">No projects found</div>
                                    )}
                                </div>
                                <div className="column-footer">
                                    <button className="create-btn" onClick={() => { navigate('/projects/new'); setIsDropdownOpen(false); }}>
                                        <Plus size={14} />
                                        <span>Create Project</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="header-right">
                <ActionButton
                    icon={<Grid size={14} />}
                    label="All Toolkits"
                    onClick={() => navigate('/marketplace')}
                />
                <ActionButton
                    icon={<HelpCircle size={14} />}
                    label="Support"
                    onClick={() => navigate('/support')}
                />

                {/* Avatar with Context Menu */}
                <div className="user-menu-container" ref={userMenuRef}>
                    <div className="user-avatar" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}></div>

                    {isUserMenuOpen && (
                        <div className="user-context-menu">
                            <div className="user-menu-header">
                                <span className="user-email-full">adrian.tucicovenco@gmail....</span>
                                <span className="user-email-sub">adrian.tucicovenco@gmail.com</span>
                            </div>

                            <div className="user-menu-section">
                                <button
                                    className="user-menu-item"
                                    onClick={() => {
                                        if (currentOrg && currentProject) {
                                            navigate(`/${currentOrg.id}/${currentProject.id}/settings/api-keys`);
                                        }
                                        setIsUserMenuOpen(false);
                                    }}
                                >
                                    <Key size={14} />
                                    <span>API Keys</span>
                                </button>
                                <button
                                    className="user-menu-item"
                                    onClick={() => {
                                        if (currentOrg && currentProject) {
                                            navigate(`/${currentOrg.id}/${currentProject.id}/settings/general`);
                                        }
                                        setIsUserMenuOpen(false);
                                    }}
                                >
                                    <Settings size={14} />
                                    <span>Project Settings</span>
                                </button>
                                <button
                                    className="user-menu-item"
                                    onClick={() => {
                                        if (currentOrg) {
                                            navigate(`/${currentOrg.id}/settings/team`);
                                        }
                                        setIsUserMenuOpen(false);
                                    }}
                                >
                                    <Users size={14} />
                                    <span>Organisation Settings</span>
                                </button>
                                <button
                                    className="user-menu-item"
                                    onClick={() => {
                                        if (currentOrg) {
                                            navigate(`/${currentOrg.id}/settings/billing`);
                                        }
                                        setIsUserMenuOpen(false);
                                    }}
                                >
                                    <CreditCard size={14} />
                                    <span>Billing</span>
                                </button>
                            </div>

                            <div className="user-menu-section logout">
                                <button className="user-menu-item logout-item">
                                    <LogOut size={14} />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};


const ActionButton = ({ icon, label, onClick }) => (
    <button className="action-btn" onClick={onClick}>
        {icon}
        <span>{label}</span>
    </button>
);

export default Header;
