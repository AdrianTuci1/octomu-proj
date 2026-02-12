import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { Plus, Grid as GridIcon } from 'lucide-react';
import './Projects.css';


const Projects = () => {
    const { currentOrg, selectProject } = useWorkspace();
    const navigate = useNavigate();

    const handleProjectClick = (projectId) => {
        selectProject(projectId);
        navigate('/overview');
    };

    if (!currentOrg) return <div>Loading...</div>;


    return (
        <div className="projects-page">
            <div className="projects-header">
                <h1 className="projects-title">Projects</h1>
                <button
                    className="create-project-btn"
                    onClick={() => navigate('/projects/new')}
                >
                    <Plus size={16} />
                    Create New Project
                </button>
            </div>

            <div className="projects-table-container">
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrg.projects.map(project => (
                            <tr
                                key={project.id}
                                onClick={() => handleProjectClick(project.id)}
                                className="project-row"
                            >
                                <td>
                                    <div className="project-name">
                                        <div className="project-icon">
                                            <GridIcon size={14} />
                                        </div>
                                        {project.name}
                                    </div>
                                </td>
                                <td>{project.createdAt || 'Feb 11, 2026'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Projects;
