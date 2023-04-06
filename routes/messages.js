var express = require('express');
var router = express.Router();
const jwtUtils = require('../utils/jwtUtils');
const User = require('../models/user');
const Chat = require('../models/chat');
const async = require('async');

router.get('/', 
    // Successfull Authentication
    (req, res, next) => {

        const token = req.headers.authorization;
        const userToken = jwtUtils.jwtVerify(token);

        async.parallel(
            {
                // Get current user
                currentUser(callback) {
                    User.findOne({_id: req.user._id})
                    .populate('chats')

                    // Successfully found user
                    .then(currentUser => {
                        callback(null, currentUser);
                    })

                },
                // Get all users
                allUsers(callback) {
                    User.find({})
                    .populate('chats')

                    // Successfully found all users
                    .then(allUsers => {
                        callback(null, allUsers);
                    })

                }
            }, (err, results) => {
                if (err) {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                }
                return res.status(200).json({success: true, auth: req.isAuthenticated(), userToken: userToken, currentUser: results.currentUser, allUsers: results.allUsers})
            }
        )
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

// Creates a chat
router.post('/',
    // Successful Authentication
    (req, res) => {

        // Create new chat
        const newChat = new Chat({
            members: [req.user, req.body.selectedUser]
        })
        newChat.save()
        // Successfully created new chat
        .then(
            async.parallel(
                {
                    // Add Chat to user's chats array
                    updateUser(callback) {

                        let chatsArray = req.user.chats;
                        chatsArray.unshift(newChat);

                        User.findByIdAndUpdate(req.user._id, 
                            {
                                "chats": chatsArray
                            },
                            {new: true}
                        )
                        // Successfully updated user
                        .then(updatedUser => {
                            callback(null, updatedUser)
                        })
                    },
                    // Add chat to recipient's chats array
                    updateRecipient(callback) {

                        let chatsArray = req.body.selectedUser.chats;
                        chatsArray.unshift(newChat);

                        User.findByIdAndUpdate(req.body.selectedUser._id, 
                            {
                                "chats": chatsArray
                            },
                            {new: true}
                        )
                        // Successfully updated recipient
                        .then(updatedRecipient => {
                            callback(null, updatedRecipient);
                        })
                    }

                }, (err, results) => {
                    if(err) {
                        return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                    }
                    return res.status(200).json({success: true, auth: req.isAuthenticated(), updatedUser: results.updateUser, updatedRecipient: results.updateRecipient})
                }
            )
        )
        .catch(err => {
            return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
        })
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

module.exports = router;