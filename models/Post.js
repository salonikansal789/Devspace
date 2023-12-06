const mongoose=require('mongoose');
const registerPost=mongoose.Schema(
    {
        title:{
            type:String,
           
        },
        body:{
            type:String,
           
        },
        author:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
       
        createdAt: {
            type: Date,
            default: Date.now,
          },
        
      
      
        
    }
)
const PostCollection=new mongoose.model('PostCollection',registerPost);
module.exports=PostCollection;




