//npm modules
const bcrypt = require('bcrypt')
//saltRounds
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS)

//hashing password
exports.hash = (password) => {
    return bcrypt.hash(password,saltRounds)
}
//comparing password
exports.compare = (passwordString, passwordHashed) => {
    return bcrypt.compare(passwordString,passwordHashed)
}