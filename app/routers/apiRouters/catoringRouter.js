//npm modules
const express = require('express')
//router creation
const catoringRouter = express.Router()
//controllers
const catoringCtrl = require('../../controllers/catoringCtrl')
//routers 
catoringRouter.post('/saveContact', catoringCtrl.saveContact)
//exporting router
module.exports = catoringRouter