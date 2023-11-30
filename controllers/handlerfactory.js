const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const APIFeatures = require('./../utils/apiFeatures');

// CAN ALSO MAKE getAll() (with filters) and getOne()


exports.createOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body);
    res.status(200).json({
        status: "success",
        data: doc
    });


});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
  // console.log('UpdateMe Submitted')
// Don't use this to reset passwords as Validators won't work for anything else of CREATE() and SAVE()
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {

        new: true,
        runValidators: true                     // Important
    });

    if (!doc)
        return next(AppError('No Document exist with this ID', 404));


    res.status(200).json({
        status: "success",
        data: {
            data: doc                           //"<Updated tour data>"     // equivalent to tour: tour
        }
    })

});



exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc)
        return next(AppError('No document exist with this ID', 404));


    res.status(204).json({
        status: "success",
        data: null
    })

});


// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id)

//     if (!tour)
//         return next(AppError('No tour exist with this ID', 404));


//     res.status(204).json({
//         status: "success",
//         data: null
//     })

// });



exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitField().paginate();

    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });