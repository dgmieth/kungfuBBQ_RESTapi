//token
const tokenManager = require('./tokenManager')

module.exports = function returnLoggedInUserInfo(dataArray,userType){
    //const date = `${dataArray[0].createdIn.toISOString()}`
    const date = `${dataArray[0].createdIn}`
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const day = parseInt(date.split('T')[0].split('-')[2])
    const month = months[parseInt(date.split('T')[0].split('-')[1])-1]
    const year = parseInt(date.split('T')[0].split('-')[0])
    return {
        hasErrors: false,
        data: {
            id: dataArray[0].id,
            name: dataArray[0].name,
            email: dataArray[0].email,
            memberSince: `${year} ${month} ${day}`,
            phoneNumber: dataArray[0].phoneNumber,
            socialMediaInfo: [
                {
                    socialMedia: dataArray[0].socialMedia ? dataArray[0].socialMedia : '',
                    socialMediaName: dataArray[0].socialMediaName ? dataArray[0].socialMediaName : '',
                },
                {
                    socialMedia: dataArray.length !== 2 ? '' : dataArray[1].socialMedia ? dataArray[1].socialMedia : '',
                    socialMediaName: dataArray.length !== 2 ? '' : dataArray[1].socialMediaName ? dataArray[1].socialMediaName : ''
                }
            ],
            token: tokenManager.tokenGenerator({id: dataArray[0].id,email: dataArray[0].email,memberSince: dataArray[0].createdIn, currentRequestTime: new Date()},userType)
        },
        errorCode: process.env.NO_ERROR
    }
}