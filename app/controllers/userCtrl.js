//npm modules
const jwt = require(`jsonwebtoken`)
//customed modules
const db = require('../../model/db/pool')
//customed classes
const User = require('../../model/User')
const SocialMedia = require('../../model/SocialMedia')
//custom functions
const returnLoggedInUserInfo = require('./supportFunctions/returnLoggedInUserInfo')
const encryption = require('./supportFunctions/encrytpion')
const passwordValidation = require('./supportFunctions/passwordValidation')
const tokenManager = require('./supportFunctions/tokenManager')
const sendEmail = require('./supportFunctions/sendEmail')
const returnResJsonObj = require('./supportFunctions/returnResJsonObj')
const io = require('./supportFunctions/socketIO')
//controller functions

//env variables
const noError = parseInt(process.env.NO_ERROR)
const userError = parseInt(process.env.USER_ERROR)
const normalUser = process.env.NORMAL_USER
//FORGOT PASSWORD ==============================================================
// sends email to reset password -----------------------------------------------
// -----------------------------------------------------------------------------
exports.forgotPassword = (req,res,next) => {
    console.log(req.body)
    if(!req.body.email){
        return res.json(returnResJsonObj.resJsonOjbect(true,`{invalidFormat: true,neededFields: {email: 'string'}`,userError))
    }
    //check if there is a User with that email address
    User.fetchByEmail(req.body.email)
    .then(([userData,userMeta])=> {
        var data = userData[0]
        if(data){
            const user = new User(req.body.email)
            user.setID = data[0].id
            user.setName = data[0].name
            user.setMemberSince = data[0].createdIn
            user.setPasswordRecoveryToken = tokenManager.tokenPasswordRecovery({id: user.id, email: user.email, memberSince: user.memberSince, currentRequestTime: new Date()})
            user.savePasswordRecoveryToken()
            .then(([data2,meta2])=>{
                if(data2.affectedRows>0){
                    sendEmail(user.email,'Password Recovery',{name: user.name, link: `${process.env.KUNGFU_BBQ_API_DNS}/api/User/resetPassword?token=${user.passwordRecoveryToken}`})
                    return res.json(returnResJsonObj.resJsonOjbect(false,`Passowrd recovery e-mail sent to ${user.email}`,noError))            
                }else{
                    return res.json(returnResJsonObj.resJsonOjbect(true,'Server error. Could not generate password recovery token.',userError))}})
            .catch(err => {
                console.log(err)
                return res.json(returnResJsonObj.resJsonOjbect(true,'Server error. Could not generate password recovery token.',userError))})
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,'Server could not find user in database',userError))}})
    .catch(err => {
        console.log(err)
        return res.json(returnResJsonObj.resJsonOjbect(true,'Server could not find user in database',userError))})
}
// renders page to reset password ----------------------------------------------
// -----------------------------------------------------------------------------
exports.resetPasswordGet = (req,res,next) => {
    try {
        let decodedToken = tokenManager.tokenDecoder(req.query.token)
        User.fetchByEmail(decodedToken.email)
        .then(([userData,userMeta])=>{
            var data = userData[0]
            console.log(data[0].passwordRecoveryToken)
            if(data[0].passwordRecoveryToken===null){
                return res.render('resetPasswordPageError')
            }
            if(data){
                const user = new User(decodedToken.email)
                user.setID = decodedToken.id
                user.setName = data[0].name
                user.setMemberSince = data[0].createdIn
                user.logRecoveryPasswordRecoveryPageAccess()
                res.render('resetPasswordPage', {name: user.name, email: user.email, token: tokenManager.tokenGenerator({name: user.name, email: user.email, memberSince: user.memberSince, currentRequestTime: new Date()},normalUser)})
            }else{
                return res.json(returnResJsonObj.resJsonOjbect(true,`Can't find valid User for this token password recovery`,userError))}})
        .catch(err => {
            console.log('fetchUser -> ', err)
            return res.render('resetPasswordPageError')})
    } catch(e){
        console.log(e)
        return res.render('resetPasswordPageError')}
}
// resets password and saves it to database ------------------------------------
// -----------------------------------------------------------------------------
exports.resetPasswordPost = (req,res,next) => {
    var validationObject = {
        hasErrors: false,
        msg: ``
    }
    if(!req.body.email||!req.body.password||!req.body.confirmPassword){
        return res.json(returnResJsonObj.resJsonOjbect(true,`{invalidFormat: true,neededFields: {email: 'string',password: 'string',confirmPassword: 'string'}}`,userError))
    }
    if(!passwordValidation.checkPasswordAndPasswordConfirmationEquality(req.body.password,req.body.confirmPassword)){
        validationObject.hasErrors = true
        validationObject.msg = 'Password and confirmation of password do not match.'
    }
    if(!passwordValidation.validatePasswords(req.body.password,req.body.confirmPassword)){
        validationObject.hasErrors = true
        validationObject.msg = `${validationObject.msg} Password must contain numbers and letters and at least one CAPITAL letter`
    }
    if(validationObject.hasErrors){
        return res.json(returnResJsonObj.resJsonOjbect(true,validationObject.msg,userError))
    }else{
        User.fetchByEmail(req.body.email)
        .then(([userData,userMeta])=>{
            var data0 = userData[0]
            if(data0){
                const user = new User(data0[0].email)
                user.setID = data0[0].id
                encryption.hash(req.body.password)
                .then(hashed => {
                    user.setPassword = hashed
                    user.updateUserPassword(false)
                    .then(([data1,meta1])=> {
                        if(data1){
                            return res.json(returnResJsonObj.resJsonOjbect(false,'Password reset successfully',noError))
                        }else{
                            return res.json(returnResJsonObj.resJsonOjbect(true,`Attempt to update user password failed. Please try again later.`,userError))}})
                    .catch(err => {
                        console.log(err)
                        return res.json(returnResJsonObj.resJsonOjbect(true,`Attempt to update user password failed. Please try again later.`,userError))})})
                .catch(err => {
                    console.log(err)
                    return res.json(returnResJsonObj.resJsonOjbect(true,`Attempt to encrypt user password failed. Please try again later.`,userError))})
            }else{
                return res.json(returnResJsonObj.resJsonOjbect(true,'Could not find user in database',userError))}})
        .catch(err => {
            console.log(err)
            return res.json(returnResJsonObj.resJsonOjbect(true,'Could not find user in database',userError))})}
}
//UPDATE INFO==============================================================
exports.updateInfo = (req,res,next) => {
    console.log(req.headers)
    //check if body contains all necessary information
    if(!req.body.id||!req.body.email||!req.body.name||!req.body.phoneNumber||!req.body.facebookName||!req.body.instagramName){
        return res.json(returnResJsonObj.resJsonOjbect(true,`{invalidFormat: true,neededFields: {id: 'string',email: 'string',name: 'string for null send none',phoneNumber: 'int for null send 999',facebookName: 'string for null send none',instagramName: 'string for null send none',}}`,userError))
    }
    //get User information for that email and check if id matches
    User.fetchByEmail(req.body.email)
    .then(([userData,userMeta])=> {
        var data = userData[0]
        if(data[0].email){
            //check if User to be updated is the User that exists in the database
            if(data[0].id === parseInt(req.body.id)){
                const user = new User(data[0].email)
                user.setID = parseInt(data[0].id)
                user.setName = req.body.name === 'none' ? '' : req.body.name
                user.setPhoneNumber = req.body.phoneNumber === 'none' ? '' : req.body.phoneNumber
                user.setFacebookName = req.body.facebookName === 'none' ? '' : req.body.facebookName
                user.setInstagramName = req.body.instagramName === 'none' ? '' : req.body.instagramName
                SocialMedia.fetchSocialMediaIds()
                .then(([data,meta])=> {
                    var fbID, inID
                    data[0].forEach(socialMedia => {
                        if(socialMedia.socialMedia==='Facebook'){
                            fbID = socialMedia.id
                        }
                        if(socialMedia.socialMedia==='Instagram'){
                            inID = socialMedia.id
                        }})
                    user.updateUserInfo(fbID,inID)
                    .then(([data1,meta1])=>{
                        if(data1){
                            User.fetchByEmail(user.email)
                            .then(([userData1,userMeta1])=>{
                                var data3 = userData1[0]
                                if(data3){
                                    console.log('beforeEmit')
                                    io.emit(`${process.env.CUSTOMER}`,{userId: user.id, email: user.email})      
                                    console.log('afterEmit')
                                    return res.json(returnLoggedInUserInfo(data3,normalUser)) 
                                }else{
                                    return res.json(returnResJsonObj.resJsonOjbect(true,`Could not find user in database`,userError))   
                                }})
                            .catch(err => {
                                return res.json(returnResJsonObj.resJsonOjbect(true,`Could not find user in database`,userError))})
                        }else{
                            return res.json(returnResJsonObj.resJsonOjbect(true,`Could not update user information`,userError))}})
                    .catch(err => {
                        console.log(err)
                        return res.json(returnResJsonObj.resJsonOjbect(true,`Could not update user information`,userError))})})
                .catch(err => {
                    console.log(err)
                    return res.json(returnResJsonObj.resJsonOjbect(true,`Could not find user in database`,userError))})}
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,`Could not find user in database`,userError))}})
    .catch(err => {
        console.log(err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`Could not find user in database`,userError))})
}
//CHANGE PASSWORD==========================================================
exports.changePassword = (req,res,next) => {
    var validationObject = {
        hasErrors: false,
        msg: ''
    }
    //check if body contains all necessary information
    if(!req.body.id||!req.body.email||!req.body.currentPassword||!req.body.newPassword||!req.body.confirmPassword){
        return res.json(returnResJsonObj.resJsonOjbect(true,`{invalidFormat: true,neededFields: {id: 'string', email: 'string',currentPassword: 'string',newPassword: 'string',confirmPassword: 'string'}}`,userError))   
    }
    if(!passwordValidation.checkCurrentPasswordAndNewPasswordEquality(req.body.currentPassword,req.body.newPassword)){
        validationObject.hasErrors = true
        validationObject.msg = validationObject.msg + "Current password and new password are the same. "
    }
    if(!passwordValidation.checkPasswordAndPasswordConfirmationEquality(req.body.newPassword,req.body.confirmPassword)){
        validationObject.hasErrors = true
        validationObject.msg = validationObject.msg + 'New password and new password confirmation are not equal. '
    }
    if(!passwordValidation.validatePasswords(req.body.newPassword,req.body.confirmPassword)){
        validationObject.hasErrors = true
        validationObject.msg = validationObject.msg + 'Password must contain numbers and letters and at least one CAPITAL letter. '
    }
    if(validationObject.hasErrors){
        return res.json(returnResJsonObj.resJsonOjbect(true,validationObject.msg,userError))   
    }
    User.fetchByEmail(req.body.email)
    .then(([userData,userMeta])=> {
        var data = userData[0]
        if(parseInt(req.body.id) === data[0].id){
            encryption.compare(req.body.currentPassword,data[0].password)
            .then(result => {
                if(result){
                    encryption.hash(req.body.newPassword)
                    .then(hashed => {
                        const user = new User(req.body.email)
                        user.setPassword = hashed
                        user.setID = parseInt(req.body.id)
                        user.updateUserPassword()
                        .then(([data1,meta1])=>{
                            if(data1){
                                if(data1.affectedRows>0){
                                    return res.json(returnResJsonObj.resJsonOjbect(false,`Password updated successfully`,noError))}
                            }else{
                                return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to update user password failed`,userError))}})
                        .catch(err => {
                            console.log(err)
                            return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to update user password failed`,userError))})})
                    .catch(err => {
                        console.log(err)
                        return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to encrypt user password failed`,userError))})
                }else{
                    return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to validate current user failed`,userError))}})
            .catch(err => {
                console.log(err)
                return res.json(returnResJsonObj.resJsonOjbect(true,`The attempt to validate current user failed`,userError))})
        }else {
            return res.json(returnResJsonObj.resJsonOjbect(true,`Could not find user in database`,userError))}})
    .catch(err => {
        console.log(err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`Could not find user in database`,userError))})
}
//RENEW TOKEN==========================================================
exports.renewToken = (req,res,next) => {
    console.log('renewToken')
    //check if body contains all necessary information
    if(!req.query.email){
        return res.json(returnResJsonObj.resJsonOjbect(true,`{invalidFormat: true,neededFields: {email: 'string'}}`,userError))}
    //res.json({success: 'renewToken'})
    User.fetchByEmail(req.query.email)
    .then(([userData,userMeta])=>{
        var data = userData[0]
        if(data){
            return res.json(returnResJsonObj.resJsonOjbect(false,`${tokenManager.tokenGenerator({id: data[0].id,email: data[0].email,memberSince: data[0].createdIn, currentRequestTime: new Date()},normalUser)}`,noError))}
        return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to renew authentication token at this time!`,process.env.USER_ERROR))})
    .catch(err => {
        console.log(err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`Not possible to renew authentication token at this time! Server message: ${err}`,process.env.USER_ERROR))})
}
