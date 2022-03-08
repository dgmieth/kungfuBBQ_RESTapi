// if(!req.body.id||!req.body.email||!req.body.name||!req.body.phoneNumber||!req.body.facebookName||!req.body.instagramName)
const request = require('supertest')
const app = require('../app.js')
const maxUsers = 401
jest.setTimeout(10000);

function updateUser(val){
    it('updateUser',done=>{
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
            request(app)
            .post("/api/user/updateInfo")
            .send({ 
                id: res.body.data.id,
                name: res.body.data.name+`_updated`,
                phoneNumber: `0000000001`,
                facebookName: `facebokUser_${res.body.data.id}`,
                instagramName: `instaUser_${res.body.data.id}`,
                email:`user${val}@mail.com`,
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
    updateUser(checker)
}