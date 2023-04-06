const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sender: {type: Schema.Types.ObjectId, ref: "User", required: true},
    content: {type: String, required: true},
    timestamp: {type: Date, required: true},
    chat_id: {type: Schema.Types.ObjectId, ref: "Chat", required: true}
})

// Export model
module.exports = mongoose.model("Message", MessageSchema);