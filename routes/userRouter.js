const express = require('express');
const userController = require('../controllers/userControllers');
const router = express.Router();
const authController = require('../controllers/authController');
// const multer = require('multer');

// const upload = multer({dest: 'public/img/users'})       // used as middleware to store PHOTO in destination(as here in dest) and its INFO in req.file

router.post('/signup', authController.signUp)
.post('/login', authController.login)
.get('/logout', authController.logout)

router.post('/forgotPassword', authController.forgotPassword)
.post('/resetPassword/:token', authController.resetPassword);


// Protect all routes after this middleware
router.use(authController.protect);

router
.patch('/updateMyPassword',authController.updatePassword)
.patch('/updateMe', userController.uploadUserPhoto,userController.resizeUserPhoto, userController.updateMe)
.delete('/deleteMe', userController.deleteMe)
.get('/me',userController.getMe,userController.getUser);


router.use(authController.restrictTo('admin'));

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports = router;
