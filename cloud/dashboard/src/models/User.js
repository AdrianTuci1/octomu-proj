export class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.email = data.email || '';
        this.name = data.name || '';
        this.organizations = (data.organizations || []).map(org => new Organization(org));
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            organizations: this.organizations.map(org => org.toJSON())
        };
    }

    static fromJSON(json) {
        return new User(json);
    }
}

// Circular dependency handling if needed, usually passed in constructor or hydration method
import { Organization } from './Organization.js';
