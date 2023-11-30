const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name']
    },
    email: {
        type: String,
        required: [true, 'User must have a email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'The given email is not valid']
        // validate: {
        //     validator: validator.isEmail(this.email),
        //     message: 'The given email is not valid'
        // }
    },
    photo: {
        type: String, 
        default: 'default.jpg'      // Store path of photo
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'head-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'User must have a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'User must confirm password'],
        // 'this' only works for SAVE and CREATE    // and NOT for modification
        validate: {
            validator: function (val) {
                return this.password === val
            },
            message: 'Both passwords should be same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew)
        return next();

    this.passwordChangedAt = Date.now()-1000;    // -1 second for safety // As token produced should have been produced after password changed time
})

// 'this' can only be used for function(val){...} format and NOT for ES6 function format   (val)=>{...}
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
});

userSchema.pre(/^find/,function(next){
   // this points to the current query
    this.find({ active: {$ne: false} });           // here 'this' is a query   // so we are querying the query
    next();
});

userSchema.methods.checkPasswords = async function (CandidatePassword, userPassword) { // checkPasswords is an instance function so don't need a require() at top
    return await bcrypt.compare(CandidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const passwordChangeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return passwordChangeTime > JWTTimeStamp
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    // Create a random token using inbuilt crypto func
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save this token as encrypted in database
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save the token expiry time
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;       // 10 mins to milliseconds
    console.log({ resetToken }, this.passwordResetToken);
    return resetToken;
}


const User = mongoose.model('User', userSchema);

module.exports = User;
