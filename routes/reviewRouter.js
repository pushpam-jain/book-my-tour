const express = require('express');


const reviewController = require('../controllers/reviewController')

const authController = require('../controllers/authController')


const Router = express.Router({mergeParams: true});     // To get PARAMS from previous router/app in the way

//  POST tours/78923awq/review
//  POST review
//  GET tours/78923awq/review

// This all will go in route('/')


// Protect all routes after this middleware
Router.use(authController.protect);

Router.route('/')
.get(reviewController.getAllReviews)
.post(authController.restrictTo('user'),reviewController.setTourUserIds,reviewController.postReview);


Router.route('/:id')
.get(reviewController.getReview)
.delete(authController.restrictTo('user','admin'),reviewController.deleteReview)
.patch(authController.restrictTo('user','admin'),reviewController.updateReview);


module.exports = Router;        // Important