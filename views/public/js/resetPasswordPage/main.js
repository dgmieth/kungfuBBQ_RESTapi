document.getElementById('submitBtn').addEventListener('click',(e)=>{
    const password = document.getElementsByName('password')[0].value
    const confirmPassword = document.getElementsByName('confirmPassword')[0].value
    console.log(password,confirmPassword)
    var message = ''
    if(password===''||password===null){
        message = 'You must inform a password.'
    }
    if(confirmPassword===''||confirmPassword===null){
        message = `${message} You must inform the confirmation password.`
    }
    if(password!==confirmPassword){
        message = `${message} Password and confirmation password must match!`
    }
    if(password.length>8||confirmPassword.length>8){
        message = `${message} Password and confirmation password must be 8 alphnumerical characters`
    }
    if(message!==''){
        alert(message)
        return
    }
    const dataObj = {
        password: password,
        confirmPassword: confirmPassword,
        email: document.getElementsByName('email')[0].value
    }
    console.log(dataObj)
    console.log(JSON.stringify(dataObj))
    fetch(`/api/User/resetPassword`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${document.getElementsByName('token')[0].value}`
        },
        body: JSON.stringify(dataObj)
    })
    .then(answer => {
        return answer.json()
    })
    .then(response => {
        console.log(response)
        if(!response.hasErrors){
            document.getElementById(`mainForm`).style.display = `none`
            document.getElementById(`successPage`).style.display = `block`
        }else {
            document.getElementById(`errors`).innerHTML = response.msg
            document.getElementById(`alert`).style.display = `block`
        }
    })
    .catch(err => {
        console.log(err)
    })

})