//!req.body.id||!req.body.email||!req.body.currentPassword||!req.body.newPassword||!req.body.confirmPassword
const request = require('supertest')
const app = require('../app.js')
const maxUsers = 1
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
                if(res1) console.log(res1.body.msg[0])
                res1.body.msg[0].forEach((cd,index) => {
                    cdData.push(cd)     
                    user.email = res.body.data.email,
                    user.id = res.body.data.id,
                    user.token = res.body.data.token
                    newOrder(cd)
                    .then(val => {
                        console.log('newOrder.then()')
                        if(res1.body.msg[0].length-1===index){
                            done()
                        }
                    })
                    .catch(err => {
                        console.log('error')
                        if(res1.body.msg[0].length-1===index){
                            done()
                        }
                    })
                })
                if (err) throw err
            })
        })
    })
}
function newOrder(cd){
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
for(let checker = 0; checker < maxUsers; checker++){
    getData(checker)
}