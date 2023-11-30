const catchAsync = require('../utils/catchAsync')
const Tour = require('../models/tourModel')

exports.overview = catchAsync(async (req, res, next) => {

    // 1) Load all tours
    const tours = await Tour.find();

    // 2) Create Overview Template
    // 3) Render tours data in the template

    res.status(200).render('overview', {
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Load/query tour
    const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
        path: 'review',
        fields: 'review rating user'
    });


    // 2) Create tour Template
    // 3) Render tours data in the template
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {



    res.status(200).render('login', {
        title: `Log into your account`,
    });
});

exports.accountDetails = catchAsync(async (req, res, next) => {



    res.status(200).render('account', {
        title: `Account`
    });
});
