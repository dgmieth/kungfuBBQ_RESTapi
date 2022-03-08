const request = require('supertest')
const app = require('../app.js')
const cdId = 20
const DQtty = 22
const maxUsers = 10

test("should respond with a 200 status code", done => {
    request(app)
    .get(`/api/osVersion/checkVersion?os_version=2.7&os=apple`)
    .expect(200)
    .send()
    .end((err,res1)=>{
        console.log('retirm')
    })
})