//customed modules 
const db = require('./db/pool')
module.exports = class Funding{
//=======================================================================================================
//INSTANCE METHODS ======================================================================================
//=======================================================================================================
    constructor(userId,qtty){
        this.userId = userId
        this.qtty = qtty
        this.orderId = null
        this.dishes = []
        this.itemPrice = 0.00
        this.tip = 0
        this.origin = `SauF_ordId`
        this.originId = 4
    }
    set setOrderId(orderId){
        this.orderId = orderId
    }
    get getOrderId(){
        return this.orderId
    }
    set setOrderItemPrice(itemPrice) {
        this.itemPrice = itemPrice
    }
    set setTip(tip){
        if(tip>0){      
            this.tip = tip      
        }else{ this.tip = 0 }
    }
    get getTip(){
        return parseFloat(this.tip)
    }
    get getOrderItemPrice(){
        return this.itemPrice
    }
    get getUserId(){
        return this.userId
    }
    get getQtty(){
        return this.qtty
    }
    get getDishes(){
        return this.dishes
    }
    get getOrigin(){
        return this.origin
    }
    get getOriginId(){
        return this.originId
    }
    createOrder(){
        return db.query(`CALL funding_sause_createOrder(?,?,@returnCode,@orderId,@price,@itemName);
                            SELECT @returnCode as returnCode;
                            SELECT @orderId as orderId;
                            SELECT @price as price;
                            SELECT @itemName as itemName;`,[`${this.userId}`,`${this.qtty}`])
    }
    payOrder(jsonOb){
        return db.query(`CALL funding_sause_payOrder(?,?,@informedShirtSize);SELECT @informedShirtSize as informedShirtSize;`, [`${jsonOb}`,`${this.orderId}`])
    }
//=======================================================================================================
//CLASS METHODS =========================================================================================
//=======================================================================================================
    /*SAUSE*/
    static getSausePrice(){
        return db.query(`SELECT funding_sause_getPrice();`)
    }
    static getInformation(){
        return db.query(`CALL funding_sause_getInformation();`)
    }
    static getPreOrders(){
        return db.query(`CALL funding_sause_getPreOrders();`)
    }
    static getCampaignStatus(){
        return db.query(`CALL funding_sause_campaignStatus(FALSE,0);`)
    }
    static informShirtSize(userId,size){
        return db.query(`CALL sause_funding_setTShirtSize(?,?);`,[`${userId}`,`${size}`])
    }
}