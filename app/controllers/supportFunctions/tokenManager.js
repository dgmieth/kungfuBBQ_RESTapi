//npm modules
const jwt = require(`jsonwebtoken`)
//application secret
const secret = process.env.APPLICATION_SECRET
//token generator
exports.tokenGenerator = (dataObject,userType) => {
    let expiration = ''
    if(userType===process.env.NORMAL_USER){     
        expiration=process.env.NORMAL_USER_EXP
    }else if(userType===process.env.ADMINISTRATIVE_USER){
        expiration=process.env.ADMINISTRATIVE_USER_EXP
    }
    return jwt.sign(dataObject, secret, {expiresIn: expiration})
}
exports.tokenPasswordRecovery = (dataObject) => {
    return jwt.sign(dataObject, secret, {expiresIn: process.env.PASSWORD_RECOVERY_EXP})
}
//token verifications
exports.verifyToken = (token) => {
    return verifyToken(token)
}
exports.verifyPasswordRecoveryToken = (token) => {
    return verifyToken(token)
}
//token decoder 
exports.tokenDecoder = (token) => {
    return verifyToken(token)
}

//common functions 
function verifyToken(token){
    return jwt.verify(token,secret)
}