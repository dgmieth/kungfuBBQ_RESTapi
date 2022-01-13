//npm modules
const express = require('express')
//router creation
const CookingCalendarRouter = express.Router()
//controllers
const cookingCalendarCtrl = require('../../controllers/cookingCalendarCtrl')
const authController = require('../../controllers/authCtrl')
//routes 
CookingCalendarRouter.get('/activeCookingDatesWithinSixtyDays', authController.isAuthGet, cookingCalendarCtrl.activeCookingDatesWithinSixtyDays)
//exporting router
module.exports = CookingCalendarRouter
