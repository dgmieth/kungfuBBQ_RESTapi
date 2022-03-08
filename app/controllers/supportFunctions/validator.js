/*
    Checks if string is null, undefined, empty or if it contains 'none', in any of these cases, return empty string, else returns full string
*/
exports.stringContent = (e) => {
    if(e===null||e===''||e===undefined||e==='none'){  return ''   }
    return e
}
/*
    validate email address
*/
exports.validateEmailAddress = (email)=>{
    var regex = new RegExp(process.env.EMAIL_REGEX_VALIDATION)
    if(email.match(regex)){ return true }
    return false
}