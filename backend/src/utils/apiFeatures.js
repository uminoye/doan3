// Helper lọc, phân trang, sắp xếp cho Prisma
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludes = ['page', 'sort', 'limit', 'fields', 'search'];
    const where = {};
    for (const key of Object.keys(this.queryString)) {
      if (!excludes.includes(key) && this.queryString[key] !== '' && this.queryString[key] !== undefined) {
        where[key] = this.queryString[key];
      }
    }
    if (Object.keys(where).length > 0) {
      this.query = this.query.where(where);
    }
    return this;
  }

  search(fields = []) {
    const search = this.queryString.search;
    if (search && fields.length > 0) {
      this.query = this.query.where({
        OR: fields.map((field) => ({
          [field]: { contains: search, mode: 'insensitive' },
        })),
      });
    }
    return this;
  }

  sort() {
    const sortBy = this.queryString.sort || 'createdAt';
    const order = this.queryString.order === 'asc' ? 'asc' : 'desc';
    this.query = this.query.orderBy({ [sortBy]: order });
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).take(limit);
    return this;
  }
}

module.exports = ApiFeatures;
