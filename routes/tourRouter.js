const express = require('express');
const tourController = require('../controllers/tourControllers');
const tourRouter = express.Router();
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')

const reviewRouter = require('./reviewRouter');

tourRouter.param('id', (req, res, next, val) => {            // It is a Middle-ware design for a router params // only router has params
    console.log(`Id is ${val}`);
    // tourController.checkID(val);
    next();
});

const middleware = (req, res, next) => {
    if (req.body.name == null || req.body.price == null) {
        return res.status(400).json({
            status: "fail",
            mesaage: "Missing name or price"
        })
    }
    next();
}


// POST tours/9391aw8/review
// GET tours/9391aw8/review
// GET tours/9391aw8/review/6y7233

// tourRouter.route('/:tourId/review').post(authController.protect,authController.restrictTo('user'),reviewController.postReview)

tourRouter.use('/:tourId/review', reviewRouter);     // Redirect to another router // But the tourId PARAM may not go in next router

tourRouter
    .route('/tour-stats')
    .get(tourController.tourStats);

tourRouter
    .route('/monthly-plan/:year')
    .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

tourRouter
    .route('/top-5-cheap')
    .get(tourController.aliasingTopTours, tourController.getAllTours);


// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi    
tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

tourRouter
    .route('/')
    .get(tourController.getAllTours)
    .post(middleware, authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

tourRouter
    .route('/:id')
    .get(tourController.getATour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour, tourController.uploadTourImages, tourController.resizeTourImages,)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);



module.exports = tourRouter;
