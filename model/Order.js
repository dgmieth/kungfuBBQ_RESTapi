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
        return db.query(`CALL deleteOrder(?,?,@returnCode);SELECT @returnCode as returnCode;`,
        [`${this.orderId}`,`${this.userId}`])
    }
    updateOrder(){
        return db.query(`CALL updateOrder(?,?,?,@returnCode);SELECT @returnCode as returnCode;`,
        [`${this.orderId}`,`${this.userId}`,`${this.qtty}`])
    }
    deleteMadeToListOrder(){
        return db.query(`CALL deleteMadeToListOrder(?,?,?, @returnCode);SELECT @returnCode as returnCode;`,
        [`${this.userId}`,`${this.cookingDateId}`,`${this.orderId}`])
    }
//=======================================================================================================
//CLASS METHODS =========================================================================================
//=======================================================================================================
    static newOrder(dataObject){
        const newJson = JSON.stringify(dataObject)
        return db.query(`CALL createNewOrder('${newJson}',@returnCode,@orderIdOut);SELECT @returnCode;SELECT @orderIdOut;`)
    }
    static getDishes(orderId){
        return db.query(`CALL getOrderDishes(?);`,[`${orderId}`])
    }
    static validateOrder(orderId){
        return db.query(`CALL validateOrder(?, @returnCode);SELECT @returnCode as returnCode;`,
        [`${orderId}`])
    }
}