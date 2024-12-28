const ConverSation  = require("../Models/ConversationSchema")


// getconversation function for different purpose


module.exports.getConversationById = async(currid)=>{
    try{

        if(currid){
          const currentUserConverSation = await ConverSation.find({
            "$or":[{sender:currid},{receiver:currid}]
           }).populate("message").populate("sender").populate("receiver").sort({updatedAt:-1});
       
           const conversation = currentUserConverSation.map((conv,idx)=>{
             const convUserMsg = conv.message.reduce((prev,curr)=>{
                const msgByUserId = curr.sender.toString();
              
                if(msgByUserId !== currid){
                   return  prev+(curr.seen ? 0 :1)
                }else{
                    return prev;
                }
             },0);
               
             console.log(conv,"this is getconversasation fucntion");
            
             return{
               _id:conv?._id,
               sender:conv?.sender,
               receiver:conv?.receiver,
               unseenmsg:convUserMsg,
               lastmsg:conv.message[conv?.message.length-1]
       
             }
           })
          return conversation;
        }else{
            return [];
        }
        
      
      }catch(e){
              console.log(e);
      }
}