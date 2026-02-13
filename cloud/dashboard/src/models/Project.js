import { ProjectSettings } from './ProjectSettings.js';
import { AuthConfig } from './AuthConfig.js';
import { Log } from './Log.js';

export class Project {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.settings = new ProjectSettings(data.settings || {});
        this.authConfigs = (data.authConfigs || []).map(ac => new AuthConfig(ac));
        this.logs = (data.logs || []).map(log => new Log(log));
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            settings: this.settings.toJSON(),
            authConfigs: this.authConfigs.map(ac => ac.toJSON()),
            logs: this.logs.map(log => log.toJSON())
        };
    }

    static fromJSON(json) {
        return new Project(json);
    }
}
