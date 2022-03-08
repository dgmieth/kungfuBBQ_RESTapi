'use strict';
//npm modules
var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var SDKConstants = require('authorizenet').Constants;
//var utils = require('../utils.js');
const APIKEY = process.env.NODE_ENV==='prod' ?  process.env.API_LOGIN_KEY_PROD : process.env.API_LOGIN_KEY_DEV
const TRANSACTIONKEY = process.env.NODE_ENV==='prod' ? process.env.TRASACTION_KEY_PROD : process.env.TRASACTION_KEY_DEV
const itemCounter = 30
console.log(process.env.NODE_ENV)
console.log(APIKEY)
console.log(TRANSACTIONKEY)
// const APIKEY = process.env.API_LOGIN_KEY_DEV
// const TRANSACTIONKEY = process.env.TRASACTION_KEY_DEV

exports.chargeCreditCard = (dataObject, callback) => {
    console.log('dataObject -> ',dataObject)
    var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType()
    merchantAuthenticationType.setName(APIKEY)
    merchantAuthenticationType.setTransactionKey(TRANSACTIONKEY)

    var creditCard = new ApiContracts.CreditCardType()
    creditCard.setCardNumber(dataObject.cardNumber)
    creditCard.setExpirationDate(dataObject.expirationDate)
    creditCard.setCardCode(dataObject.cardCode)

    var paymentType = new ApiContracts.PaymentType()
    paymentType.setCreditCard(creditCard)

    var billTo = new ApiContracts.CustomerAddressType()
    billTo.setFirstName(dataObject.userName)
    billTo.setPhoneNumber(dataObject.phoneNumber)
    billTo.setEmail(dataObject.email)

    var order = new ApiContracts.OrderType()
    order.setInvoiceNumber(`Order_${dataObject.orderId}_${new Date().getUTCSeconds()}`)
    order.setDescription("FoodTruck order")

    var itemsList = []
    var counter = 0
    if(dataObject.tip > 0){
        var lineItem = new ApiContracts.LineItemType()
        lineItem.setItemId(`tipFromUser`)
        lineItem.setName('tip')
        lineItem.setUnitPrice(parseFloat(dataObject.tip).toFixed(2))
        lineItem.setQuantity(1)
        itemsList.push(lineItem)
    }
    dataObject.dish.forEach(dish => {
        // console.log(dish)
        var lineItem = new ApiContracts.LineItemType()
        lineItem.setItemId(`dishID_${dish.dishId}`)
        lineItem.setName(dish.dishName.substring(0,28))
        lineItem.setUnitPrice(parseFloat(dish.dishPrice).toFixed(2))
        lineItem.setQuantity(parseFloat(dish.dishQtty).toFixed(2))
        itemsList.push(lineItem)
        counter += 1
        if(counter>= dataObject.tip > 0 ? itemCounter - 1 : itemCounter){
            return 
        }
    })

    var lineItems = new ApiContracts.ArrayOfLineItem()
    lineItems.setLineItem(itemsList)

    var transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setPayment(paymentType);
	transactionRequestType.setAmount(dataObject.totalAmount);
	transactionRequestType.setLineItems(lineItems);
    //transactionRequestType.setEmail(dataObject.email)
	//transactionRequestType.setUserFields(userFields);
	transactionRequestType.setOrder(order);
	// transactionRequestType.setTax(tax);
	// transactionRequestType.setDuty(duty);
	// transactionRequestType.setShipping(shipping);
	transactionRequestType.setBillTo(billTo);
	// transactionRequestType.setShipTo(shipTo);
	// transactionRequestType.setTransactionSettings(transactionSettings);

    var createRequest = new ApiContracts.CreateTransactionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType);
    createRequest.setRefId(dataObject.orderId)
    //pretty print request
    console.log(JSON.stringify(createRequest.getJSON(), null, 2));
            
    var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
    if(process.env.NODE_ENV==='prod'){
        console.log('live account')
        ctrl.setEnvironment(SDKConstants.endpoint.production);
    }
    ctrl.execute(function(){
        console.log(456)

        var apiResponse = ctrl.getResponse();

        var response = new ApiContracts.CreateTransactionResponse(apiResponse);

        //pretty print response
        console.log(JSON.stringify(response, null, 2));
        var returnObj = {}
        console.log('response is -> ',response,`====== ended`)
        console.log(`=======================================`)
        console.log(`===========PAYMENT RESPONSE============`)
        console.log(response)
        console.log(`===========PAYMENT RESPONSE============`)
        console.log(`=======================================`)
        if(response.messages.resultCode===`Ok`){
            returnObj.refId = response.refId
            returnObj.responseCode = response.transactionResponse.responseCode
            returnObj.authCode = response.transactionResponse.authCode
            returnObj.avsResultCode = response.transactionResponse.avsResultCode
            returnObj.cvvResultCode = response.transactionResponse.cvvResultCode
            returnObj.cavvResultCode = response.transactionResponse.cavvResultCode
            returnObj.transId = response.transactionResponse.transId
            returnObj.refTransID = response.transactionResponse.refTransID
            returnObj.transHash = response.transactionResponse.transHash
            returnObj.testRequest = response.transactionResponse.testRequest
            returnObj.accountNumber = response.transactionResponse.accountNumber
            returnObj.accountType = response.transactionResponse.accountType
            returnObj.transHashSha2 = response.transactionResponse.transHashSha2
            returnObj.networkTransId = response.transactionResponse.networkTransId
            if(response.transactionResponse.hasOwnProperty(`errors`)){
                returnObj.error = 1
                returnObj.errorCode = response.transactionResponse.errors.error[0].errorCode
                returnObj.errorDescription = response.transactionResponse.errors.error[0].errorText    
            }else if(response.transactionResponse.hasOwnProperty(`messages`)){
                returnObj.error = 0
                returnObj.messageCode = response.transactionResponse.messages.message[0].code
                returnObj.messageDescription = response.transactionResponse.messages.message[0].description    
            }else{
                returnObj.error = 0
                returnObj.messageCode = response.messages.message[0].code
                returnObj.messageDescription = response.messages.message[0].text
            }
        }else{
            if(response.transactionResponse.hasOwnProperty(`errors`)){
                returnObj.error = 1
                returnObj.errorCode = response.transactionResponse.errors.error[0].errorCode
                returnObj.errorDescription = response.transactionResponse.errors.error[0].errorText    
            }else if(response.transactionResponse.hasOwnProperty(`messages`)){
                returnObj.error = 1
                returnObj.errorCode = response.transactionResponse.messages.message[0].code
                returnObj.errorDescription = response.transactionResponse.messages.message[0].description    
            }else{
                returnObj.error = 1
                returnObj.errorCode = response.messages.message[0].code
                returnObj.errorDescription = response.messages.message[0].text
            }
        }
        // if(response.hasOwnProperty(`refId`)){
        //     returnObj.refId = response.refId
        //     returnObj.responseCode = response.transactionResponse.responseCode
        //     returnObj.authCode = response.transactionResponse.authCode
        //     returnObj.avsResultCode = response.transactionResponse.avsResultCode
        //     returnObj.cvvResultCode = response.transactionResponse.cvvResultCode
        //     returnObj.cavvResultCode = response.transactionResponse.cavvResultCode
        //     returnObj.transId = response.transactionResponse.transId
        //     returnObj.refTransID = response.transactionResponse.refTransID
        //     returnObj.transHash = response.transactionResponse.transHash
        //     returnObj.testRequest = response.transactionResponse.testRequest
        //     returnObj.accountNumber = response.transactionResponse.accountNumber
        //     returnObj.accountType = response.transactionResponse.accountType
        //     returnObj.transHashSha2 = response.transactionResponse.transHashSha2
        //     if(response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK){
        //         if(response.transactionResponse.hasOwnProperty(`messages`)){
        //             returnObj.error = 0
        //             returnObj.messageCode = response.transactionResponse.messages.message[0].code
        //             returnObj.messageDescription = response.transactionResponse.messages.message[0].description
        //             returnObj.networkTransId = response.transactionResponse.networkTransId
        //         }else{
        //             console.log('error 1')
        //             returnObj.error = 1
        //             returnObj.messageCode = response.transactionResponse.errors.error[0].errorCode
        //             returnObj.messageDescription = response.transactionResponse.errors.error[0].errorText
        //             // returnObj.networkTransId = response.transactionResponse.networkTransId
        //         }
        //     }
        //     else {
        //         console.log('error 2')
        //         if(process.env.NODE_ENV==='dev'){
        //             console.log(response.messages.message)
        //             returnObj.error = 1
        //             returnObj.errorCode = response.messages.message[0].code
        //             returnObj.errorDescription = response.messages.message[0].text
        //         }else{
        //             returnObj.error = 1
        //             returnObj.errorCode = response.transactionResponse.errors.error[0].errorCode
        //             returnObj.errorDescription = response.transactionResponse.errors.error[0].errorText
        //         }
        //     }
        // } else {
        //     console.log('error 3')
        //     // console.log(response.transactionResponse.errors.error[0])
        //     returnObj.error = 1
        //     returnObj.errorDescription = (response.messages.message[0].text).replace(/'/ig,'')
        //     returnObj.errorCode = response.messages.message[0].code
        // }
        console.log(returnObj)
        callback(returnObj);
    });
    }

    if (require.main === module) {
    chargeCreditCard(function(){
        console.log('chargeCreditCard call complete.');
    });
    }
