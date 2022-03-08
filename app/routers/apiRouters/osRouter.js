//npm modules
const express = require('express')
//router creation
const osRouter = express.Router()
//controllers
const osController = require('../../controllers/osController')
//routers 
osRouter.get('/checkVersion', osController.checkOSVersion)
//exporting router
module.exports = osRouter