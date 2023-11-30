const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel')

// const dotenv = require('dotenv');
// dotenv.config({path : './config.env'});

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        unique: true,
        trim: true,
        minlength: [10, 'The name should atleast have 10 characters'],
        maxlength: [40, 'The name should not have characters more than 40'],
        // validate: [validator.isAlpha, 'Name should contain only letters']
    },
    slug: String,
    rating: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating should be equal or more than 1'],
        max: [5, 'Rating should be equal or less than 5']
    },
    price: {
        type: Number,
        required: [true, 'A tour must have price']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have Maximum Group Size']
    },
    difficulty: {
        type: String,
        required: [true, 'A Tour must have Difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty should be either of easy, medium or difficult'
        }
    },
    summary: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        required: [true, 'A tour must have rating Quantity']
    },
    createdAt: {
        type: Date,
        default: Date.now(),         // JAVASCRIPT in build function Date.now() 
        select: false
    },
    startDates: [Date],
    price: {
        type: Number,
        required: [true, 'A tour must have price']
    },
    PriceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // 'this' only points to current document on NEW document creation
                return val < this.price
            },
            message: 'Discount price ({VALUE}) should be less than price'   // This ({VALUE}) is a mongoose property and NOT Javascript
        }
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have image cover']
    },
    images: [String],
    secret: {
        type: Boolean,
        default: false
    },
    startLocation: {         // Object --- this is a object conatining strings, numbers, etc...
        // GeoJSON
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        description: String,
        coordinates: [Number],
        address: String
    },
    locations: [{           // Array of Objects
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        description: String,
        coordinates: [Number],
        address: String,
        day: Number

    }],
    // guides: Array       // this is an ARRAY of object or anything basically and can be anything
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'       // No need to requre('User') in this document for this statement
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// tourSchema.index({ price: 1 });      // index means remember tour based on index // and index are lined up in ascending or descending order
tourSchema.index({ price: 1, ratingsAverage: -1 });     // 1 for ascending  // -1 for descending //  this is compound index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// const tour1 = new Tour({
//     name:'The forest',
//     price: '397',
//     rating: '4.7'
// });

// tour1.save().then(sav=>{
//     console.log(sav)
// }).catch(err=>{
//     console.log('Error!!',err)
// });

// const tour2 = new Tour({
//     name:'The Hiker forest',
//     price: '297',
// });

// tour2.save().then(sav=>{
//     console.log(sav)
// }).catch(err=>{
//     console.log('Error!!',err)
// });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('review',{           // Indirect Child Referencing used in Parent Referencing
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// DOCUMENT MIDDLEWARE      // runs before .save() and .create()   // not work for .insertMany()
tourSchema.pre('save', function (next) {         // pre(before) saving we dont have document
    this.slug = slugify(this.name, { lower: true });
    // console.log('Saving data')
    // console.log(this);
    next();
});

tourSchema.pre('save', function (next) {
    console.log('Will save document...');
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({              // Here 'this' is QUERY
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
})

// tourSchema.pre('save',async function(next){
//     const guidesPromises = await this.guides.map(async (id)=>( await User.findById(id)));  // This is an array of promises // Hence using await on array won't wait for promise to end
//     this.guides = await Promise.all(guidesPromises);    // This will await each element of array
//     next();
// })

tourSchema.post('save', function (doc, next) {       // post(after) saving we have document
    console.log(doc);
    next();
});

// Query Middleware
// tourSchema.pre('find', function(next){
tourSchema.pre(/^find/, function (next) {       // used for everything starting with find like... fine, findOne, ext. see docs for more on find
    this.find({ secret: { $ne: true } });
    this.start = Date.now();
    next();
});

// tourSchema.pre('findOne', function(next){
//     this.find({secret: {$ne : true}});
//     this.start = Date.now();
//     next();
// });

tourSchema.post('find', function (doc, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(doc);
    next();
});


// Agregation Pipeline Middleware
// tourSchema.pre('aggregate', function (next) {        // as becoming very first stage in aggregation pipeline
//     this.pipeline().unshift({ $match: { secret: { $ne: true } } });     // un shift is used to move to the top
//     console.log(this.pipeline());
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;