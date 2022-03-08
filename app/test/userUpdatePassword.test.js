//!req.body.id||!req.body.email||!req.body.currentPassword||!req.body.newPassword||!req.body.confirmPassword
const request = require('supertest')
const app = require('../app.js')
const maxUsers = 401
jest.setTimeout(10000);

function updatePassword(val){
    it('updatePassword',done=>{
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
            // if(res) console.log(res.body)
            if (err) throw err
            request(app)
            .post("/api/user/changePassword")
            .send({ 
                id: res.body.data.id,
                email:`user${val}@mail.com`,
                currentPassword:`Aa${val}`,
                newPassword: `Aa${val}_new`,
                confirmPassword: `Aa${val}_new`
            })
            .set('Accept', 'application/json')
            .set('Authorization',`Bearer ${res.body.data.token}`)
            .expect(200)
            .end((err,res)=>{
                // console.log(response._body)
                if(res) console.log(res.body)
                if (err) throw err
                done()
            })
        })
    })
}
for(let checker = 0; checker < maxUsers; checker++){
    updatePassword(checker)
}