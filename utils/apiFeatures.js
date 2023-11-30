module.exports = class APIfeatures {

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };

        const excludedFields = ['page', 'sort', 'limit', 'fields'];    // filter is not excluded

        excludedFields.forEach(el => delete queryObj[el]);      // diff b/w forEach() and map() function

        // 1) Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));            // Find , Create -- ALL ARE MongoDB OPERATORS/Functions
        return this;
    }

    sort() {
        // 2) Sorting

        // console.log(req.query.sort);
        if (this.queryString.sort) {
            const sort = this.queryString.sort.split(',').join(' ');
            // console.log(sort);
            this.query = this.query.sort(sort);
        }
        else {
            this.query = this.query.sort('createdAt');
        }
        return this;
    }
    limitField() {
        // 3) Field Limiting
        // query = query.select('-createdAt');     // Done permanently on Schema

        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
            // query = query.select('name duration price');
        }
        else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        // 4) Pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 3;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}