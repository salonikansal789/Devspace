
const mongoose=require('mongoose');
const dotenv = require('dotenv')
dotenv.config()
const connection = async()=>{
    try{
        const connectionString = process.env.URL;
        await mongoose.connect(connectionString);
        console.log("connected succesfully");
    }catch(error){
        console.log("something went wrong while connecting with database",error);
    }
    }
    
    module.exports={connection};
    
    
    // app.js
    
    // const { connection} = require("./db/conn");
    
    // conncetion();