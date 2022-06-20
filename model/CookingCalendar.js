//customed modules 
const db = require('./db/pool')
module.exports = class CatoringContact{
    constructor(){
    }
    //=======================================================================================================
    //INSTANCE METHODS ======================================================================================
    //=======================================================================================================

    //=======================================================================================================
    //CLASS METHODS =========================================================================================
    //=======================================================================================================
    //fetch active cooking calendar dates for the next 60 days
    static activeCookingDateWithinNextTwelveMonths(userId){
        return db.query(`CALL foodtruck_cd_getActiveCDNext12Months(?); `,[`${userId}`])
    }
    //confirm user presence in eventOnly
    static confirmPresence(userId,cookingCalendarId){
        return db.query(`CALL foodtruck_cd_confirmPresence(?,?,@returnCode);SELECT @returnCode as returnCode;`,[`${cookingCalendarId}`,`${userId}`])
    }
}