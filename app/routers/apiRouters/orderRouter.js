//npm modules
const express = require('express')
//router creation
const OrderRouter = express.Router()
//controllers
const OrderCtrl = require('../../controllers/orderCtrl')
const authController = require('../../controllers/authCtrl')
//routes 
OrderRouter.post('/newOrder', authController.isAuth, OrderCtrl.newOrder)
OrderRouter.post('/deleteOrder', authController.isAuth, OrderCtrl.deleteOrder)
OrderRouter.post('/updateOrder', authController.isAuth, OrderCtrl.updateOrder)
OrderRouter.post('/cancelMadeToListOrder', authController.isAuth, OrderCtrl.cancelMadeToListOrder)
OrderRouter.post('/payOrder', authController.isAuth, OrderCtrl.payOrder)
OrderRouter.post('/payAtPickup', authController.isAuth, OrderCtrl.payAtPickup)
//exporting router
module.exports = OrderRouter