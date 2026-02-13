export class AuthConfig {
    constructor(data = {}) {
        this.id = data.id || null;
        this.provider = data.provider || '';
        this.credentials = data.credentials || {};
        this.status = data.status || 'inactive';
    }

    toJSON() {
        return {
            id: this.id,
            provider: this.provider,
            credentials: this.credentials,
            status: this.status
        };
    }

    static fromJSON(json) {
        return new AuthConfig(json);
    }
}
