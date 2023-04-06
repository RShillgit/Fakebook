const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    members: [{type: Schema.Types.ObjectId, ref: "User", required: true}],
    messages: [{type: Schema.Types.ObjectId, ref: "Message"}]
})

// Export model
module.exports = mongoose.model("Chat", ChatSchema);