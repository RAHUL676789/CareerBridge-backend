const mongoose = require("mongoose");
const {Schema} = mongoose;


const converSationSchema = new Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    message:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"message"
        }
    ]
},{ timestamps: true }
)

module.exports = mongoose.model("converSation",converSationSchema);