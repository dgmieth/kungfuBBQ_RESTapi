//support functions
exports.activeCookingDateWithinNextTwelveMonthsParsed = (arr) => {
    var ctrlId = -1
    var cdArray = []
    var oArray = []
    arr[0].forEach(r => {
        if(r.cookingDateId!==ctrlId){
            ctrlId=r.cookingDateId
            var dishes = []
            var filteredArray = arr[0].filter(f => {
                if(f.cookingDateId===ctrlId){
                    return true
                }
                return false
            })
            filteredArray.forEach(ff => {
                dishes.push({
                    dishId: ff.dishId,
                    dishName: ff.dishName,
                    dishPrice: ff.dishPrice,
                    dishFifo: ff.dishFifo,
                    dishIngredients: ff.dishIngredients ===null ? '' : ff.dishIngredients,
                    dishDescription: ff.dishDescription ===null ? '' : ff.dishDescription
                })
            })
            cdArray.push({
                cookingDateId: r.cookingDateId,
                //cookingDate: r.cookingDate.toISOString().split('T').join(' ').split('.')[0],
                cookingDate: r.cookingDate,
                mealsForThis: r.mealsForThis,
                addressId: r.addressId,
                street: r.street===null ? 'Not informed' : r.street ,
                complement: r.complement ===null ? 'Not informed' : r.complement ,
                city: r.city===null ? 'Not informed' : r.city,
                state: r.state===null ? 'Not informed' : r.state ,
                zipcode: r.zipcode  ===null ? 'Not informed' : r.zipcode,
                country: r.country  ===null ? 'Not informed' : r.country,
                lat: r.lat  ===null ? -9999999999 : parseFloat(r.lat),
                lng: r.lng  ===null ? -9999999999 : parseFloat(r.lng),
                cookingStatusId: r.cookingStatusId,
                cookingStatus: r.cookingStatus===null ? 'Not informed' : 
                                [1,2,3,4].includes(r.cookingStatusId) ? r.cookingStatus : 
                                arr[1].some(r1 => r1.cookingDateId===r.cookingDateId && [5,8,9,10,11].includes(r1.orderStatusId)) ? 'Order paid' : 
                                arr[1].some(r1 => r1.cookingDateId===r.cookingDateId && r1.orderStatusId === 3) ? 'Accepting payments' :
                                arr[1].some(r1 => r1.cookingDateId===r.cookingDateId && r1.orderStatusId === 4) ? 'Order on wait list' :
                                'Close to orders',
                menuID: r.menuID,
                dishes: dishes,
                cookingDateAmPm:r.cookingDateAmPm
            })
        }
    })
    ctrlId = -1 
    arr[1].forEach(r => {
        if(r.orderId!==ctrlId){
            ctrlId = r.orderId
            var innerArrayDish = []
            var innerArrayExtras= []
            var filteredArray = arr[1].filter(f => {
                if(f.orderId===ctrlId){
                    return true
                }
                return false
            })
            //console.log(filteredArray)
            filteredArray.forEach(ff => {
                if(ff.dishId!==null){
                    innerArrayDish.push({
                        dishId: ff.dishId,
                        dishName: ff.dishName,
                        dishQtty: ff.dishQtty,
                        dishFifo: ff.dishFifo,
                        dishPrice: ff.dishPrice,
                        observation: ff.observation ===null ? 'Not informed' : ff.observation
                    })
                }
                if(ff.extrasId!==null){
                    innerArrayExtras.push({
                        extrasId: ff.extrasId,
                        extrasName: ff.extrasName,
                        extrasQtty: ff.extrasQtty ,
                        extrasPrice: ff.extrasPrice,
                        observation: ff.observation ===null ? 'Not informed' : ff.observation,
                    })
                }
            })
            oArray.push({
                orderId: r.orderId,
                //orderDate: r.orderDate.toISOString().split('T').join(' ').split('.')[0],
                orderDate: r.orderDate,
                orderStatusId: r.orderStatusId,
                cookingDateId: r.cookingDateId,
                orderStatusName: r.orderStatusName,
                userId: r.userId,
                userName: r.userName,
                userEmail: r.userEmail,
                userPhoneNumber: r.userPhoneNumber,
                dishes: innerArrayDish,
                extras: innerArrayExtras,
                tipAmount: r.tipAmount === null ? 0 : r.tipAmount
            })
        }
    })
    //onsole.log(oArray[0].tipAmount)
    return [cdArray,oArray]
}