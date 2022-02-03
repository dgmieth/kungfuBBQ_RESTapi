//npm modules
const mysql = require('mysql2/promise')
//pool creation
const pool = mysql.createPool({
    multipleStatements: true,
    host: process.env.DB_HOST,
    //database: process.env.DB_DATABASE,
    database: process.env.NODE_ENV==='prod' ? process.env.DB_DATABASE_PRODUCTION : process.env.DB_DATABASE_TEST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dateStrings: 'date'
})
pool.query(`SET time_zone = 'America/New_York';`)
.then(([data,meta])=> {
    console.log(data)
    pool.query(`SELECT NOW();SELECT DATABASE();`)
    .then(([now,nowMeta])=>{
        console.log(now)
    })
})
.catch(err => {
    console.log(err, '---> not possible to set timezone')
})
module.exports = pool 
