const joi = require("joi");

module.exports.userSchema = joi.object({
    username:joi.string().required(),
    email:joi.string().email({tlds:{allow:true}}).required(),
    password:joi.string().required(),
    profilePic:joi.string(),
    profession:joi.string().required(),
    charge:joi.number().required(),
    education:joi.string().required()
});

module.exports.availableValidatonSchema = joi.object({
    start:joi.string().required(),
    end:joi.string().required(),
    day:joi.date(),

})

module.exports.meetingSchema = joi.object({
    meetingURL:joi.string(),
    startTime:joi.string().required(),
    endingTime:joi.string().required(),
    status:joi.string(),
    day:joi.date().required()
})