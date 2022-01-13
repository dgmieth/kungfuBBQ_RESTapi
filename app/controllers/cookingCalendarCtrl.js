//npm modules

//customed modules

//customed classes
const User = require('../../model/User')
const SocialMedia = require('../../model/SocialMedia')
const Order = require('../../model/Order')
const CookingCalendar = require('../../model/CookingCalendar')
//custom functions
const jsonParser = require('./supportFunctions/jsonParser')
const returnResJsonObj = require('./supportFunctions/returnResJsonObj')
//env variables
const noError = parseInt(process.env.NO_ERROR)
const dataError = parseInt(process.env.DATA_ERROR)
//controller functions
// GET ALL ACTIVE COOKING DATES ================================================
// -----------------------------------------------------------------------------
exports.activeCookingDatesWithinSixtyDays = (req,res,next) => {
    CookingCalendar.activeCookingDateWithinNextSixtyDays(parseInt(req.query.id))
    .then(([data,meta])=>{
        if(data){
            return res.json(returnResJsonObj.resJsonOjbect(false,jsonParser.activeCookingDateWithinNextSixtyDaysParsed(data),noError))
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to retrieve information about cooking calendar and orders!`, dataError))}})
    .catch(err => {
        console.log(err)
        res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to retrieve information about cooking calendar and orders!`, dataError))})
}