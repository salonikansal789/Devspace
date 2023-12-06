// const usersCollection = require('../db').db().collection("users");

// let User = function(data){
//     this.data = data
// }

// User.prototype.register = function(){
//     // use arrow function below instead of traditional function otherwise this.data will be undefined 
//     // and mongodb error: Cannot read property '_id' of undefined as the data will be empty
//     return new Promise(async (resolve, reject)=>{
//         await usersCollection.insertOne(this.data)
//         resolve()
//     })
// }


// module.exports = User