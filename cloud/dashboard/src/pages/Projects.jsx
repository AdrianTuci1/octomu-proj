import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { api, QueryBuilder } from '../services/index.js';
import { Plus, Grid as GridIcon } from 'lucide-react';
import './Projects.css';


const Projects = () => {
    const { currentOrg, selectProject } = useWorkspace();
    const navigate = useNavigate();
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProjects = async () => {
            if (currentOrg) {
                setLoading(true);
                try {
                    const query = new QueryBuilder()
                        .where('orgId', currentOrg.id)
                        .orderBy('createdAt', 'desc')
                        .build();
                    const data = await api.projects.list(query);
                    setProjects(data);
                } catch (error) {
                    console.error("Failed to fetch projects", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProjects();
    }, [currentOrg]);

    const handleProjectClick = (projectId) => {
        selectProject(projectId);
        if (currentOrg) {
            navigate(`/${currentOrg.id}/${projectId}/overview`);
        }
    };

    if (!currentOrg) return <div>Loading...</div>;
    if (loading) return <div>Loading projects...</div>;

    return (
        <div className="projects-page">
            <div className="projects-header">
                <h1 className="projects-title">Projects</h1>
                <button
                    className="create-project-btn"
                    onClick={() => navigate(`/${currentOrg.id}/projects/new`)}
                >
                    <Plus size={16} />
                    Create New Project
                </button>
            </div>

            {projects.length > 0 ? (
                <div className="projects-table-container">
                    <table className="projects-table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
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
            ) : (
                <div className="empty-state-container">
                    <div className="empty-state-content">
                        <h2 className="empty-state-title">No projects found</h2>
                        <p className="empty-state-description">
                            Get started by creating your first project in this organization.
                        </p>
                        <div className="centered-action">
                            <button
                                className="primary-btn"
                                onClick={() => navigate(`/${currentOrg.id}/projects/new`)}
                            >
                                <Plus size={16} />
                                Create New Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
