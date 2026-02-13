import { BaseService } from './BaseService.js';
import { Organization } from '../models/index.js';

export class OrganizationsService extends BaseService {
    constructor(dataStore) {
        super(dataStore, Organization);
    }
}
