const request = require('supertest')
const app = require('../app.js')
const maxUsers = 401
jest.setTimeout(10000);

function loginUser(val){
    it('loginUser',done=>{
        request(app)
        .post("/login/login")
        .send({ 
            email:`user${val}@mail.com`,
            password:`Aa${val}`,
            mobileOS: val%2===0 ? 'Android' : 'Apple'
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err,res)=>{
            // console.log(response._body)
            if(res) console.log(res.body)
            if (err) throw err
            done()
        })
    })
}
for(let checker = 0; checker < maxUsers; checker++){
    loginUser(checker)
}