import { BaseService } from './BaseService.js';
import { AuthConfig } from '../models/index.js';

export class AuthConfigsService extends BaseService {
    constructor(dataStore) {
        super(dataStore, AuthConfig);
    }
}
