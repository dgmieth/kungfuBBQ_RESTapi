const { expect } = require('@jest/globals')
require('dotenv').config()
const payment = require('../controllers/supportFunctions/payment')
jest.setTimeout(5000);

var dataObject = {
                cardNumber: 6550031004587164,
                expirationDate: '1024',
                cardCode: 785,
                orderId: `49`,
                email: 'dgmieth@gmail.com',
                userName: 'dgmieth',
                totalAmount: .50,
                dish: [{
                    dishId: 1,
                    dishName: 'name',
                    dishPrice: '1',
                    dishQtty: '1',
                }]
}

test('adds 1 + 2 to equal 3', done => {
    function callback(data) {
        try {
            expect(data)
            console.log('testando linha')
            console.log(data)
          done();
        } catch (err) {
          done(err);
        }
      }
    payment.chargeCreditCard(dataObject,(callback))
})