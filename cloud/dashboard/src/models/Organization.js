import { Project } from './Project.js';

export class Organization {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.projects = (data.projects || []).map(proj => new Project(proj));
    }

    addProject(project) {
        this.projects.push(project instanceof Project ? project : new Project(project));
    }

    removeProject(projectId) {
        this.projects = this.projects.filter(p => p.id !== projectId);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            projects: this.projects.map(p => p.toJSON())
        };
    }

    static fromJSON(json) {
        return new Organization(json);
    }
}
