//npm modules
const express = require('express')
//router creation
const CookingCalendarRouter = express.Router()
//controllers
const cookingCalendarCtrl = require('../../controllers/cookingCalendarCtrl')
const authController = require('../../controllers/authCtrl')
//routes 
CookingCalendarRouter.get('/activeCookingDateWithinNextTwelveMonths', authController.isAuthGet, cookingCalendarCtrl.activeCookingDateWithinNextTwelveMonths)
/*
    TEMPORARY ROUTE DUE TO APPs OLD VERSION
 */
CookingCalendarRouter.get('/activeCookingDatesWithinSixtyDays', authController.isAuthGet, cookingCalendarCtrl.activeCookingDateWithinNextTwelveMonths)
//exporting router
module.exports = CookingCalendarRouter
