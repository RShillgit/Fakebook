const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, required: true }
})

// Export model
module.exports = mongoose.model("Comment", CommentSchema);