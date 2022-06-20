//npm modules

//customed modules

//customed classes
const User = require('../../model/User')
const SocialMedia = require('../../model/SocialMedia')
const Order = require('../../model/Order')
const CookingCalendar = require('../../model/CookingCalendar')
//custom functions
const io = require('./supportFunctions/socketIO')
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
// CONFIRM PRESENCE ============================================================
// -----------------------------------------------------------------------------
exports.confirmPresence = (req,res,next) => {
    console.log(`cookingCalendarCtrl -> confirmPresence -> `)
    console.log(req.body)
    CookingCalendar.confirmPresence(parseInt(req.body.id),parseInt(req.body.cookingDate_id))
    .then(([answer,meta])=>{
        console.log(answer[1])
        //VALIDATION
        if(answer){
            if (answer[1][0].returnCode === -2){
                return res.json(returnResJsonObj.resJsonOjbect(true,`User already confirmed presence!`, dataError))    
            }
            if (answer[1][0].returnCode === -3){
                return res.json(returnResJsonObj.resJsonOjbect(true,`User doesn't exist in database!`, dataError))    
            }
            io.emit(`${process.env.CD_CALENDAR}`,{eventOnly: "New confirmation"})
            return res.json(returnResJsonObj.resJsonOjbect(false,'Ok. We now know you may swing by during this event.',noError))
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to confirm your presence right now. Try again later!`, dataError))    
        }
    })
    .catch(err => {
        console.log(`cookingCalendarCtrl -> confirmPresence -> confirmPresence ERROR ${err}`)
        res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to confirm your presence right now. Try again later!`, dataError))
    })
}