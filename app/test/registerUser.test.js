const { expect } = require('@jest/globals')
require('dotenv').config()
const userCtrl = require('../controllers/authCtrl')
jest.setTimeout(5000);

test('adds 1 + 2 to equal 3', done => {
    var res = {
        json: ()=>{console.log('jsonCalled')}
    }
    var req = {
        body: {
            email:'n_sylvain@hotmail.com',
            password:'Aa1',
            confirmPassword:'Aa1',
            code:'KgfBBQ@22ygxmr',
            mobileOS:'Android',
            name:'Sylvia',
            phoneNumber:'0000000000'
        }
    }
    const next = function(){
        console.log('nextCalled')
    }
    
    userCtrl.register(req,res,next)
})