export class QueryBuilder {
    constructor() {
        this.params = {
            filters: {},
            sort: null,
            limit: null,
            page: null
        };
    }

    where(key, value) {
        this.params.filters[key] = value;
        return this;
    }

    orderBy(key, direction = 'asc') {
        this.params.sort = { key, direction };
        return this;
    }

    limit(count) {
        this.params.limit = count;
        return this;
    }

    page(pageNumber) {
        this.params.page = pageNumber;
        return this;
    }

    build() {
        return this.params;
    }
}
