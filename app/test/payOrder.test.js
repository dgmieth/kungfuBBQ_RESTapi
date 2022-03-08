const request = require('supertest')
const app = require('../app.js')
const cdId = 11
const DQtty = 22
const order_id = 25
const cookingDate_id = 11
const cardCode = '115'
const cardNumber = '4984234060287627'
const expirationDate = '2024-10'

test("should respond with a 200 status code", done => {
    request(app)
    .post("/login/login")
    .send({ 
        email: "o", 
        password: "Aa123456789012345678" ,
        mobileOS:"Android"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err,res)=>{
        // console.log(response._body)
        //if(res) console.log(res.body)
        if (err) throw err
        if(res.body.hasErrors===false){
            request(app)
            .post("/api/order/payOrder")
            .send({ 
                id:  res.body.data.id, 
                email: res.body.data.email, 
                order_id: order_id,
                cookingDate_id: cookingDate_id,
                cardCode: cardCode,
                cardNumber: cardNumber,
                expirationDate: expirationDate,
                tip: "12.0"
            })
            .set('Authorization',`Bearer ${res.body.data.token}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err1,res1)=>{
                if(res1) console.log(res1.body)
                if (err1) throw err
            })
        }
    })
})