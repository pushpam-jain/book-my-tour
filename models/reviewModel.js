// review / rating / created At / ref to tour / ref to user

const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty!']
    },
    rating: {
        type: Number,
        // required: [true, 'It must have a rating'],
        min:1,
        max:5
    },
    createdAt: {
        type: Date,
        default: Date.now // not Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }

},
{
    toJSON: {virtuals: true},       // This for showing virtuals in outputs // as this virtuals are calculated from the other values of model
    toObject: {virtuals: true}
});


reviewSchema.pre(/^find/,function(next){
    this.populate({
        path: 'user',
        select:'name photo',
    })
    // .populate({
    //     path: 'tour',
    //     select: 'name'
    // });

    next();
})


// CREATING STATIC FUNCTIONS
reviewSchema.statics.calcRatingAverage = async function(tourId){
    const stats = await this.aggregate([
      {  $match : {tour: tourId}},
       { $group : {
            _id : `$tourId`, 
            nRating : {$sum : 1},
            ratingAverage : {$avg : '$rating'}
        }}
    ]);
    // console.log(stats);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsQuantity: stats[0].nRating,
          ratingsAverage: stats[0].avgRating
        });
      } else {
        await Tour.findByIdAndUpdate(tourId, {
          ratingsQuantity: 0,           // updating to original one
          ratingsAverage: 4.5
        });
      }
};

reviewSchema.index({ tour: 1, user : 1 },{unique : true});  // for PREVENTING DUPLICATE REVIEWS

reviewSchema.post('save', function(){       // function won't get 'next' because is 'post' middleware
    this.constructor.calcRatingAverage(this.tour);  // this.constructor means 'Review' // we use this because Review(model) is defined in the end of this module(file)
});          // we call the static function in post instead of pre because after pre only the document gets stored in database and then comes in aggraegate pipeline of our code


// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
  });
  
  reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);       // in 'post' also 'this' is query object only
  });   // we call the static function in post instead of pre because after pre only the document gets stored in database and then comes in aggraegate pipeline of our code


const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;