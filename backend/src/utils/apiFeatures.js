// Helper lọc, phân trang, sắp xếp cho Prisma
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this._where = {};
    this._searchFields = [];
    this._searchTerm = '';
    this.sortBy = 'createdAt';
    this.sortOrder = 'desc';
    this.page = 1;
    this.limit = 20;
  }

  filter() {
    const excludes = ['page', 'sort', 'limit', 'fields', 'search'];
    for (const key of Object.keys(this.queryString)) {
      if (!excludes.includes(key) && this.queryString[key] !== '' && this.queryString[key] !== undefined) {
        this._where[key] = this.queryString[key];
      }
    }
    return this;
  }

  search(fields = []) {
    this._searchFields = fields;
    this._searchTerm = this.queryString.search || '';
    return this;
  }

  sort() {
    this.sortBy = this.queryString.sort || 'createdAt';
    this.sortOrder = this.queryString.order === 'asc' ? 'asc' : 'desc';
    return this;
  }

  paginate() {
    this.page = parseInt(this.queryString.page, 10) || 1;
    this.limit = parseInt(this.queryString.limit, 10) || 20;
    return this;
  }

  build() {
    let searchWhere = {};
    if (this._searchTerm && this._searchFields.length > 0) {
      searchWhere = {
        OR: this._searchFields.map((field) => ({
          [field]: { contains: this._searchTerm },
        })),
      };
    }

    const mergedWhere = Object.keys(searchWhere).length > 0
      ? { AND: [this._where, searchWhere] }
      : this._where;

    const skip = (this.page - 1) * this.limit;

    this.query = this.query
      .where(mergedWhere)
      .orderBy({ [this.sortBy]: this.sortOrder })
      .skip(skip)
      .take(this.limit);

    return this;
  }

  getWhere() {
    if (this._searchTerm && this._searchFields.length > 0) {
      const searchWhere = {
        OR: this._searchFields.map((field) => ({
          [field]: { contains: this._searchTerm },
        })),
      };
      return Object.keys(this._where).length > 0
        ? { AND: [this._where, searchWhere] }
        : searchWhere;
    }
    return this._where;
  }
}

module.exports = ApiFeatures;
