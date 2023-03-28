const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    likes: [{type: Schema.Types.ObjectId, ref: "User"}],
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
})

// Export model
module.exports = mongoose.model("Post", PostSchema);