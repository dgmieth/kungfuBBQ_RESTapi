//npm modules
const express = require('express')
//router creation
const indexRouter = express.Router()
//api routers
const UserRouter = require('./apiRouters/userRouter')
const OrderRouter = require('./apiRouters/orderRouter')
const CatoringRouter = require('./apiRouters/catoringRouter')
const CookingCalendarRouter = require('./apiRouters/cookingCalendarRouter')
//controllers
const authController = require('../controllers/authCtrl')
//routers 
indexRouter.use('/user', UserRouter)
indexRouter.use('/order', OrderRouter)
indexRouter.use('/catoring', CatoringRouter)
indexRouter.use('/cookingCalendar', CookingCalendarRouter)
//exporting router
module.exports = indexRouter
