const mongoose = require("mongoose")

const chatModel = mongoose.Schema({
    chatName: {type: String,trim: true
    // trim means any extra space while saving the chatName in database will be trimmed or deleted.
    },
    isGroupChat: {type: Boolean, default: false},
    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
        //mongoose.Schema.Types.ObjectId -> this will basically contain the user id and acts like a primary key for USER model.
    }],
    latestMessage:{type: mongoose.Schema.Types.ObjectId,ref: "Message"},
    groupAdmin: {type: mongoose.Schema.Types.ObjectId,ref : "User"},
},
    {timestamps : true}
)

const Chat = mongoose.model("Chat",chatModel);

module.exports = Chat;