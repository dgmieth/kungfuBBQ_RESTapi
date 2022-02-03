//node js models
const path = require('path')
const http = require('http')
//npm modules
const express = require('express')
const io = require('./controllers/supportFunctions/socketIO')
require('dotenv').config({path: path.join(__dirname,'../.env')})
//custom modules 
const tokenManager = require('./controllers/supportFunctions/tokenManager')
const { createAdapter } = require("@socket.io/redis-adapter")
const { createClient } = require("redis")
//express app creation
const app = express()
//routers
const authRouter = require('./routers/authRouter')
const indexRouter = require('./routers/indexRouter')
// express app configuration
app.use(express.urlencoded())
app.use(express.json())
app.set('view engine','ejs')
app.set('views', path.join(__dirname,'../views'))
app.use(express.static(path.join(__dirname,'../views/public')))
app.use((req,res,next)=> {
    res.setHeader('Access-Control-Allow-Methods','OPTIONS,GET,POST,PUT,DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
    next()
})
app.use((req,res,next)=>{
    console.log('request received')
    next()
})
app.use('/login', authRouter)
app.use('/api', indexRouter)
const authController = require('./controllers/authCtrl')
console.log(`app 1`)
//port
const httpPort = process.env.NODE_ENV===`prod` ? parseInt(process.env.PROD_DOOR) : parseInt(process.env.DEV_DOOR)
//server 
const httpServer = http.createServer(app)
//socket.io
// const pubClient = createClient(6379,'127.0.0.1');
// const subClient = pubClient.duplicate();
// pubClient.on('error', (err) => console.log('Redis Client Error', err));
      
// pubClient.connect();
// subClient.connect();
// io.adapter(createAdapter(pubClient, subClient,()=>{
//     console.log('adapter')
// }));
//check developer settings 
if(process.env.NODE_ENV!=='prod'){
    console.log(process.env.NODE_ENV)
    console.log(parseInt(process.env.DEV_DOOR))
}else{
    console.log(parseInt(process.env.PROD_DOOR))
}
io.attach(httpServer,{
    cors: {
        origin:process.env.KUNGFU_BBQ_ADM_DNS,
        methods:['GET','POST'],
        credentials: true
    }
})
//http server creation
httpServer.listen(httpPort)
