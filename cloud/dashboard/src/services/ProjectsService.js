import { BaseService } from './BaseService.js';
import { Project } from '../models/index.js';

export class ProjectsService extends BaseService {
    constructor(dataStore) {
        super(dataStore, Project);
    }

    // Add specific methods here if needed, e.g. getByOrgId
    // BaseService covers list, get, create, update, delete
}
