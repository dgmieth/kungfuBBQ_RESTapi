//npm modules
var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var SDKConstants = require('authorizenet').Constants;
//var utils = require('../utils.js');
console.log(process.env.TRASACTION_KEY)

exports.chargeCreditCard = (dataObject, callback) => {
    console.log('dataObject -> ',dataObject)
    var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType()
    merchantAuthenticationType.setName(process.env.API_LOGIN_KEY)
    merchantAuthenticationType.setTransactionKey(process.env.TRASACTION_KEY)

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
    order.setInvoiceNumber(dataObject.orderId)
    order.setDescription("Purchase of meals")

    var itemsList = []
    var counter = 0
    dataObject.dish.forEach(dish => {
        console.log(dish)
        var lineItem = new ApiContracts.LineItemType()
        lineItem.setItemId(dish.dishId)
        lineItem.setName(dish.dishName)
        lineItem.setUnitPrice(parseFloat(dish.dishPrice).toFixed(2))
        lineItem.setQuantity(parseFloat(dish.dishQtty).toFixed(2))
        itemsList.push(lineItem)
        counter += 1
        if(counter>=30){
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
    //console.log(JSON.stringify(createRequest.getJSON(), null, 2));
            
    var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
    //Defaults to sandbox
    //ctrl.setEnvironment(SDKConstants.endpoint.production);

    ctrl.execute(function(){

        var apiResponse = ctrl.getResponse();

        var response = new ApiContracts.CreateTransactionResponse(apiResponse);

        //pretty print response
        //console.log(JSON.stringify(response, null, 2));
        var returnObj = {}
        console.log('response is -> ',response,`====== ended`)
        console.log(`=======================================`)
        console.log(`===========PAYMENT RESPONSE============`)
        console.log(response)
        console.log(`===========PAYMENT RESPONSE============`)
        console.log(`=======================================`)
        if(response.hasOwnProperty(`refId`)){
            returnObj.refId = response.refId
            returnObj.responseCode = response.transactionResponse.responseCode
            returnObj.authCode = response.transactionResponse.authCode
            returnObj.avsResultCode = response.transactionResponse.avsResultCode
            returnObj.cvvResultCode = response.transactionResponse.cvvResultCode
            returnObj.cavvResultCode = response.transactionResponse.cavvResultCode
            returnObj.transId = response.transactionResponse.transId
            returnObj.refTransID = response.transactionResponse.refTransID
            returnObjtransHash = response.transactionResponse.transHash
            returnObj.testRequest = response.transactionResponse.testRequest
            returnObj.accountNumber = response.transactionResponse.accountNumber
            returnObj.accountType = response.transactionResponse.accountType
            returnObj.transHashSha2 = response.transactionResponse.transHashSha2
            if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
                returnObj.error = 0
                returnObj.messageCode = response.transactionResponse.messages.message[0].code
                returnObj.messageDescription = response.transactionResponse.messages.message[0].description
                returnObj.networkTransId = response.transactionResponse.networkTransId
            }
            else {
                console.log(response.transactionResponse.errors.error[0])
                returnObj.error = 1
                returnObj.errorCode = response.transactionResponse.errors.error[0].errorCode
                returnObj.errorDescription = response.transactionResponse.errors.error[0].errorText
            }
        } else {
            returnObj.error = 1
            returnObj.errorDescription = (response.messages.message[0].text).replace(/'/ig,'')
            returnObj.errorCode = response.messages.message[0].code
        }
        callback(returnObj);
    });
    }

    if (require.main === module) {
    chargeCreditCard(function(){
        console.log('chargeCreditCard call complete.');
    });
    }