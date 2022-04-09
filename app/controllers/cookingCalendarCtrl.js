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
exports.activeCookingDateWithinNextTwelveMonths = (req,res,next) => {
    console.log(`cookingCalendar===================================
    ===================================
    ===================================>
        ${req.query.version_code}
        ${req.query.mobileOS}
    <===================================
    ===================================
    ===================================
    `)
    CookingCalendar.activeCookingDateWithinNextTwelveMonths(parseInt(req.query.id))
    .then(([data,meta])=>{
        // console.log(data)
        if(data[0].length===0){
            return res.json(returnResJsonObj.resJsonOjbect(true,`There are no future events currently scheduled.`, dataError))
        }
        if(data){
            return res.json(returnResJsonObj.resJsonOjbect(false,jsonParser.activeCookingDateWithinNextTwelveMonthsParsed(data),noError))
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to retrieve information about cooking calendar and orders!`, dataError))}})
    .catch(err => {
        console.log(err)
        res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to retrieve information about cooking calendar and orders!`, dataError))})
}