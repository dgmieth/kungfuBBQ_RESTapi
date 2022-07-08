//npm modules

//customed modules
const db = require('../../model/db/pool')
//customed classes
const Funding = require('../../model/Funding')
const User = require('../../model/User')

//controller functions
const returnResJsonObj = require('./supportFunctions/returnResJsonObj')
const payment = require('./supportFunctions/payment')
const sendEmail = require('./supportFunctions/sendEmail')
const io = require('./supportFunctions/socketIO')
//env variables
const noError = parseInt(process.env.NO_ERROR)
const sauseError = parseInt(process.env.SAUSE_FUNDING_ERROR)
//=====================================================================
//CHECK CAMPAINGN STATUS REQUEST ======================================
exports.fundingCampaignStatus = (req,res,next)=>{
    console.log('fundingCampaignStatus -> ')
    ///api/osVersion/checkVersion?version_code=2.7&os=apple
    Funding.getCampaignStatus()
    .then(([answer,meta])=>{
        if(answer){
            return res.json(returnResJsonObj.resJsonOjbect(false,{status:answer[0][0].status},noError)) 
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(false,{status:'off'},noError)) 
        }
    })
    .catch(err=>{
        console.log('sauseFundingCtrl -> fundingCampaignStatus -> ',err)
        return res.json(returnResJsonObj.resJsonOjbect(false,{status:'off'},noError)) 
    })
}
//=====================================================================
//GET SAUSE PRICE REQUEST =============================================
exports.getCampaignInformation = (req,res,next)=>{
    console.log('sauseFundingCtrl - getCampaignInformation -> ')
    Funding.getSausePrice()
    .then(([answer1,meta])=>{
        if(answer1.length > 0){
            var price = parseFloat(answer1[0]['funding_sause_getPrice()']).toFixed(2)
            Funding.getInformation()
            .then(([answer2,meta])=>{
                if(answer2.length > 0){
                    var totalAmount = parseFloat(answer2[0][0].totalAmount).toFixed(2)
                    var preOrders = parseFloat(answer2[1][0].totalAmount).toFixed(2)
                    var tips = parseFloat(answer2[2][0].totalAmount).toFixed(2)
                    var batchPrice = parseFloat(answer2[3][0].totalAmount).toFixed(2)
                    console.log({price, totalAmount,preOrders,tips})
                    return res.json(returnResJsonObj.resJsonOjbect(false,{price, totalAmount,preOrders,tips,batchPrice},noError)) 
                }else{
                    return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to retrieve total amount raised from database`, sauseError))  
                }   })
            .catch(err => {
                console.log(`ERROR sauseFundingCtrl.amountRaised -> ${err}`)
                return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to retrieve total amount raised from database. Error: ${err}`, sauseError))   })
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to retrieve price from database`, sauseError))
        }   })
    .catch(err => {
        console.log(`ERROR sauseFundingCtrl.getSausePrice -> ${err}`)
        return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to retrieve campaing information failed with server message: ${err}`, sauseError))     })
}
//=====================================================================
//CREATE AND PAY ORDER ================================================
exports.payCampaignOrder = (req,res,next)=>{
    console.log('payCampaignOrder -> ')
    console.log(req.body)
    /**
     * object must have
     * qtty, userId, email,
     * tip,
     * cardNumber, expirationDate (aaaa-mm), carCode
     * token
     */
    const order = new Funding(parseInt(req.body.id),parseInt(req.body.qtty))
    order.setTip = parseFloat(req.body.tip).toFixed(2)
    var validate = 0
    User.fetchByID(order.userId)
    .then(([userInfo,userMetaInfo])=>{
        if(userInfo.count === 0 ){
            return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to pay your pre-order failed with server message: Not possible to create preorder. Not possible to validate user. Please try again later.`, sauseError)) }
        /*creating user object*/
        const user = new User(userInfo[0][0].email)
        user.setID = userInfo[0][0].id
        user.setName = userInfo[0][0].name
        user.setPhoneNumber = userInfo[0][0].phoneNumber
        order.createOrder()
        .then(([orderInfo,orderMetaInfo])=>{
            validate = orderInfo[1][0].returnCode
            if(validate===-2){
                return res.json(returnResJsonObj.resJsonOjbect(true,{msg:`The attempt to pay your pre-order failed with server message: Not possible to create preorder. User does not exist in our database. Please contact KungfuBBQ.`}, sauseError))}
            /*creating funding object*/
            order.dishes.push({
                dishId: 1,
                dishName: orderInfo[4][0].itemName,
                dishPrice: parseFloat(orderInfo[3][0].price).toFixed(2),
                dishQtty: order.getQtty
            })
            order.setOrderId = parseInt(orderInfo[2][0].orderId)
            order.setOrderItemPrice = parseFloat(orderInfo[3][0].price)
            /*creating payment payload*/
            console.log({
                orderQtty: order.getQtty,
                orderPrice: order.getOrderItemPrice,
                tip: order.getTip,
                totalAmountOrder: order.getQtty*order.getOrderItemPrice,
                totalAmountPaid: order.getQtty*order.getOrderItemPrice+order.getTip,
                total: parseFloat((parseFloat(order.getQtty)*order.getOrderItemPrice)+order.getTip).toFixed(2)
            })
            var dataObject = {
                cardNumber: req.body.cardNumber,
                expirationDate: req.body.expirationDate,
                cardCode: req.body.cardCode,
                userName: user.name,
                phoneNumber: user.phoneNumber,
                email: user.email,
                orderId: order.getOrderId,
                tip: order.getTip,
                dish: order.getDishes,
                origin: order.getOrigin,
                totalAmount: parseFloat((parseFloat(order.getQtty)*order.getOrderItemPrice)+order.getTip).toFixed(2) , 
                description: "Sauce pre-ordering"
            }
            /*charing credit card*/
            payment.chargeCreditCard(dataObject,(cb)=>{
                console.log(cb)
                cb.user_id = user.id
                cb.order_id = order.getOrderId
                cb.amount = dataObject.totalAmount
                cb.tip = order.getTip === '' || order.getTip === undefined || order.getTip === null ? 0 : parseFloat(order.getTip)
                cb.origin = order.getOriginId
                var items = []
                order.dishes.forEach(dish => {
                    items.push({
                        itemName: dish.dishName,
                        itemQtty: dish.dishQtty,
                        itemPrice: dish.dishPrice
                    })
                })
                if(cb.error === 1){
                    return res.json(returnResJsonObj.resJsonOjbect(true,{msg:`The attempt to pay your pre-order failed with server message: ${cb.errorDescription}`},noError))
                }
                /*saving payment to database*/
                order.payOrder(JSON.stringify(cb))
                .then(([paymentInfo, paymentMetaInfo])=>{
                    var hasInformedShirtSize =  parseInt(paymentInfo[1][0].informedShirtSize) === 0 ? 'n' : 'y'
                    sendEmail(user.email,'Sauce pre-order receipt',{
                            name: user.name, 
                            items:items,
                            totalAmount:parseFloat(cb.amount-cb.tip).toFixed(2), 
                            amountPaid:parseFloat(cb.amount).toFixed(2), 
                            orderID: order.getOrderId,
                            tip: parseFloat(cb.tip).toFixed(2) 
                        },`sausePreOrderReceipt`)
                    console.log(process.env.SAUSEFUNDING)
                    io.emit(`${process.env.SAUSEFUNDING}`,{user: order.getUserId, orderID: order.getOrderId,email:user.email})      
                    return res.json(returnResJsonObj.resJsonOjbect(false,{msg:`Order id #${order.getOrderId} was paid. You'll receive an email with a receipt of this transaction in a couple of minutes.`,hasInformedShirtSize},noError))
                })
                .catch(err => {
                    console.log(`funding sause payOrder() => error ----> ${err}`)
                    return res.json(returnResJsonObj.resJsonOjbect(true,{msg:`The attempt to pay your pre-order failed with server message: It was not possible to pay your order. Please try again later.`},sauseError))
                })  })  })
        .catch(err => {
            console.log(`funding sause createOrder() => error ----> ${err}`)
            return res.json(returnResJsonObj.resJsonOjbect(true,{msg:`The attempt to pay your pre-order failed with server message: It was not possible to create your order. Please try again later.`},sauseError))
        })  })
    .catch(err => {
        console.log('funding sause - user fetchByID() => error -----> ',err)
        return res.json(returnResJsonObj.resJsonOjbect(true,{msg:`The attempt to pay your pre-order failed with server message: It was not possible to validate your user. Please try again later.`},sauseError))
    })
}
//=====================================================================
//INFORMING SHIRT SIZE ================================================
exports.informShirtSize = (req,res,next) => {
    console.log('sauseFundingCtrl -> informShirtSize -> ')
    console.log(req.body)
    Funding.informShirtSize(parseInt(req.body.id),req.body.size)
    .then(([answer,meta])=>{
        console.log(answer)
        const hasInformedShirtSize = 'y'
        if(answer){
            return res.json(returnResJsonObj.resJsonOjbect(false,{msg:`Your t-shirt size was successfully saved to our database.`,hasInformedShirtSize},noError))           
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to save your t-shirt size to the database failed with server message: It was not possible to validate your user. Please try again later.`,sauseError))    }    })
    .catch(err => {
        console.log('sauseFundingCtrl -> informShirtSize -> inforShirtSize => ',err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to save your t-shirt size to the database failed with server message: It was not possible to validate your user. Please try again later.`,sauseError))
    })
}