
const User = require("../Models/userSchema");
const Available = require("../Models/AvailabilitySchema");
const passport = require("passport");

// this is signup function for registring the new user
// module.exports.singup = async(req,res,next)=>{
//  console.log("sinup roudert testing")
//     const {username,email,profession,password,charge,education} = req.body;

//     const newUser = new User (
//         {
//         username,
//         email,
//         profession,
//         charge,
//         education
//        }
//     );

//    const registerUser = await User.register(newUser,password);


//    console.log(registerUser);
//    req.login(registerUser, (err) => {
//       if (err) {
//           return next(err);
//       }
//       req.session.save((err) => {  // Force session save
//           if (err) {
//               return next(err);
//           }
//           console.log("Session saved after signup:", req.session);
//          console.log("req.user after signup:", req.user);
//           console.log("User logged in:", req.user); // Check req.user after login
       
//       });
//   });
  
//   const userDetail = registerUser.toObject();

//   return  res.status(200).json({"message":"user register successfully","data":userDetail,"success":true});

     
        

// }



module.exports.signUpPost= async (req, res) => {

   try {
      const {username,email,profession,password,charge,education} = req.body;
      const user1 = new User (
         {
         username,
         email,
         profession,
         charge,
         education
        }
     );

       let newUser = await User.register(user1, password);
       req.logIn(newUser, (err) => {
           if (err) {
               return next(err);
           }

           return  res.status(200).json({"message":"user register successfully","data":newUser,"success":true});
          
       })

   }
   catch (err) {
      res.status(404).json({message:err.message || "unexpected error",error:true})
   }

}


// this the login function for already a user


module.exports.login = async (req, res, next) => {
   console.log("Login attempt:", req.user);  // Check user at login
   console.log("Session info:", req.session);

   req.login(req.user, (err) => {
       if (err) return next(err);
       res.json({ message: 'Login successful', data: req.user.toObject(), success: true });
   });
};



// get for all user

module.exports.allUser = async(req,res,next)=>{
 

   let userData = await User.find().sort({createdAt:-1});
   if(userData.length > 0){
      
   
      if(res.locals.currUser?._id){
         userData = userData.filter((user,idx) => {
               let userid = user._id;
               return userid.toString() !== res.locals.currUser?._id.toString()
   
         });
      }
      return res.status(200).json({"message":"Welcome to CareerBridge!","data":userData,"success":true})
   }else{
     return res.status(202).json({"message":"No User Found !","data":[],"success":true});
   }
}


// sending a single user detail for their profile...

module.exports.userProfile = async(req,res,next)=>{
      

       const {id} = req.params;
       console.log(id);

       if(!id){
         return res.status(400).json({error:true,message:"user not logged in"})
       }
       const today = new Date();
       today.setUTCHours(0,0,0,0);
       const odlAvailablity = await Available.find({day:{$lt:today}});
    
       const deletedAvailablity = await Available.deleteMany({day:{$lt:today}});
     
       const deleteIds = odlAvailablity.map((doc)=>doc._id);
       const unAvaialblity = await  Available.find({available:false});
       const unAvaialityIds = unAvaialblity.map((doc)=>doc._id);
       if(unAvaialityIds.length > 0){
         await User.updateMany({$pull:{available:{$in:unAvaialityIds}}});
       }
       
       if(deleteIds.length > 0){
         await User.updateMany({$pull:{available:{$in:deleteIds}}});
       }
       const userData = await User.findById(id).populate("available");
      
       res.status(200).json({"message":"Welcome to my profile","data":userData,"success":true});
}

// profile Updation function


module.exports.updateProfile = async(req,res,next)=>{
   
   const {id} = req.params;
   const {username,profilePic,charge,education} = req.body;
 
   const data = await User.findByIdAndUpdate(id,{username,profilePic,charge,education},{new:true,runvalidator:true});
   res.status(200).json({"message":"profile Updation successfully","data":data,"success":true});
}


module.exports.setAvailablity = async(req,res,next)=>{
    const {id} = req.params;
    const {start,end,day} = req.body;
   
   

    const availablityOfUser = await User.findById(id);
    let newavailablity = new Available( {
          day:day,
         start:start,
         end:end
    })

    const saveAvailable = await newavailablity.save();
    await availablityOfUser.available.push(saveAvailable);
    const result = await availablityOfUser.save();
    const response = await User.findById(id).populate("available");
   
   res.status(200).json({"message":"availablity set successgully","data":response,"success":true})
}

module.exports.deleteAvailablity = async(req,res,next)=>{
   const {id,availableId} = req.params;

   
   const deletedAvailablity = await Available.findOneAndDelete({_id:availableId});
 
   if(deletedAvailablity){
    
      const pullFromUser = await User.findByIdAndUpdate(id,{$pull:{available:deletedAvailablity._id}},{new:true});
       const userData = await User.findById(id).populate("available");
      res.status(200).json({"message":"deleted","data":userData,"success":true});
   }else{
      res.status(400).json({"message":"there is something error","error":true});
   }
}

module.exports.searchUser = async(req,res,next)=>{
   const {inpVal} = req.body;
   

   if(inpVal == ""){
    let  userData = await User.find().sort({createdAt:-1});
   
     return res.status(200).json({"success":true,"data":userData});
   }

   const query = new RegExp(inpVal,"i","g");
   const response = await User.find({"$or":[{username:query},{profession:query}]}).sort({createdAt:-1});
 
  
   if(response.length>0){
      res.status(200).json({"success":true,"data":response});
   }else{
      res.status(400).json({"success":false,"data":[]});
   }
}




module.exports.userLogout = async(req,res,next)=>{
   
   req.logOut((err)=>{
      if(err){
         return next(err)
      }

      res.status(200).json({success:true,message:"logout"})
   })

}