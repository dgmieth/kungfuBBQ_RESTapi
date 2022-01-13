//npm modules
const bcrytp = require('bcrypt')
//customed modules
const db = require('../../model/db/pool')
//saltRounds
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS)
//customed classes
const User = require('../../model/User')
//token
const tokenManager = require('./supportFunctions/tokenManager')
//customed functions
const returnLoggedInUserInfo = require('./supportFunctions/returnLoggedInUserInfo')
const encryption = require('./supportFunctions/encrytpion')
const passwordValidation = require('./supportFunctions/passwordValidation')
const io = require('./supportFunctions/socketIO')
const returnResJsonObj = require('./supportFunctions/returnResJsonObj')
//env variables
const noError = parseInt(process.env.NO_ERROR)
const normalUser = process.env.NORMAL_USER
const authError = parseInt(process.env.AUTH_ERROR)
const loginError = parseInt(process.env.LOGIN_ERROR)
const administrativeUser = parseInt(process.env.ADMINISTRATIVE_USER)
//controller functions
//REGISTER ==============================================================
exports.register = (req,res,next)=> {
    console.log(req.body)
    if(!req.body.email||!req.body.password||!req.body.confirmPassword||!req.body.code||!req.body.mobileOS||!req.body.name||!req.body.phoneNumber){
        return res.json(returnResJsonObj.resJsonOjbect(true,`{invalidFormat: true,neededFields: {code: 'string',email: 'string',password: 'string',confirmPassword: 'string',mobileOS:'string',phoneNumber:'string',name:'string',}}`,authError))
    }
    const code = req.body.code
    const email = req.body.email
    const password = req.body.password 
    const confirmPassword = req.body.confirmPassword
    const os = req.body.mobileOS
    validationObject = {
        msg: ''
    }
    //validating passwords
    //check if passowrds match
    if(password!==confirmPassword){
        validationObject.hasErrors = true
        validationObject.msg = validationObject.msg + 'Password and password confirmation do not match. '
    }
    //validatePassword
    if(!passwordValidation.validatePasswords(password,confirmPassword)){
        validationObject.hasErrors = true
        validationObject.msg = validationObject.msg + 'The password is 8 characters long and must contain numbers, letters and at least one CAPITAL letter'
    }
    if(validationObject.hasErrors){
        return res.json(returnResJsonObj.resJsonOjbect(true,validationObject.msg,authError))
    }
    //encrypting passwrod
    encryption.hash(password,saltRounds)
    .then(hashedPassword => {
        if(hashedPassword){
            const user = new User(email)
            user.setPassword = hashedPassword
            user.setCode = code
            user.setMobileOS = os
            user.setName = req.body.name
            user.setName = req.body.name === 'none' ? '' : req.body.name
            user.setPhoneNumber = req.body.phoneNumber === 'none' ? '' : req.body.phoneNumber
            user.setFacebookName = req.body.facebookName === 'none' ? '' : req.body.facebookName
            user.setInstagramName = req.body.instagramName === 'none' ? '' : req.body.instagramName
            user.save()
            .then(([userData,userMetaData])=>{
                var validate = parseInt(userData[1][0]['returnCode'])
                if(validate===-1){
                    return res.json(returnResJsonObj.resJsonOjbect(true,`Invitation code does not exist.`,validate))
                }
                if(validate===-2){
                    return res.json(returnResJsonObj.resJsonOjbect(true,`This code was not issued for this email.`,validate))
                }
                if(validate===-3){
                    return res.json(returnResJsonObj.resJsonOjbect(true,`This e-mail is already in use by another user in our database`,validate))
                }
                User.fetchByEmail(user.email)
                .then(([data3,meta3])=>{
                    const token = returnLoggedInUserInfo(data3[0],normalUser).token
                    io.emit(`${process.env.CUSTOMER}`,{userId: user.id, email: user.email})
                    return res.json(returnLoggedInUserInfo(data3[0],normalUser))})
                .catch(err => {
                    console.log('fetchUser error inner -> ',err)
                    return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to retrieve saved user information from database`,authError))})})
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to encrypt user password properly`,authError))}})
    .catch(err => {
        console.log('encryption -> ',err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to encrypt user password properly`,authError))})
}
//LOGIN ==============================================================
exports.login = (req,res,next)=>{
    console.log(req.body)
    if(!req.body.email||!req.body.password||!req.body.mobileOS){
        return res.json(returnResJsonObj.resJsonOjbect(true,`{invalidFormat: true,neededFields: {email: 'string',password: 'string',mobileOS:'string'}}`,authError))
    }
    const email = req.body.email
    const password = req.body.password 
    User.fetchByEmail(email)
    .then(([data,meat])=> {
        var userInfo = data[0][0]
        encryption.compare(password,userInfo.password)
        .then(correct => {
            const user = new User(userInfo.email)
            user.setID = userInfo.id
            user.setMobileOS = req.body.mobileOS
            if(correct){
                user.logLogIn()
                const token = returnLoggedInUserInfo(data[0],normalUser).token
                io.emit(`${process.env.CUSTOMER}`,{userId: user.id, email: user.email})
                res.json(returnLoggedInUserInfo(data[0],normalUser))
            }else {
                return res.json(returnResJsonObj.resJsonOjbect(true,`Incorrect password.`,authError))}})
        .catch(err => {
            console.log('compare -> ',err)
            return res.json(returnResJsonObj.resJsonOjbect(true,`Incorrect password.`,authError))})})
    .catch(err => {
        console.log('fetchUser -> ',err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to retrieve user information from database`,authError))})
}
//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================
//LOG-IN ADMINISTRATIVE PLATFORM =====================================
exports.logInAdministrativePlatform = (req,res,next) => {
    console.log(req.headers)
    if(!req.body.email||!req.body.password){
        return res.json(returnResJsonObj.resJsonOjbect(true,`{invalidFormat: true,neededFields: {email: 'string', password: 'string'}}`,authError))
    }
    const email = req.body.email
    const password = req.body.password 
    User.fetchByEmail(email)
    .then(([data,meat])=> {
        encryption.compare(password,data[0].password)
        .then(correct => {
            const user = new User(data[0].email)
            user.setID = data[0].id
            if(correct){
                user.logLogIn()
                return res.json(returnLoggedInUserInfo(data,administrativeUser))
            }else {
                return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to validate the password this time. Please check your password or try again in a couple of minutes.`,authError))}})
    }).catch(err => {
        console.log(err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`No user was found for this email and password in our database`,authError))})
}

//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================
//ISAUTH ==============================================================
exports.isAuth = (req,res,next) => {
    if(req.get('Authorization')){
        const token = req.get(`Authorization`).split(' ')[1]
        try {
            let decodedToken = tokenManager.verifyToken(token)
            if(decodedToken){
                if(decodedToken.email!==req.body.email&&decodedToken.id!==req.body.id){
                    return res.json(returnResJsonObj.resJsonOjbect(true,`Invalid token for this user. Please authenticate at /login/login`,parseInt(loginError)))    
                }
                next()
            }else{
                return res.json(returnResJsonObj.resJsonOjbect(true,`User has not been authenticated. Please authenticate at /login/login`,parseInt(loginError)))
            }
        }catch(e){
            return res.json(returnResJsonObj.resJsonOjbect(true,`Invalid token for this user. Please authenticate at /login/login`,parseInt(loginError)))
        }
    }else {
        return res.json(returnResJsonObj.resJsonOjbect(true,`No token found in request. Please authenticate at /login/login`,parseInt(loginError)))
    }
}
exports.isAuthGet = (req,res,next) => {
    if(req.get('Authorization')){
        const token = req.get(`Authorization`).split(' ')[1]
        try {
            let decodedToken = tokenManager.verifyToken(token)
            if(decodedToken){
                if(decodedToken.email!==req.query.email&&decodedToken.id!==req.query.id){
                    return res.json(returnResJsonObj.resJsonOjbect(true,`Invalid token for this user. Please authenticate at /login/login`,parseInt(loginError)))    
                }
                next()
            }else{
                return res.json(returnResJsonObj.resJsonOjbect(true,`User has not been authenticated. Please authenticate at /login/login`,parseInt(loginError)))
            }
        }catch(e){
            return res.json(returnResJsonObj.resJsonOjbect(true,`Invalid token for this user. Please authenticate at /login/login`,parseInt(loginError)))
        }
    }else {
        return res.json(returnResJsonObj.resJsonOjbect(true,`No token found in request. Please authenticate at /login/login`,parseInt(loginError)))
    }
}
//
//ISVALID RESET PASSWORD TOKEN========================================
exports.isValidResetPasswordToken = (req,res,next) => {
    try {
        let decodedToken = tokenManager.verifyPasswordRecoveryToken(req.query.token)
        if(decodedToken){
            next()
        }else{
            res.render('resetPasswordPageError')
        }
    }catch(e){
        console.log(e)
        User.resetPasswordPageLog(req.query.token)
        res.render('resetPasswordPageError')
    }
}


