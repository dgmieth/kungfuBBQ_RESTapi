//npm modules
const jwt = require(`jsonwebtoken`)
//customed modules
const db = require('../../model/db/pool')
const io = require('./supportFunctions/socketIO')
//customed classes

//controller functions

//env variables
const noError = parseInt(process.env.NO_ERROR)
const osError = parseInt(process.env.OS_ERROR)
const returnResJsonObj = require('./supportFunctions/returnResJsonObj')
//SAVE REQUEST ==============================================================
exports.checkOSVersion = (req,res,next)=>{
    console.log('checkOSVersion -> ')
    ///api/osVersion/checkVersion?version_code=2.7&os=apple
    console.log(req.query)
    if(req.query.mobileOS==='android'){
        checkVersionCode(parseInt(req.query.version_code),parseInt(process.env.ANDROID_VERSION_CODE),res)
    }else if(req.query.mobileOS==='apple'){
        checkVersionCode(parseInt(req.query.version_code),parseInt(process.env.APPLE_VERSION_CODE),res)
    }else{
        res.json(returnResJsonObj.resJsonOjbect(false,`No os detected.`,noError))
    }
}
//check os version ==================================================================
function checkVersionCode(userVersion,systemVersion,res){
    if(userVersion<systemVersion){
        console.log(1)
        res.json(returnResJsonObj.resJsonOjbect(true,`The current app version on your phone is outdated. Please update your application.`,osError)) 
    }else{
        console.log(2)
        res.json(returnResJsonObj.resJsonOjbect(false,`Your mobile version is the current one.`,noError))    
    }
}