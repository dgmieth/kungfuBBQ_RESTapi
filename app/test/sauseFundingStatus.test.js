const request = require('supertest')
const app = require('../app.js')
const maxUsers = 401
jest.setTimeout(10000);

it('sauseFunding_checkCampaignStatus',done=>{
    request(app)
    .get("/api/sause/checkstatus")
    .expect(200)
    .end((err,res)=>{
        // console.log(response._body)
        if(res) console.log(res._body)
        if (err) throw err
        done()
    })
})


