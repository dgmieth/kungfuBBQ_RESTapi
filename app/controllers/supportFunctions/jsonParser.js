//support functions
exports.activeCookingDateWithinNextSixtyDaysParsed = (arr) => {
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
                    dishIngredients: ff.dishIngredients ===null ? 'Not informed' : ff.dishIngredients,
                    dishDescription: ff.dishDescription ===null ? 'Not informed' : ff.dishDescription
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
                cookingStatus: r.cookingStatus===null ? 'Not informed' : r.cookingStatus ,
                menuID: r.menuID,
                dishes: dishes
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
                extras: innerArrayExtras
            })
        }
    })
    return [cdArray,oArray]
}