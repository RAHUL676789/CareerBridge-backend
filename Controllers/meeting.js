

const { model } = require("mongoose");
const AvailabilitySchema = require("../Models/AvailabilitySchema");
const MeetingSchema = require("../Models/meetingSchema");
const User = require("../Models/userSchema");


module.exports.getAllMeetings = async (req, res, next) => {
    const { id } = req.params;


    if (id) {
        const hostUser = await User.findById(id).populate("meetings");


    

        const MeetingArray = hostUser.meetings;
       


        const response = await MeetingSchema.find({ _id: { $in: MeetingArray } }).populate("host").populate("participant");

        res.status(200).json({ "success": true, "data": response });

    } else {
        res.status(404).json({ "error": true, "message": "there is something error" });
    }
}


module.exports.getAllRequestMeeting = async (req, res, next) => {
    const { id } = req.params;


    if (id) {
        const hostUser = await User.findById(id);
        const MeetingArray = hostUser.meetings;
       

        const response = await MeetingSchema.find({ _id: { $in: MeetingArray }, status: "request" }).populate("host").populate("participant");

        res.status(200).json({ "success": true, "data": response });

    } else {
        res.status(404).json({ "error": true, "message": "there is something error" });
    }
}


module.exports.getAllConfirmMeeting = async (req, res, next) => {
    const { id } = req.params;

    if (id) {
        const hostUser = await User.findById(id);
        const MeetingArray = hostUser.meetings;
        const today = new Date(); 
        today.setHours(0, 0, 0, 0); // Ensure to call new Date() correctly

        const response = await MeetingSchema.find({
          _id: { $in: MeetingArray },
          status: "Confirm",
          day: { $gte: today }  // Ensure the "day" is less than today's date
        })
          .populate("host")
          .populate("participant").sort({day:1});
        
        res.status(200).json({ success: true, data: response });
        

    } else {
        res.status(404).json({ "error": true, "message": "there is something error" });
    }
}

module.exports.updateMeetingData = async (req, res, next) => {
    
        const { id } = req.params;

        console.log("this is updating meetingdata",id);
        const meetingRequest = await MeetingSchema.findById(id);
        
        const availableOrNot = await AvailabilitySchema.find({start:meetingRequest.startTime,end:meetingRequest.endingTime,available:true,day:meetingRequest.day});

        if(availableOrNot.length == 0 ){
        
          return  res.status(200).json({success:false,message:"you are not available at that time you cant accept the request"})

        }
        const response = await MeetingSchema.findByIdAndUpdate(id, { status: "Confirm" }, { new: true });
        const availableUpdate = await AvailabilitySchema.updateMany({
            "$and": [{ start: response.startTime }, { end: response.endingTime }, { day: response.day },]
        }, { $set: { available: false } }, { new: true });

        const updatedUserAvailablity = await User.findById(response.host._id);
        if (updatedUserAvailablity) {
            updatedUserAvailablity.available = updatedUserAvailablity.available.filter((avb) => (avb.start == response.startTime && avb.end == response.endingTime) && !(avb.available))
            await updatedUserAvailablity.save();
        }

        if (response) {
            res.status(200).json({ "success": true, "message": "meeting has been confirm", "data": updatedUserAvailablity });
        }
    
}



module.exports.cancelMeeting = async (req, res, next) => {
    const { id } = req.params;
    const response = await MeetingSchema.findByIdAndUpdate(id, { status: "Cancel" }, { new: true });

    res.status(200).json({ "success": true, "message": "Cancelled" })

}


module.exports.getTrackMeetings = async (req, res, next) => {
    const { id } = req.params;

    const response = await MeetingSchema.find({ participant: id }).populate("host").populate("participant").sort({ updatedAt: -1 });
    if (response.length > 0) {
        res.status(200).json({ success: true, data: response, message: "your all requested meetings" });
    } else {
        res.status(200).json({ error: true, data: response, message: "no result found" });
    }


}


module.exports.deletMeeting = async (req, res, next) => {
    
        const { meetingId, host } = req.params;

        const deleteMeeting = await MeetingSchema.findByIdAndDelete(meetingId);
        if (deleteMeeting) {
            const response = await User.findByIdAndUpdate(
                host,
                { $pull: { meetings: meetingId } },
                { new: true }
            )
                .populate({
                    path: 'meetings', // Populate the `meetings` field
                    populate: [
                        { path: 'host', model: "user" },          // Populate the `host` inside `meetings`
                        { path: 'participant', model: "user" }, // Populate the `participants` inside `meetings`
                    ]
                });

            console.log("this is delete Meting", response);
            res.status(200).json({ success: true, data: response, message: "deleted" });
        }



    

}