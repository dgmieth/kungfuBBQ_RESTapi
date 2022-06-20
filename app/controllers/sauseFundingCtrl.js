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
    console.log('sauseFundingCtrl - getSausePrice -> ')
    Funding.getSausePrice()
    .then(([answer1,meta])=>{
        if(answer1.length > 0){
            var price = parseFloat(answer1[0]['funding_sause_getPrice()']).toFixed(2)
            Funding.getAmountRaised()
            .then(([answer2,meta])=>{
                if(answer2.length > 0){
                    var totalAmount = parseFloat(answer2[0][0].totalAmount).toFixed(2)
                    return res.json(returnResJsonObj.resJsonOjbect(false,{price, totalAmount},noError)) 
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
        return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to retrieve price from database. Error: ${err}`, sauseError))     })
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
    const order = new Funding(req.body.userId,req.body.qtty)
    order.setTip = req.body.tip
    var validate = 0
    User.fetchByID(order.userId)
    .then(([userInfo,userMetaInfo])=>{
        if(userInfo.count === 0 ){
            return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to create preorder. Not possible to validate user. Please try again later.`, sauseError)) }
        /*creating user object*/
        const user = new User(userInfo[0][0].email)
        user.setID = userInfo[0][0].id
        user.setName = userInfo[0][0].name
        user.setPhoneNumber = userInfo[0][0].phoneNumber
        order.createOrder()
        .then(([orderInfo,orderMetaInfo])=>{
            validate = orderInfo[1][0].returnCode
            if(validate===-2){
                return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to create preorder. User does not exist in our database. Please contact KungfuBBQ.`, sauseError))}
            /*creating funding object*/
            order.dishes.push({
                dishId: 1,
                dishName: orderInfo[4][0].itemName,
                dishPrice: parseFloat(orderInfo[3][0].price),
                dishQtty: order.getQtty
            })
            order.setOrderId = parseInt(orderInfo[2][0].orderId)
            order.setOrderItemPrice = parseFloat(orderInfo[3][0].price)
            /*creating payment payload*/
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
                totalAmount: (order.getQtty*order.getOrderItemPrice)+order.getTip , 
                description: "Sause pre ordering"
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
                /*saving payment to database*/
                order.payOrder(JSON.stringify(cb))
                .then(([paymentInfo, paymentMetaInfo])=>{
                    sendEmail(user.email,'Sause pre-order receipt',{
                            name: user.name, 
                            items:items,
                            totalAmount:cb.amount-cb.tip, 
                            amountPaid:cb.amount, 
                            tip: cb.tip 
                        },`sausePreOrderReceipt`)
                    console.log(process.env.SAUSEFUNDING)
                    io.emit(`${process.env.SAUSEFUNDING}`,{user: order.getUserId, orderID: order.getOrderId,email:user.email})      
                    return res.json(returnResJsonObj.resJsonOjbect(false,`Order nr. ${order.getOrderId} was paid. You'll receive an email with this transation in a couple of minutes.`,noError))
                })
                .catch(err => {
                    console.log(`funding sause payOrder() => error ----> ${err}`)
                    return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to pay your order. Plea try again later.`,sauseError))
                })  })  })
        .catch(err => {
            console.log(`funding sause createOrder() => error ----> ${err}`)
            return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to create your order. Plea try again later.`,sauseError))
        })  })
    .catch(err => {
        console.log('funding sause - user fetchByID() => error -----> ',err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to validate your user. Plea try again later.`,sauseError))
    })
}