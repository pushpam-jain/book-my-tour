const mongoose = require('mongoose');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { token } = require('morgan');
const { util } = require('prettier');
const { promisify } = require('util')         // This ES6 Destructuring // Here we get promisify only from util // we can also do util = require(util) the use util.promisfy
const Email = require('./../utils/email');
const crypto = require('crypto');
const bcrypt = require('bcrypt');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN           // can be 90d OR 1h OR 30m OR 3s
    });
}

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const url = `${req.protocol}://${req.get('host')}/me`;
    // console.log(url);
    await new Email(newUser, url).sendWelcome();

    const token = signToken(newUser._id)

    let cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure:true
        httpOnly: true
    }
    if (process.env.NODE_ENV = 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    newUser.password = undefined;

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
});

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    // check is email and password exist
    if (!email || !password)
        return next(new AppError('Please provide email and password', 400))

    // Check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.checkPasswords(password, user.password))) {          // checkPasswords is an instance function so don't need a require() at top
        return next(new AppError('Email or Password is incorrect', 401))
    }
    // Generate token and send
    const token = signToken(user._id);

    // Send token in cookie
    let cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure:true
        httpOnly: true
    }
    if (process.env.NODE_ENV = 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);  // here this cookie is express's build in function


    // Send respone
    res.status(200).json({
        status: "success",
        token,
        data: {
            user
        }
    })

}

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // check if token is there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log(token);
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token)
        return next(new AppError('You are not logged in! Please login to get access.', 401))

    // check if token is valid
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    // const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET) // used to get promise from a async function. promisify(jwt.verify) is now returns promise

    // check if user still exist    
    const user = await User.findById(decoded.id);
    if (!user)
        return next(new AppError('The user cannot be found', 401));
    // console.log(decoded)

    // check if password was changed recently
    if (user.changedPasswordAfter(decoded.iat))
        return next(new AppError('Password was recently changed! Login again', 401));

    // const passwordChangedAt = user.passwordChangedAt.getTime()/1000;
    // console.log(passwordChangedAt);
    // if(passwordChangedAt>decoded.iat)
    // return next(new AppError('Password was recently changed! Login again',401))

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = user;
    res.locals.user = user;
    next();
})

exports.restrictTo = (...roles) => {                 // (...roles) is used for passing array

    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(new AppError('This is restricted to admin', 403))

        return next();
    }

}

exports.forgotPassword = catchAsync(async (req, res, next) => {

    if (!req.body.email)
        return next(new AppError('Please provide email for password reset!', 401))

    // 1) Check is the user exist for the given email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return next(new AppError('User with email is not there.', 401));

    // 2) Generate token for the user
    const resetToken = user.createPasswordResetToken();


    await user.save({ validateBeforeSave: false });

    // 3) Send token to the user on his email  // Use mailtrap.io and Nodemailer to send email
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your password reset token (valid for 10 minutes)',
        //     message: `To reset your password send a PATCH request with your new password and passwordConfirm to: ${resetURL} \nIf you didn't forget your password, please ignore this email `
        // })
        res.status(200).json({
            status: "success",
            message: "Forgot Password token send to email"
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was error sending the email, try again later!', 500))
    };

    // next();
});


exports.resetPassword = async (req, res, next) => {
    console.log(req.params.token)
    // 1) Get user from the token provided
    const ResetToken = await crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log(ResetToken)
    const user = await User.findOne({ passwordResetToken: ResetToken, passwordResetTokenExpires: { $gt: Date.now() } })
    console.log(user)
    if (!user)
        return next(new AppError('Reset token has expired or is invalid', 400))          // careful while copying token from mailtrap.io

    // 2) Check if token has expired and update password from the database
    // if(user.passwordResetTokenExpires < Date.now())
    // return next(new AppError('The password reset token has expired! Please try again',400))

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    // 3) Change passwordChangedAt property in database 


    // 4) Log the user in and send jwt token for the given user
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
        message: 'Password reset successful '
    })
}

exports.updatePassword = async (req, res, next) => { // Critical thing in updating passwords is RUNNNING VALIDATORS which only works when use SAVE() OR CREATE()
    console.log('Updating password')
    // 1) GET USER FROM COLLECTION
    const user = await User.findById(req.user.id).select('+password');
    // console.log(req.body.oldPassword);
    // console.log(user.password);

    // 2) Check old Password
    if (!(await user.checkPasswords(req.body.oldPassword, user.password)))
        return next(new AppError('The old password is incorrect!'))

    // 3) Update Password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    // console.log(user.passwordConfirm)
    await user.save();

    // 4) Log user again with new password and send jwt again

    const token = signToken(req.user._id)

    // Send token in cookie
    let cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure:true
        httpOnly: true
    }
    if (process.env.NODE_ENV = 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);  // here this cookie is express's build in function


    res.status(200).json({
        status: "success",
        token,
        message: "Password was updated!"
    })

};



// to check if user is logged in before rendering page accordingly
exports.isLoggedIn = async (req, res, next) => {
    // console.log('1')
    try {
        if (req.cookies.jwt) {

            // check if token is valid
            const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)
            // const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET) // used to get promise from a async function. promisify(jwt.verify) is now returns promise
            // console.log('2')
            // check if user still exist   

            // const decoded = await promisify(jwt.verify)(
            //     req.cookies.jwt,
            //     process.env.JWT_SECRET
            // );

            const user = await User.findById(decoded.id);
            if (!user)
                return next();
            // console.log(decoded)
            // console.log('3')
            // check if password was changed recently
            if (user.changedPasswordAfter(decoded.iat))
                return next();
            // console.log('4')

            // GRANT ACCESS TO PROTECTED ROUTE
            res.locals.user = user;         // NOTE: it is 'res' and not 'req' here as this user data will directly given access to renderer pug page
            return next();                  // return is neccesary for no duplicate next calling

        };
    } catch (err) { console.log('5'); return next() }
    // console.log('6');
    next();
};


exports.logout = (req, res) => {

    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        status: "success"
    });

}
