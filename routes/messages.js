var express = require('express');
var router = express.Router();
const jwtUtils = require('../utils/jwtUtils');
const User = require('../models/user');
const Chat = require('../models/chat');
const Message = require('../models/message');
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
                    .populate({
                        path: 'chats', 
                        populate: [{
                            path: 'members',
                            model: 'User',
                        },
                        {
                            path: 'messages',
                            model: 'Message'
                        }]
                    })

                    // Successfully found user
                    .then(currentUser => {
                        callback(null, currentUser);
                    })

                },
                // Get all users
                allUsers(callback) {
                    User.find({})
                    .populate({
                        path: 'chats', 
                        populate: [{
                            path: 'members',
                            model: 'User',
                        },
                        {
                            path: 'messages',
                            model: 'Message'
                        }]
                    })

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
                        .populate({
                            path: 'chats', 
                            populate: [{
                                path: 'members',
                                model: 'User',
                            },
                            {
                                path: 'messages',
                                model: 'Message'
                            }]
                        })
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
                        .populate({
                            path: 'chats', 
                            populate: [{
                                path: 'members',
                                model: 'User',
                            },
                            {
                                path: 'messages',
                                model: 'Message'
                            }]
                        })
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

// Create a message
router.put('/', 
    (req, res) => {

        Chat.findById(req.body.chat._id)
        .populate('members')
        .populate('messages')
        // Successfully found the chat
        .then(chat => {
            // Create a new message
            const newMessage = new Message({
                sender: req.body.sender._id,
                receiver: req.body.receiver._id,
                content: req.body.content,
                timestamp: req.body.timestamp,
                chat_id: req.body.chat._id
            })
            newMessage.save()
            // Successfully saved message
            .then(message => {

                // Add this message to the chats array
                let messagesArray = chat.messages;
                messagesArray.unshift(message);

                // Update chat
                Chat.findByIdAndUpdate(req.body.chat._id, 
                    {"messages": messagesArray}
                )
                // Successfully updated chat
                .then(
                    async.parallel(
                        {
                            // Find and repopulate the message receiver
                            updatedMessageReceiver(callback) {
                                User.findOne({_id: req.body.receiver._id})
                                .populate({
                                    path: 'chats', 
                                    populate: [{
                                        path: 'members',
                                        model: 'User',
                                    },
                                    {
                                        path: 'messages',
                                        model: 'Message'
                                    }]
                                })
                                .then(newMessageReceiver => {
                                    callback(null, newMessageReceiver)
                                })
                            },
                            // Find and repopulate all users
                            updatedAllUsers(callback) {
                                // Get all users 
                                User.find({})
                                .populate({
                                    path: 'chats', 
                                    populate: [{
                                        path: 'members',
                                        model: 'User',
                                    },
                                    {
                                        path: 'messages',
                                        model: 'Message'
                                    }]
                                })
                                .then(newAllUsers => {
                                    callback(null, newAllUsers)
                                })
                            }
                        }, (err, results) => {
                            if (err) {
                                return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                            }
                            return res.status(200).json({success: true, auth: req.isAuthenticated(), newMessageReceiver: results.updatedMessageReceiver, newAllUsers: results.updatedAllUsers})
                        }
                    )
                )
                // Unsuccessfully updated chat
                .catch(err => {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                })
            })
        })
        // Unsuccessfully found the chat
        .catch(err => {
            return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
        })
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

// Delete a specific message
router.delete('/:id',
    // Successful Authentication
    (req, res) => {

        async.parallel(
            {
                // Delete the message
                deleteMessage(callback) {
                    Message.findByIdAndDelete(req.body.deletionMessage._id)
                    .then(deletedMessage => {
                        callback(null, deletedMessage)
                    })
                },
                // Update chat's messages array
                updateChat(callback) {
                    // Find the chat where this message is located
                    Chat.findById(req.body.deletionMessage.chat_id)
                    // Successfully found the chat
                    .then(chat => {

                        // Remove the message from the messages array
                        let messagesArray = chat.messages;
                        messagesArray = messagesArray.filter(message => {
                            return message.toString() !== req.body.deletionMessage._id
                        })

                        // Update the chat
                        Chat.findByIdAndUpdate(req.body.deletionMessage.chat_id,
                            {
                                "messages": messagesArray
                            },
                            {new: true}
                        )
                        // Successfully updated the chat
                        .then(newChat => {
                            callback(null, newChat)
                        })
                    })
                }
            }, (err, results) => {
                if (err) {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                }
                // Find the message receiver to rerender state
                User.findById(req.body.deletionMessage.receiver)
                .populate({
                    path: 'chats', 
                    populate: [{
                        path: 'members',
                        model: 'User',
                    },
                    {
                        path: 'messages',
                        model: 'Message'
                    }]
                })
                // Successfully found message receiver
                .then(messageReceiver => {
                    // Find and repopulate all users
                    User.find({})
                    .populate({
                        path: 'chats', 
                        populate: [{
                            path: 'members',
                            model: 'User',
                        },
                        {
                            path: 'messages',
                            model: 'Message'
                        }]
                    })
                    // Successfully found all users
                    .then(newAllUsers => {
                        return res.status(200).json({success: true, auth: req.isAuthenticated(), newMessageReceiver: messageReceiver, newAllUsers: newAllUsers})
                    })
                    // Unsuccessfully found all users
                    .catch(err => {
                        return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                    })
                })
                // Unsuccessfully found message receiver
                .catch(err => {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                })
            }
        )
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

module.exports = router;