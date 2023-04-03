const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    parentPost: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    likes: [{type: Schema.Types.ObjectId, ref: "User"}],
    timestamp: { type: Date, required: true }
})

// Export model
module.exports = mongoose.model("Comment", CommentSchema);