
const express = require("express");
const Router = express.Router({margeParams:true});
const { asynchWrap }= require("../Util/asynchWrap");
const {signUpPost, login,allUser,userProfile,updateProfile,setAvailablity,deleteAvailablity,searchUser,userLogout} = require("../Controllers/user");
const {isLoggedIn,isOwner,userValidation,availableValidaton} = require("../middleware")
const passport = require("passport")

Router.route("/")
.get(asynchWrap(allUser));
Router.route("/logout")
.get(asynchWrap(userLogout))

Router.route("/:id")
.get(asynchWrap(userProfile))
.patch(isLoggedIn,isOwner,asynchWrap(updateProfile))

Router.route("/signup")
.post(userValidation,asynchWrap(signUpPost));

Router.route("/login")
  .post((req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err); // Handle unexpected errors
      }
      if (!user) {
        // Authentication failed
        return res.status(401).json({
          message: 'Authentication failed',  // Custom message
          error: info || 'Invalid credentials'  // Optional additional info
        });
      }
      // Success, login the user
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        

        return res.status(200).json({
          message: 'Login successful',
          data: user.toObject(),
          success:true // Send user details if required
        });
      });
    })(req, res, next);
  });






Router.route("/available/:id")
.post(isLoggedIn,isOwner,availableValidaton,asynchWrap(setAvailablity));
Router.route("/:id/:availableId")
.delete(isLoggedIn,isOwner,asynchWrap(deleteAvailablity));

Router.route("/searchUser")
.post(isLoggedIn,asynchWrap(searchUser));




module.exports = Router;