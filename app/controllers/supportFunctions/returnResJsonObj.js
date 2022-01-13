exports.resJsonOjbect = (hasErrors = true, msg, errorCode = -1) =>{
    return ({
        hasErrors: hasErrors,
        msg: msg,
        errorCode: parseInt(errorCode)
    })
}