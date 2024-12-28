const { required } = require("joi");
const mongoose = require("mongoose");
const {Schema} = mongoose;


const availablitySchema = new Schema({
   day:{
    type:Date,
    default:Date.now()
   },
   start:{
    type:String,
    required:true
   },
   end:{
    type:String,
    required:true
    
   },
   available:{
      type:Boolean,
      default:true
   }
}
)

module.exports = mongoose.model("available",availablitySchema);