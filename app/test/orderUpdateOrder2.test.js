//!req.body.id||!req.body.email||!req.body.currentPassword||!req.body.newPassword||!req.body.confirmPassword
const request = require('supertest')
const app = require('../app.js')
const maxUsers = 401
jest.setTimeout(10000);
var cdData = []
var user = {}

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
                    if(val%2===0){
                        updateOrder(cd)
                        .then(val => {
                            console.log('updateOrder.then()')
                            if(res1.body.msg[1].length-1===index){
                                done()
                            }
                        })
                        .catch(err => {
                            console.log('updateOrder -> error')
                            if(res1.body.msg[1].length-1===index){
                                done()
                            }
                        })
                    }
                    // else {
                    //     console.log('==============================================>>>>>>>')
                    //     newOrder(cd)
                    //     .then(val => {
                    //         console.log('newOrder.then()')
                    //         if(res1.body.msg[1].length-1===index){
                    //             done()
                    //         }
                    //     })
                    //     .catch(err => {
                    //         console.log('error')
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
function newOrder(cd){
    console.log('newOrderCalled')
    return new Promise((resolve,reject)=>{
        var dishes = []
        var qtty =[]
        cd.dishes.forEach(o => {
            dishes.push(o.dishId)
            qtty.push(new Date().getSeconds() + 1)  })
        request(app)
        .post('/api/order/newOrder')
        .send({
            email:user.email,
            id: user.id,
            cookingDate_id:cd.cookingDateId,
            dish_id: dishes,
            dish_qtty: qtty,
            extras_id: [],
            extras_qtty:[]
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
function updateOrder(cd){
    //order_id||!req.body.id||!req.body.new_qtty||!req.body.email
    console.log('updateCalled')
    return new Promise((resolve,reject)=>{
        var qtty =[]
        cd.dishes.forEach(o => {
            qtty.push(50)  })
        request(app)
        .post('/api/order/updateOrder')
        .send({
            email:user.email,
            id: user.id,
            order_id:cd.orderId,
            new_qtty: qtty
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
for(let checker = 0; checker < maxUsers; checker++){
    getData(checker)
}