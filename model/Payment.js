//customed modules 
const db = require('./db/pool')
module.exports = class Payment{
//=======================================================================================================
//INSTANCE METHODS ======================================================================================
//=======================================================================================================

//=======================================================================================================
//CLASS METHODS =========================================================================================
//=======================================================================================================
    static payOrder(jsonObject){
        console.log('payOrderCalled')
        return db.query(`CALL foodtruck_payment_payOrder('${jsonObject}');`)
    }
    static payAtPickup(orderId,userId,cdId){
        console.log('entrou no Payment')
        return db.query(`CALL footruck_payment_payAtPickUp(?, ?,?);`,[`${orderId}`,`${userId}`,`${cdId}`])
    }
}