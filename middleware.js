const User = require("./Models/userSchema");
const ExpressError = require("./Util/ExpressError.js")
const {userSchema, availableValidatonSchema ,meetingSchema}= require("./schema.js")

module.exports.isLoggedIn = (req, res, next) => {
    // Debugging: Print the req.user to check if the user is properly set
    try{
        console.log("this is req.user:", req.user);

    // Check if the user is authenticated
    console.log("this is req.session",req.session);
    console.log("this is req.cookie,",req.cookies);
    console.log("this is req.user",req.user);
    if (!req.isAuthenticated()) {
        return res.status(403).json({
            "error": true,
            "message": "You're not logged in. Please log in!"
        });
    }
    
    // If the user is authenticated, move to the next middleware
    next();
    }catch(e){
        throw new ExpressError(403,e)
    }
};




module.exports.isOwner = async (req, res, next) => {
    try {
        console.log("isOwner middleware called");

        const { id } = req.params;
       if(!id){
        return res.status(404).json({ error: true, message: "Owner not found!" });
       }

        const owner = await User.findById(id);
        if (!owner) {
            return res.status(404).json({ error: true, message: "Owner not found!" });
        }

        if (!res.locals.currUser) {
            return res.status(403).json({ error: true, message: "Unauthorized access!" });
        }

        if (!owner._id.equals(res.locals.currUser._id)) {
            return res.status(403).json({ error: true, message: "You're not the owner; you can't make changes!" });
        }

        next();
    } catch (e) {
        console.error("Error in isOwner middleware:", e);
        next(new ExpressError(422, "An error occurred while checking ownership."));
    }
};


module.exports.userValidation = (req,res,next)=>{

    const result = userSchema.validate(req.body);

    if(result.error){
        throw new ExpressError(422,result.error.details[0].message);
    }else{
        next();
    }
}


module.exports.availableValidaton = (req,res,next)=>{
    const result = availableValidatonSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(422,result.error.details[0].message);
    }else{
        next()
    }
}


module.exports.meetingSchemaValidation = (req,res,next)=>{
    const result = meetingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(422,result.error.details[0].message);
    }else{
        next()
    }
}