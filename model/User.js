//customed modules 
const db = require('./db/pool')
module.exports = class User{
    constructor(email){
        this.email = email,
        this.password,
        this.code
        this.id
        this.name
        this.facebookName
        this.instagramName
        this.phoneNumber
        this.passwordRecoveryToken
        this.memberSince
        this.mobileOS
    }
    //set user attibutes
    set setPassword(password){
        this.password = password
    }
    set setCode(code){
        this.code = code
    }
    set setID(id){
        this.id = id
    }
    set setName(name){
        this.name = name
    }
    set setFacebookName(facebookName){
        this.facebookName = facebookName
    }
    set setInstagramName(instagramName){
        this.instagramName = instagramName
    }
    set setPhoneNumber(phoneNumber){
        this.phoneNumber = phoneNumber
    }
    set setPasswordRecoveryToken(passwordRecoveryToken){
        this.passwordRecoveryToken = passwordRecoveryToken
    }
    set setMemberSince(memberSince){
        this.memberSince = memberSince
    }
    set setMobileOS(mobileOS){
        this.mobileOS = mobileOS
    }
    //user creation===========================================================================================================
    save(){
        return db.query(`CALL createNewUser(?,?,?,?,?,?,?,?, @returnCode);SELECT @returnCode as returnCode;`, [`${this.email}`,`${this.password}`,`${this.mobileOS}`,`${this.code}`,`${this.name}`,`${this.phoneNumber}`, `${this.facebookName}`,`${this.instagramName}`])
    }
    //user update===========================================================================================================
    updateUserInfo(facebookID, instagramID){
        return db.query(`CALL updateUserInfo(?,?,?,?,?,?,?,?);`, 
                        [`${this.id}`,`${this.email}`,
                        `${this.name === null ? '' : this.name}`, `${this.phoneNumber===null?'':this.phoneNumber}`,
                        `${facebookID}`,`${this.facebookName}`,
                        `${instagramID}`,`${this.instagramName}`])
    }
    updateUserPassword(normalUpdate = true){
        return db.query(`CALL updateUserPassword(?,?,?,?);`,[`${this.id}`,`${this.email}`,`${this.password}`,`${normalUpdate ? 1 : 0}`])
    }
    savePasswordRecoveryToken(){
        return db.query(`CALL savePasswordRecoveryToken(?,?,?);`, [`${this.passwordRecoveryToken}`,`${this.id}`,`${this.email}`])
    }
    //user logs===========================================================================================================
    logLogIn(){
        return db.query(`CALL registerLog(1,1,NULL,?,?,?)`,[`${this.id}`,`${this.mobileOS}`,`${this.id}`])
    }
    logRecoveryPasswordRecoveryPageAccess(){
        return db.query(`CALL registerLog(7,1,NULL,?,NULL,NULL);`,[`${this.id}`,`${this.id}`])
    }
//=======================================================================================================
//=======================================================================================================
//=======================================================================================================
// CLASS STATIC METHODS
    static fetchByEmail(email){
        return db.query(`CALL getUserInformationByEmail(?, @returnCode);SELECT @returnCode as returnCode;`, [`${email}`])
    }
    static countuserByEmail(email){
        return db.query(`SELECT count(email) as checkuser FROM user WHERE excluded = 0 AND email = ?;`, [`${email}`])
    }
    //user logs===========================================================================================================
    static resetPasswordPageLog(token){
        return db.query(`CALL saveResetPasswordPageAccessDenied(?);`,[`${token}`])
    }
}