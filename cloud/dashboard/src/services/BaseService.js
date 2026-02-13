export class BaseService {
    constructor(dataStore, modelClass) {
        this.dataStore = dataStore;
        this.modelClass = modelClass;
    }

    async list(query = {}) {
        await this._delay();
        let results = [...this.dataStore];

        // Apply filters
        if (query.filters) {
            Object.entries(query.filters).forEach(([key, value]) => {
                results = results.filter(item => item[key] === value);
            });
        }

        // Apply sorting
        if (query.sort) {
            const { key, direction } = query.sort;
            results.sort((a, b) => {
                if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
                if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Apply pagination/limits - simplified for mock
        if (query.limit) {
            results = results.slice(0, query.limit);
        }

        return results.map(item => new this.modelClass(item));
    }

    async get(id) {
        await this._delay();
        const item = this.dataStore.find(i => i.id === id);
        if (!item) throw new Error(`${this.modelClass.name} with ID ${id} not found`);
        return new this.modelClass(item);
    }

    async create(data) {
        await this._delay();
        const newItem = new this.modelClass({ ...data, id: this._generateId() });
        this.dataStore.unshift(newItem); // Add to beginning
        return newItem;
    }

    async update(id, data) {
        await this._delay();
        const index = this.dataStore.findIndex(i => i.id === id);
        if (index === -1) throw new Error(`${this.modelClass.name} with ID ${id} not found`);

        // Merge updates
        const updatedItem = { ...this.dataStore[index], ...data };
        this.dataStore[index] = updatedItem;

        return new this.modelClass(updatedItem);
    }

    async delete(id) {
        await this._delay();
        const index = this.dataStore.findIndex(i => i.id === id);
        if (index === -1) throw new Error(`${this.modelClass.name} with ID ${id} not found`);

        this.dataStore.splice(index, 1);
        return true;
    }

    _delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    _generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}
