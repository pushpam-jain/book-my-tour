const Review = require('./../models/reviewModel');
const CatchAsync = require('./../utils/catchAsync');
const handlerfactory = require('./handlerfactory');



exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
  };
  
  exports.getAllReviews = handlerfactory.getAll(Review);
  exports.getReview = handlerfactory.getOne(Review);
  exports.postReview = handlerfactory.createOne(Review);
  exports.updateReview = handlerfactory.updateOne(Review);
  exports.deleteReview = handlerfactory.deleteOne(Review);




// exports.getAllReviews = CatchAsync(async (req, res, next) => {
//     // Allow nested Routes          // Review router is nESTED in TOUR ROUTER
//     let filter = {};
//     if (req.params.tourId) filter = { tour: 'req.params.tourId' };
//     const reviews = await Review.find();

//     res.status(200).json({
//         status: "success",
//         reviews
//     });
// });



// exports.postReview = CatchAsync(async (req, res, next) => {
//     // Allow nested Routes 
//     if (!req.body.tour) req.body.tour = req.params.tourId;      // To use handlerfactory.createOne() put these two lines in another middleware(and mention in the router)
//     if (!req.body.user) req.body.user = req.user.id;

//     const review = await Review.create(req.body);

//     res.status(200).json({
//         status: "success",
//         review
//     });
// });

// exports.getReview = CatchAsync(async (req, res, next) => {
//     const review = await Review.findById(req.params.id);

//     res.status(200).json({
//         status: "success",
//         review
//     });
// });




// exports.deleteReview = handlerfactory.deleteOne(Review);

// // exports. deleteReview = CatchAsync(async (req,res,next)=>{
// //     const review = await Review.deleteOne({_id: req.params.id});

// //     res.status(200).json({
// //         status: "success",
// //         message: "Review deleted successfully"
// //     });
// // });


// exports.updateReview = handlerfactory.updateOne(Review);

// exports.updateReview = CatchAsync(async (req, res, next) => {
//     const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,      // returns new updated document instead of old document // use false to get old document returned
//         runValidators: true
//     });

//     res.status(200).json({
//         status: "success",
//         review
//     });
// });

