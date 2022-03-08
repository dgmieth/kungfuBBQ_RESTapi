// checks if password passes test of digits, letters and at least one CAPITAL letter ------
// ----------------------------------------------------------------------------------------
exports.validatePasswords = (password,confirmPassword) => {
    const regex = new RegExp(process.env.PASSWORD_REGEX_SEQUENCE)
    if(!password.match(regex)||!confirmPassword.match(regex)){  return false    }
    return true
}
// checks if current password is equal to new password ------------------------------------
// ----------------------------------------------------------------------------------------
exports.checkCurrentPasswordAndNewPasswordEquality = (currentPassword,newPassword) => {
    if(currentPassword===newPassword){  return false    }
    return true
}
// checks if new password is to its confirmation ------------------------------------------
// ----------------------------------------------------------------------------------------
exports.checkPasswordAndPasswordConfirmationEquality = (newPassoword,passworConfirmation) => {
    if(newPassoword===passworConfirmation){     return true     }
    return false
}
exports.checkPasswordAndPasswordConfirmationLength = (newPassoword,passworConfirmation) => {
    if(newPassoword.length>=3 && newPassoword.length<=20){     return true     }
    return false
}