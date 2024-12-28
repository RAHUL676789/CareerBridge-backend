
const mongoose = require("mongoose");
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    meetings:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"meeting"
        }
    ],
    converSations:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"conversation"

        }
    ],
    available:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"available"

        }
    ],
    profilePic:{
        type:String,
        default:""

    },
    
    profession:{
        type:String,
        required:true
    },
    charge:{
        type:Number,
        required:true
    },
    education:{
        type:String,
        required:true
    }
   
},{ timestamps: true }
)




userSchema.plugin(passportLocalMongoose);

userSchema.set('toObject', {
    transform: (doc, ret, options) => {
      // Delete `hash` and `salt` from the returned object
      delete ret.hash;
      delete ret.salt;
      return ret;
    }
  });

module.exports = mongoose.model("user",userSchema);