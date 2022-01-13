//npm modules
const express = require('express')
//router creation
const authRouter = express.Router()
//controllers
const authController = require('../controllers/authCtrl')
//routers 
authRouter.post('/login',authController.login)
authRouter.post('/register', authController.register)
authRouter.post('/loginAdmPlaform', authController.logInAdministrativePlatform)
//exporting router
module.exports = authRouter


