const fs = require('fs');
const Tour = require('../models/tourModel');
const { match } = require('assert');
const { error } = require('console');
const APIfeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const handlerfactory = require('./handlerfactory');
const AppError = require('../utils/AppError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );

    next();
});

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkID = (id)=>{
//     if(id>tours.length){ return res.status(404).json({
//         status : "fail",
//         message : "invalid id"
//     });
// }
// };


exports.aliasingTopTours = (req, res, next) => {
    req.query.limit = '5';                          // automatically limiting number of tours in a page
    req.query.sort = '-ratingsAverage,price';       // automatic sorting
    next();     // will take modified req, res object with it to next function-Middleware
}

exports.getAllTours = handlerfactory.getAll(Tour);
// exports.getAllTours = async (req, res) => {
//     // res.status(200).json({
//     //     status: "success",
//     //     time : req.currentTime,
//     //     results : tours.length,
//     //     data: {
//     //         tours            // OR tours : tours    OR    tours : x
//     //     }
//     // })

//     console.log(req.query);

//     try {
//         // const queryObj = { ...req.query };

//         // const excludedFields = ['page', 'sort', 'limit', 'fields'];

//         // excludedFields.forEach(el => delete queryObj[el]);      // diff b/w forEach and map() function

//         // // 1) Filtering
//         // let queryStr = JSON.stringify(queryObj);
//         // queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`);

//         // Tour.find( duration:{ $lte : 3}, price: { $gte: 5});    // here $ is used in mongoDB for operator
//         // console.log(JSON.parse(queryStr));
//         // console.log(queryObj);

//         // let query = Tour.find(JSON.parse(queryStr));            // Find , Create -- ALL ARE MongoDB OPERATORS/Functions

//         // // 2) Sorting
//         // query = query.sort('createdAt');

//         // // console.log(req.query.sort);
//         // if (req.query.sort) {
//         //     const sort = req.query.sort.split(',').join(' ');
//         //     // console.log(sort);
//         //     query = query.sort(sort);
//         // }

//         // // 3) Field Limiting
//         // // query = query.select('-createdAt');     // Done permanently on Schema
//         // query = query.select('-__v');

//         // if (req.query.fields) {
//         //     const fields = req.query.fields.split(',').join(' ');
//         //     query = query.select(fields);
//         //     // query = query.select('name duration price');
//         // }

//         // // 4) Pagination
//         // const page = req.query.page * 1 || 1;
//         // const limit = req.query.limit * 1 || 3;
//         // const skip = (page - 1) * limit;

//         // query = query.skip(skip).limit(limit);

//         // let query = Tour.find();

//         let feature = new APIfeatures(Tour.find(), req.query).filter().sort().limitField().paginate();

//         const tours = await feature.query;

//         // if (tours.length < 1) throw new Error('No document found');

//         res.status(200).json({
//             status: "success",
//             results: tours.length,
//             data: {
//                 tours
//             }
//         })
//     } catch (err) {
//         res.status(404).json({          // OR return next(err) // No need of return as it is last statement
//             status: "fail",
//             message: err
//         })
//     }

// }///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



exports.getATour = handlerfactory.getOne(Tour, { path: 'review' });
// exports.getATour = async (req, res) => {
//     const id = req.params.id * 1;    // string to integer

//     // if(id>console.length) return res.status(404).json({
//     //     status : "fail",
//     //     message : "invalid id"
//     // });

//     // console.log(req.params);
//     // const tour = tours.find(el => el.id == req.params.id);

//     // const tour = tours.find(el => el.id === id);

//     // // console.log(tour)
//     // res.status(200).json({
//     //     // status: "success",
//     //     // data : {
//     //     //     tour
//     //     // }
//     // })

//     try {
//         // const tour = await Tour.findById(req.params.id).populate('guides')
//         // const tour = await Tour.findById(req.params.id).populate({
//         //     path: 'guides',
//         //     select:'-__v -passwordChangedAt'
//         // })
//         const tour = await Tour.findById(req.params.id).populate('review')     // we have done populate in query middleware ('/^find/' hook) -- In tour schema // For GUIDES

//         // or // const tour = await Tour.findOne( _id : req.params.id)

//         if (!tour) {
//             return next(AppError('No tour exist with this ID', 404));           // return is neccessary so that codes below this are not executed
//         }

//         res.status(200).json({
//             status: "success",
//             data: {
//                 tour
//             }
//         })
//     } catch (err) {
//         res.status(400).json({
//             status: "fail",
//             message: err
//         })
//     }
// };///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const catchAsync = fn => {               // Used in catchAsync
//     return (req,res,next) => {
//         fn(req,res,next).catch(next);
//     };
// }


exports.createTour = handlerfactory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//     // console.log(req.body);
//     // let newID = tours[tours.length - 1].id + 1;
//     // const newTour = Object.assign({ id: newID }, req.body);

//     // tours.push(newTour);

//     // fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//     //     if (err) return res.send('Data Not Posted')
//     //     res.status(201).json({
//     //         // status: "success",
//     //         // data: {
//     //         //     tours
//     //         // }
//     //     })
//     // });
//     // console.log(tours);
//     // res.send('Done!!!!!!!!!!')


//     // Using mongoDB database

//     // const tour1 = new Tour({req.body});
//     // tour1.save();

//     //  * FOR SEPERATE ERROR HANDLING *
//     const tour1 = await Tour.create(req.body);
//     res.status(200).json({
//         status: "success",
//         data: {
//             tour1
//         }
//     });
//     // try {
//     //     const tour1 = await Tour.create(req.body);
//     //     res.status(200).json({
//     //         status: "success",
//     //         data: {
//     //             tour1
//     //         }
//     //     });
//     // } catch(err){
//     //     res.status(400).json({
//     //         status: "fail",
//     //         message: err
//     //     })
//     // }

// });/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.updateTour = handlerfactory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {


//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true                     // Important
//     });

//     if (!tour)
//         return next(AppError('No tour exist with this ID', 404));


//     res.status(200).json({
//         status: "success",
//         data: {
//             tour                            //"<Updated tour data>"     // equivalent to tour: tour
//         }
//     })

//     // catch (err) {
//     //     next(err)
//     //     // res.status(400).json({
//     //     //     status: "fail",
//     //     //     message: err
//     //     // })
//     // }

// });///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.deleteTour = handlerfactory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id)

//     if (!tour)
//         return next(AppError('No tour exist with this ID', 404));


//     res.status(204).json({
//         status: "success",
//         data: null
//     })

// });

exports.tourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRating: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            }//,
            // {
            //     $match: { _id : {$ne : 'EASY'}}
            // }
        ]);
        // console.log(stats);
        res.status(200).json({
            status: "success",
            data: {
                stats
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        })
    }
};

exports.getMonthlyPlan = async (req, res) => {
    const year = req.params.year * 1;
    try {
        const plan = await Tour.aggregate([
            { $unwind: '$startDates' },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },

            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTours: { $sum: 1 },
                    tourName: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: { _id: 0 }
            },
            {
                $sort: { numTours: -1 }       // For sorting groups
            }


        ]);

        res.status(200).json({
            status: "success",
            data: {
                plan
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        })
    }
};

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = async (req, res, next) => {       // we have put this index in model --- tourSchema.index({ startLocation: '2dsphere' });
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng.',
                400
            )
        );
    }

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });


    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    })
};



exports.getDistances = catchAsync(async (req, res, next) => {      // we have put this index in model(compulsary for getting distances) --- tourSchema.index({ startLocation: '2dsphere' });

    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng.',
                400
            )
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {                     // Remember this geoNear should be first the very first stage to be used in the aggreagation pipeline // so see one of your middleware in TourSchema for secret tours  -- as that becomes first and gets error in this aggregation pipeline
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {             // to project(display) only these veriables which are mentioned
                distance: 1,        // here 1 means true -- include
                name: 1             // here 1 means true -- include
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });


});



