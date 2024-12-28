const express = require("express");
const Router = express.Router({margeParams:true});
const {asynchWrap} = require("../Util/asynchWrap");
const { getAllMeetings,getAllRequestMeeting,getAllConfirmMeeting,updateMeetingData,cancelMeeting,getTrackMeetings,deletMeeting } = require("../Controllers/meeting");
const {isLoggedIn,isOwner} = require("../middleware")


Router.route('/:id')
.get(isLoggedIn,isOwner,asynchWrap(getAllMeetings))
.post(isLoggedIn,asynchWrap(updateMeetingData));

Router.route("/request/:id")
.get(isLoggedIn,asynchWrap(getAllRequestMeeting));

Router.route("/confirm/:id")
.get(isLoggedIn,isOwner,asynchWrap(getAllConfirmMeeting));

Router.route("/track-Meetings/:id")
.get(isLoggedIn,isOwner,asynchWrap(getTrackMeetings));

Router.route("/cancel/:id")
.post(isLoggedIn,asynchWrap(cancelMeeting))



Router.route("/:meetingId/:host")
.delete(isLoggedIn,asynchWrap(deletMeeting))





module.exports = Router;