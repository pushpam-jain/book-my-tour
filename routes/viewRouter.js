const express = require('express');
const viewController = require('./../controllers/viewController');
const Router = express.Router();

const authController = require('./../controllers/authController')
// const bookingController = require('./../controllers/bookingController')


Router.get('/me', authController.protect, viewController.accountDetails);

Router.use(authController.isLoggedIn);

Router.get('/', viewController.overview);

Router.get('/tour/:tourSlug', viewController.getTour);

Router.get('/login', viewController.getLoginForm);

module.exports = Router;