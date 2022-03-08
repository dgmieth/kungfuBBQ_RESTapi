const request = require('supertest')
const app = require('../app.js')
const cdId = 20
const DQtty = 22
const maxUsers = 10

test("should respond with a 200 status code", done => {
    var checker = 0
    while (checker <= maxUsers) {

        request(app)
        .post("/login/login")
        .send({ 
            email: `user${checker}@mail.com`, 
            password: `Aa${checker}` ,
            mobileOS: checker%2===0 ? 'Android' : 'Apple'
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err,res)=>{
            if (err) throw err
            if(res.body.hasErrors===false){
                request(app)
                .get(`/api/cookingCalendar/activeCookingDatesWithinSixtyDays?email=${res.body.data.email}&id=${res.body.data.id}`)
                .set('Authorization',`Bearer ${res.body.data.token}`)
                .expect(200)
                .send()
                .end((err,res1)=>{  
                    if(res1.body){
                        request(app)
                        .post('/api/order/deleteOrder')
                        .send({
                            email: res.body.data.email,
                            id: res.body.data.id,
                            order_id: res1.body.msg[1][0].orderId
                        })
                        .set('Authorization',`Bearer ${res.body.data.token}`)
                        .end((err,res2)=>{
                            if (checker === maxUsers){
                                done()
                            }
                        })
                    }
                    if(err){console.log(err)}
                })
            }
        })
        checker += 1
    }
})