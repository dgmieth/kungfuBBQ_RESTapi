//customed modules 
const db = require('./db/pool')
module.exports = class SocialMedia{
    constructor(){
        
    }
//=======================================================================================================
//=======================================================================================================
//=======================================================================================================
// CLASS STATIC METHODS
    static fetchSocialMediaIds(){
        return db.query(`CALL getSocialMediaIds();`)
    }
}