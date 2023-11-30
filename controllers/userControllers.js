const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
// const CatchAsync = require('../utils/catchAsync');
const handlerfactory = require('./handlerfactory');
const AppError = require('./../utils/AppError');
const multer = require('multer');
const sharp = require('sharp');


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {         // cb is call-back
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();     // will store photo in buffer // storing in directory will be done after resizing

// const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {        // cb is call-back
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);        // cb is call-back
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');   // this middleware writes uploaded file name in req.file.filename 

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)      // see sharp documentation on git or its website
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});


exports.getAllUsers = handlerfactory.getAll(User);
// exports.getAllUsers = catchAsync(async (req,res)=>{

//     const users = await User.find();

//     res.status(200).json({
//         status : "success",
//         data: {
//             users
//         }
//     });
// });

exports.createUser = handlerfactory.createOne(User);

// exports.createUser = (req,res) => {
//     res.status(500).json({
//         status : "fail",
//         message : "This route is not yet defined"
//     })
// };


exports.getUser = handlerfactory.getOne(User);
// exports.getUser = (req,res) => {
//     res.status(500).json({
//         status : "fail",
//         message : "This route is not yet defined"
//     })
// };

// NOTE: Don't use this to reset passwords as Validators won't work for anything else of CREATE() and SAVE()
exports.updateUser = handlerfactory.updateOne(User);

// exports.updateUser = (req,res) => {
//     res.status(500).json({
//         status : "fail",
//         message : "This route is not yet defined"
//     })
// };


exports.deleteUser = handlerfactory.deleteOne(User);

// exports.deleteUser = (req,res) => {
//     res.status(500).json({
//         status : "fail",
//         message : "This route is not yet defined"
//     })
// };


const filterObj = (obj, ...allowedFields) => {      // ...allowedFields means take all inputs of the function ahead of these in the array // after taking 'obj' as input take other inputs in an array named allowedFields 
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    console.log(req.file)       // see using POSTMAN
    console.log(req.body)       // see using POSTMAN
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated // example- role: admin
    const filteredBody = filterObj(req.body, 'name', 'email');      // this function is defined above
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true           // confirm password vaalidator won't work for findAndUpdate // works only for SAVEs() and CREATE()
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({

        status: "success",
        data: null

    })

});

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
}