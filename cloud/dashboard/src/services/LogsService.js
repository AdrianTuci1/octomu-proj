import { BaseService } from './BaseService.js';
import { Log } from '../models/index.js';

export class LogsService extends BaseService {
    constructor(dataStore) {
        super(dataStore, Log);
    }
}
