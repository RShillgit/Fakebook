const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, maxLength: 50},
    hash: {type: String},
    salt: {type: String},
    name: {type: String},
    fbID: {type: String},
    email: {type: String},
    jwtoken: {type: String},
    friends : [{type: Schema.Types.ObjectId, ref: "User"}],
    friend_requests : [{type: Schema.Types.ObjectId, ref: "User"}],
    posts: [{type: Schema.Types.ObjectId, ref: "Post"}],
})

// Export model
module.exports = mongoose.model("User", UserSchema);