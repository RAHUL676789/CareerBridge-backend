const express = require("express");
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const User = require("../Models/userSchema");
const Conversation = require("../Models/ConversationSchema");
const MessageSchema = require("../Models/MessageSchema");
const {getconverSation, getConversationById} = require("../Util/getconverSation");
const AvailabilitySchema = require("../Models/AvailabilitySchema");
const MeetingSchema = require("../Models/meetingSchema");
// const {isLoggedIn,isOwner} = require("../middleware")


const io = new Server(server, {
  cors: {
    origin:process.env.FRONTENDURL,
    credentials: true,
  },
});

let onlineUser = new Set();
io.on("connection", async (socket) => {
  let user;
  try {
   
    const id = socket.handshake.auth.id;
    user = await User.findById(id);

    if (!user) {
    
      return;
    }
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());

    // Emit a success event back to the client
    socket.emit("connection-success", { message: "Connection established!", socketId: socket.id });


  } catch (e) {
    
    socket.emit("Error",{
      message:e.message || "somethign error in socket-connection"
    })
  }
  
  socket.on("message-page",async(id)=>{
   try{
    const targetUser = await User.findById(id);

    if(!targetUser){
      return;

    }

    const payload = {
      id: targetUser._id,
      username: targetUser.username,
      email: targetUser.email,
      profile_pic: targetUser.profile_pic,
      online: onlineUser.has(id),
    };

    socket.emit("messageUser-data",payload);

    const getConversationMsgPage = await Conversation.findOne({
      "$or":[  {sender:targetUser._id,    receiver:user._id},
        {sender:user._id,  receiver:targetUser._id}]
    }).populate("message").sort({updatedAt:-1});

    socket.emit("all-message",getConversationMsgPage?.message || []);


   }catch(e){
   
    socket.emit("Error",{
      message:e.message || "somethign error in socket-connection"
    })
   }
  })

  socket.on("getConversationUser", async (data) => {
    try {
    
      const availableConverSation  = await getConversationById(data);
      socket.emit("allConveSationUsers",availableConverSation);
    } catch (e) {
      
      socket.emit("Error",{
        message:e.message || "somethign error in socket-connection"
      })
    }
  })

  socket.on("new-message",async(data)=>{
    try{
     
    let newMessageConverSation = await Conversation.findOne({
      '$or': [{ sender:data.sender, receiver:data.receiver },
      { receiver: data.sender, sender: data.receiver }
      ]
    }).populate("message");

    if(newMessageConverSation){

    

    let newMesage = new MessageSchema( {
      sender:data.sender,
      receiver:data.receiver,
      text:data.text,
      imageUrl:data.imageUrl,
      videoUrl:data.videoUrl,

    })
     let saveMessage  =await newMesage.save();
    
     newMessageConverSation.message.push(saveMessage);
     await newMessageConverSation.save();

    
    io.to(data.sender).emit("all-message", newMessageConverSation?.message)
    io.to(data.receiver).emit("all-message", newMessageConverSation?.message);
    const availableConverSation  = await getConversationById(data.sender);
    const availableConverSation1  = await getConversationById(data.receiver);
    io.to(data.sender).emit("allConveSationUsers",availableConverSation)
    io.to(data.receiver).emit("allConveSationUsers",availableConverSation1);

    }else{
     
      let newMessageWithoutConversation = new MessageSchema({
        sender:data.sender,
        receiver:data.receiver,
        text:data.text,
        imageUrl:data.imageUrl,
        videoUrl:data.videoUrl
      });

      let savedNewMesaage = await newMessageWithoutConversation.save();
      let newCoversation = await Conversation({
        sender:data.sender,
        receiver:data.receiver,
        message:savedNewMesaage
        
      })

      let savedConversation = await newCoversation.save();
      
      let findConverSation = await Conversation.findOne({
        '$or': [{ sender:data.sender, receiver:data.receiver },
        { receiver: data.sender, sender: data.receiver }
        ]
      }).populate("message");

      io.to(data.sender).emit("all-message", findConverSation?.message)
      io.to(data.receiver).emit("all-message", findConverSation?.message);
      const availableConverSation2  = await getConversationById(data.receiver);
      const availableConverSation3  = await getConversationById(data.sender);
      console.log("availableConverSation2",availableConverSation2);
      io.to(data.sender).emit("allConveSationUsers",availableConverSation3)
      io.to(data.receiver).emit("allConveSationUsers",availableConverSation2);

    }


    }catch(e){
     
      socket.emit("Error",{
        message:e.message || "somethign error in socket-connection"
      })
    }
    
  })

  socket.on("schedule-meeting",async(data)=>{
   try{
   
    const availablity = await AvailabilitySchema.findById(data.availableId);
  
    let newMeetings = new MeetingSchema({
      host:data.host,
      participant:data.participant,
      startTime: availablity.start,
      endingTime:availablity.end,
      status:"request",
      day:availablity.day

    });
    const savedMeeting = await newMeetings.save();
    const hostUser = await User.findById(data.host);
    const participantUser = await User.findById(data.participant);
    hostUser.meetings.push(savedMeeting);
    await hostUser.save();
    participantUser.meetings.push(savedMeeting);
    await participantUser.save();
    const meetingData = await MeetingSchema.find({
      '$or':[{host:data.host,participant:data.participant},
        {participant:data.host,host:data.participant}]}).populate("host").populate("participant");

        console.log(meetingData,"this is meeting return data");

        io.to(data.host).emit("meeting-request-receiving",{
          success:true,
          message:"you have new meeting reqest",
          data:meetingData
        });
        io.to(data.participant).emit("meeting-request-sending",{
          success:true,
          message:"meeting request has been sent"
        });
   }catch(e){
   
    socket.emit("Error",{
      message:e.message || "somethign error in socket-connection"
    })
   }
  });

  socket.on("accepted-meeting-request",async(data)=>{
  
           try{
            const hostUser = await User.findById(data.host);
            if(hostUser){
              io.to(data.participant).emit("accept-alert",{
                message:`meeting request accepted by ${hostUser.username}`
              })
            }
           }catch(e){
            
            socket.emit("Error",{
              message:e.message || "somethign error in socket-connection"
            })
          }
  }
);

  socket.on("start-meeting-alert",async(data)=>{
 
   console.log("this is meeting alert data",data);
    try{
      const startMeeting = await MeetingSchema.findById(data).populate("host").populate("participant");
   
    if(startMeeting){
      const participantId = startMeeting.participant._id.toString(); 
      io.to(participantId).emit("meeting-alert",{
        message:`${startMeeting.host.username} start meeting you have to join now`

      })
    }
    }catch(e){
      
      socket.emit("Error",{
        message:e.message || "somethign error in socket-connection"
      })
    }

  });
  
});

// Start the server


module.exports = {
  app,
  server,
};