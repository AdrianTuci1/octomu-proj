export class ProjectSettings {
    constructor(data = {}) {
        this.theme = data.theme || 'light';
        this.notifications = data.notifications !== undefined ? data.notifications : true;
        this.apiKeys = data.apiKeys || [];
    }

    toJSON() {
        return {
            theme: this.theme,
            notifications: this.notifications,
            apiKeys: this.apiKeys
        };
    }

    static fromJSON(json) {
        return new ProjectSettings(json);
    }
}
