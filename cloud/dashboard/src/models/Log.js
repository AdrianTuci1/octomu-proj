export class Log {
    constructor(data = {}) {
        this.id = data.id || null;
        this.timestamp = data.timestamp || new Date().toISOString();
        this.level = data.level || 'info';
        this.message = data.message || '';
        this.metadata = data.metadata || {};
    }

    toJSON() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            level: this.level,
            message: this.message,
            metadata: this.metadata
        };
    }

    static fromJSON(json) {
        return new Log(json);
    }
}
