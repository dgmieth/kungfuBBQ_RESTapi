const { assert } = require('console')
const request = require('supertest')
const app = require('../app.js')
const maxUsers = 501
const initialUsers = 401
jest.setTimeout(10000);

function registerUser(val){
    it('registerUser',done=>{
        request(app)
        .post("/login/register")
        .send({ 
            email:`user${val}@mail.com`,
            password:`Aa${val}`,
            confirmPassword:`Aa${val}`,
            code:'none',
            mobileOS: val%2===0 ? 'Android' : 'Apple',
            name:`User_${val}`,
            phoneNumber:'0000000000',
            instagramName: 'none',
            facebookName: 'none'
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end((err,res)=>{
            // console.log(response._body)
            if(res) {   console.log(res.body)   }
            if (err) throw err
            done()
        })
    })
}
for(let checker = initialUsers; checker < maxUsers; checker++){
    registerUser(checker)
}
