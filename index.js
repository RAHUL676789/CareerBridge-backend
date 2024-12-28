// App Setup
require("dotenv").config();
const { app, server } = require("./Socket/index");

const express = require("express");
// const app = express();
const cors = require("cors");
const ExpressError = require("./Util/ExpressError");
const userRouter = require("./Routes/user");
const meetingRouter = require("./Routes/meeting");
const passport = require("passport");
// const session = require("express-session");
const session = require("express-session")
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
// const Use= require("./Models/userSchema");
const User = require("./Models/userSchema");
const LocalStrategy = require("passport-local").Strategy;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const dbUrl = process.env.DBURL;

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTENDURL, // Update with your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

// MongoDB Connection

async function main(){
 
  // mongoose.connect('mongodb://127.0.0.1:27017/test')
  await mongoose.connect(dbUrl);
  
}

main().then((result)=>{
  console.log("connected to dataBase");
}).catch((err)=>{
  console.log(err);
  console.log("some eror in database",err);
});

const cookieParser = require('cookie-parser');
app.use(cookieParser());
// MongoStore Configuration for Sessions
const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto: {
    secret: process.env.SECRET || "defaultsecret",
  },
  touchAfter: 24 * 3600, // Session update only once per 24 hours
});

store.on("error", (err) => {
  console.error("Error in Mongo session store:", err);
});




// Session Middleware
const sessionOptions ={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false,
  cookie:{
      expires:Date.now()+7*24*60*60*1000,
      maxAge:7*24*60*60*1000,
      httpOnly:true,
     
  }
}


// Passport Initialization
app.use(session(sessionOptions));



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






app.use((req,res,next)=>{

  res.locals.currUser = req.user;
  next();
})

app.use("/CareerBridge/user", userRouter);
app.use("/user/meetings", meetingRouter);

// Catch-All Route for 404 Errors
app.use("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.log(err);
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).json({ message, error: true });
});

// Server Listener
server.listen(8080, () => {
  console.log("App is listening on port 8080");
});
