//npm modules
const express = require('express')
//router creation
const sauseFundingRouter = express.Router()
//controllers
const sauseFundingCtrl = require('../../controllers/sauseFundingCtrl')
const authController = require('../../controllers/authCtrl')
const authenticated = false
const goToNext = (req,res,next) => {next()}
//routers 
sauseFundingRouter.get('/checkstatus', (authenticated ? authController.isAuth : goToNext), sauseFundingCtrl.fundingCampaignStatus)
sauseFundingRouter.get('/getCampaignInformation', (authenticated ? authController.isAuth : goToNext), sauseFundingCtrl.getCampaignInformation)
//sauseFundingRouter.get('/getPreOrders', (authenticated ? authController.isAuth : goToNext), sauseFundingCtrl.getPreOrders)
//sauseFundingRouter.get('/amountRaised', (authenticated ? authController.isAuth : goToNext), sauseFundingCtrl.amountRaised)
sauseFundingRouter.post(`/payCampaignOrder`, authenticated ? authController.isAuth : goToNext, sauseFundingCtrl.payCampaignOrder)
sauseFundingRouter.post(`/informShirtSize`, authenticated ? authController.isAuth : goToNext, sauseFundingCtrl.informShirtSize)
//exporting router
module.exports = sauseFundingRouter