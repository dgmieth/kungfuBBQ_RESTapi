//npm modules
const express = require('express')
//router creation
const UserRouter = express.Router()
//controllers
const UserCtrl = require('../../controllers/userCtrl')
const authController = require('../../controllers/authCtrl')
//routers 
UserRouter.post('/updateInfo', authController.isAuth, UserCtrl.updateInfo)
UserRouter.post('/changePassword', authController.isAuth, UserCtrl.changePassword)
UserRouter.post('/forgotPassword', UserCtrl.forgotPassword) //sends email to recover password
UserRouter.get('/resetPassword', authController.isValidResetPasswordToken, UserCtrl.resetPasswordGet) //renders page to reset password
UserRouter.post('/resetPassword', authController.isAuth, UserCtrl.resetPasswordPost) //resets password
UserRouter.get('/renewToken', authController.isAuthGet, UserCtrl.renewToken) 
//exporting router
module.exports = UserRouter