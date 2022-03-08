const request = require('supertest')
const app = require('../app.js')
const cdId = 8
const DQtty = 8
const orderID = 19

test("should respond with a 200 status code", done => {
    request(app)
    .post("/login/login")
    .send({ 
        email: "dgmieth@gmail.com", 
        password: "T27ago16" ,
        mobileOS:"Apple"
    })
    .set('Accept', 'application/json')
    .expect(200)
    .end((err,res)=>{
        // console.log(response._body)
        if(res) console.log(res.body)
        if (err) throw err
        if(res.body.hasErrors===false){
            request(app)
            .post('/api/order/updateOrder')
            .send({
                email: res.body.data.email,
                id: res.body.data.id,
                new_qtty: DQtty,
                order_id: orderID,
            })
            .set('Authorization',`Bearer ${res.body.data.token}`)
            .end((err,res2)=>{
                console.log(res2._body)
                done()
            })

            
        }
    })
})