//customed modules 
const db = require('./db/pool')
module.exports = class Order{
    constructor(orderId){
        this.orderId = orderId
        this.userId = null
        this.qtty = null
        this.cookingDateId = null
    }
    set setUser(user) {
        this.userId = user
    }
    set setQtty(qtty){
        this.qtty = qtty
    }
    set setCookingDateId(cookingDateId){
        this.cookingDateId = cookingDateId
    }
//=======================================================================================================
//INSTANCE METHODS ======================================================================================
//=======================================================================================================
    deleteOrder(){
        return db.query(`CALL foodtruck_order_deleteOrder(?,?,@returnCode);SELECT @returnCode as returnCode;`,
        [`${this.orderId}`,`${this.userId}`])
    }
    updateOrder(){
        return db.query(`CALL foodtruck_order_updateOrderByUser(?,?,?,@returnCode);SELECT @returnCode as returnCode;`,
        [`${this.orderId}`,`${this.userId}`,`${this.qtty}`])
    }
    deleteMadeToListOrder(){
        return db.query(`CALL foodtruck_order_deleteSelectedOrderByUser(?,?,?, @returnCode);SELECT @returnCode as returnCode;`,
        [`${this.userId}`,`${this.cookingDateId}`,`${this.orderId}`])
    }
//=======================================================================================================
//CLASS METHODS =========================================================================================
//=======================================================================================================
    static newOrder(dataObject){
        const newJson = JSON.stringify(dataObject)
        return db.query(`CALL foodtruck_order_newOrder('${newJson}',@returnCode,@orderIdOut);SELECT @returnCode;SELECT @orderIdOut;`)
    }
    static getDishes(orderId){
        return db.query(`CALL foodtruck_order_getDishesForPaymentModule(?);`,[`${orderId}`])
    }
    static validateOrder(orderId){
        return db.query(`CALL foodtruck_order_validateOrder(?, @returnCode);SELECT @returnCode as returnCode;`,
        [`${orderId}`])
    }
}