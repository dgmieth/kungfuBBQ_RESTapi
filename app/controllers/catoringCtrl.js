//npm modules
const jwt = require(`jsonwebtoken`)
//customed modules
const db = require('../../model/db/pool')
const io = require('./supportFunctions/socketIO')
//customed classes
const CatoringContact = require('../../model/CatoringContact')
const returnResJsonObj = require('./supportFunctions/returnResJsonObj')
//controller functions
const validator = require('./supportFunctions/validator')
//env variables
const noError = parseInt(process.env.NO_ERROR)
const newCateringContact = parseInt(process.env.NEW_CATORING_CONTACT)
const cateringError = parseInt(process.env.CATERING_ERROR)
//SAVE REQUEST ==============================================================
exports.saveContact = (req,res,next)=>{
    console.log(req.headers)
    req.body.orderDescription = req.body.orderDescription.replace(/'/ig,'`').replace(/\t|\n|\n|\r/gm,'')
    if(!validator.validateEmailAddress(req.body.email)){
        return res.json(returnResJsonObj.resJsonOjbect(true,`You must inform a valid e-mail address.`,cateringError))      }
    CatoringContact.newContact(req.body)
    .then(([data,meta])=> {
        if(data){
            io.emit(`${process.env.CATERING}`,{msg: "new catering message"})
            return res.json(returnResJsonObj.resJsonOjbect(false,`Your message was received by Kungfu BBQ. Please, wait our return.`,noError))   
        }else{
            return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to send your message right now. Please try again later.`,cateringError))   }   })
    .catch(err => {
        console.log(err)
        return res.json(returnResJsonObj.resJsonOjbect(true,`It was not possible to send your message right now. Please try again later.`,cateringError))   })
}