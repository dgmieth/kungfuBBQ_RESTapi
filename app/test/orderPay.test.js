//!req.body.id||!req.body.email||!req.body.currentPassword||!req.body.newPassword||!req.body.confirmPassword
const request = require('supertest')
const app = require('../app.js')
const maxUsers = 401
const initialUser = 1
jest.setTimeout(10000);
var cdData = []
var user = {}
const cardCode = '115'
const cardNumber = '4984234060287627'
const expirationDate = '2024-10'

function getData(val,checker){
    cdData = []
    user = {}
    it('getData',done=>{
        request(app)
        .post("/login/login")
        .send({ 
            email:`user${val}@mail.com`,
            password:`Aa${val}_new`,
            mobileOS: val%2===0 ? 'Android' : 'Apple'
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err,res)=>{
            // console.log(response._body)
            // if(res) console.log(res.body)
            if (err) throw err
            request(app)
            .get(`/api/cookingCalendar/activeCookingDatesWithinSixtyDays?email=${res.body.data.email}&id=${res.body.data.id}`)
            .set('Authorization',`Bearer ${res.body.data.token}`)
            .expect(200)
            .send()
            .end((err,res1)=>{
                // console.log(response._body)
                if(res1) console.log(res1.body.msg[1])
                res1.body.msg[1].forEach((cd,index) => {
                    cdData.push(cd)     
                    user.email = res.body.data.email,
                    user.id = res.body.data.id,
                    user.token = res.body.data.token
                    console.log('resto -> ',val%2===0)
                    // if(val%2===0){
                        payOrder(cd,index)
                        .then(val => {
                            console.log('payOrder.then()')
                            if(res1.body.msg[1].length-1===index){
                                done()
                            }
                        })
                        .catch(err => {
                            console.log('payOrder.error')
                            if(res1.body.msg[1].length-1===index){
                                done()
                            }
                        })
                    // }else {
                    //     cancelMadeToListOrder(cd)
                    //     .then(val => {
                    //         console.log('cancelMadeToListOrder.then()')
                    //         if(res1.body.msg[1].length-1===index){
                    //             done()
                    //         }
                    //     })
                    //     .catch(err => {
                    //         console.log('cancelMadeToListOrder.error')
                    //         if(res1.body.msg[1].length-1===index){
                    //             done()
                    //         }
                    //     })
                    // }
                    // done()
                })
                if (err) throw err
            })
        })
    })
}
function payOrder(cd,val){
    console.log('payOrder')
    //!req.body.order_id||!req.body.email||!req.body.id||!req.body.cookingDate_id||!req.body.cardCode||!req.body.cardNumber||!req.body.expirationDate
    return new Promise((resolve,reject)=>{
        if(cd.orderStatusId!==3){
            reject()    
        }
        request(app)
        .post('/api/order/payOrder')
        .send({
            email:user.email,
            id: user.id,
            order_id:cd.orderId,
            cookingDate_id:cd.cookingDateId,
            cardCode: cardCode,
            cardNumber: cardNumber,
            expirationDate: expirationDate,
            tip: val * new Date().getSeconds()
        })
        .expect(200)
        .set('Authorization',`Bearer ${user.token}`)
        .end((err,res2)=>{
            console.log(res2.body)
            if(!res2.body.hasErrors){
                resolve(true)
            }else { reject()}
        })
    })
}
function cancelMadeToListOrder(cd){
    //order_id||!req.body.id||!req.body.cookingDate_id
    console.log('cancelMadeToListOrder')
    return new Promise((resolve,reject)=>{
        if(cd.orderStatusId!==3){
            reject()    
        }
        request(app)
        .post('/api/order/cancelMadeToListOrder')
        .send({
            //email:user.email,
            id: user.id,
            order_id:cd.orderId,
            cookingDate_id: cd.cookingDateId
        })
        .expect(200)
        .set('Authorization',`Bearer ${user.token}`)
        .end((err,res2)=>{
            console.log(res2.body)
            if(!res2.body.hasErrors){
                resolve(true)
            }else { reject()}
        })
    })
}
for(let checker = initialUser; checker < maxUsers; checker++){
    getData(checker)
}