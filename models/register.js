const mongoose=require('mongoose');
const md5=require('md5');
const registerSchema=mongoose.Schema(
    {
        username:{
            type:String,
            required:true
        },
        profile:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        avatar: {
            type: String,
            default: function () {
              return `https://gravatar.com/avatar/${md5(this.email)}?s=128`;
            },
        }
      
        
    }
)
const RegisterCollection=new mongoose.model('RegisterCollection',registerSchema);
module.exports=RegisterCollection;