var express = require('express');
const User = require('../models/user');
var router = express.Router();
const async = require('async');

/*
* ------------------ /friends ------------------ 
*/
// Get Friends List
router.get('/', (req, res, next) => {
    res.json(`User ${req.params.id}'s Friends List`);
});
// Friend Request
router.post('/', 
    // Successful Authentication
    (req, res, next) => {
    
        // Get and update the user the request was sent to
        User.findByIdAndUpdate(req.body.profileId, 
            {
                "friend_requests": req.body.friendRequestsArray
            },
            {new: true}
        )
        .populate('friends')
        .populate('posts')
        .populate('friend_requests')
        // Successfully updated user
        .then(updatedUser => {
            res.status(200).json({success: true, auth: req.isAuthenticated(), updatedUser: updatedUser})

        })
        // Unsuccessfully updated the user
        .catch(err => {
            res.status(500).json({success: false, auth: req.isAuthenticated(), err});
        })
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
);
// Accept/Decline Friend Request
router.put('/', 

    // Successful Authentication
    (req, res, next) => {

        // Accpeting friend request
        if (req.body.currentUserFriendRequestsArray && req.body.currentUserFriendsArray 
                && req.body.senderFriendsArray && req.body.senderId) {

            // Update user
            User.findByIdAndUpdate(req.user._id, 
                {
                    "friend_requests": req.body.currentUserFriendRequestsArray,
                    "friends": req.body.currentUserFriendsArray
                },
                {new: true}
            )
            .populate('friends')
            .populate('posts')
            .populate('friend_requests')

            // Successfully updated user
            .then(updatedUser => {
    
                // Update the sender's information
                User.updateOne(
                    {_id: req.body.senderId},
                    { $set: 
                        {
                            friends: req.body.senderFriendsArray
                        }
                    }
                )
                // Successfully updated sender's information
                .then(() => {
                    return res.status(200).json({success: true, auth: req.isAuthenticated(), updatedUser: updatedUser});
                })
                // Unsuccessfully updated sender's information
                .catch(err => {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                })
            })
            // Unsuccessfully updated user
            .catch(err => {
                return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
            })
        }
        // Declining Friend Request
        else {
            // Update user
            User.findByIdAndUpdate(req.user._id, 
                {
                    "friend_requests": req.body.currentUserFriendRequestsArray,
                },
                {new: true}
            )
            .populate('friends')
            .populate('posts')
            .populate('friend_requests')
            // Successfully updated user
            .then(updatedUser => {
                return res.status(200).json({success: true, auth: req.isAuthenticated(), updatedUser: updatedUser});
            })
            // Unsuccessfully updated user
            .catch(err => {
                return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
            })
        }
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
);
// Delte Friend
router.delete('/', 

    // Successful Authentication
    (req, res, next) => {
        
        async.parallel(
            {
                updateUser(callback) {
                    User.findById(req.user._id)
                    .then(currentUser => {

                        let friendsArray = currentUser.friends;

                        // Remove friend from array
                        friendsArray = friendsArray.filter(friend => friend.toString() !== req.body.friendId);

                        User.findByIdAndUpdate(req.user._id, 
                            {
                                "friends": friendsArray
                            },
                            {new: true}
                        )
                        .populate('friends')
                        .populate('posts')
                        .populate('friend_requests')
                        .then(updatedUser => {
                            callback(null, updatedUser);
                        }) 
                    })
                },
                updateFriend(callback) {
                    User.findById(req.body.friendId)
                    .then(otherUser => {

                        let friendsArray = otherUser.friends;

                        // Remove friend from array
                        friendsArray = friendsArray.filter(friend => friend.toString() !== req.user._id.toString());

                        // Update this user
                        User.findByIdAndUpdate(req.body.friendId, 
                            {
                                "friends": friendsArray
                            },
                            {new: true}
                        )
                        .populate('friends')
                        .populate('posts')
                        .populate('friend_requests')
                        .then(updatedFriend => {
                            callback(null, updatedFriend);
                        }) 
                    })
                }
            },(err, results) => {
                // Unsuccessful
                if(err) {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                }
                // Successful
                return res.status(200).json({success: true, auth: req.isAuthenticated(), currentUserUpdated: results.updateUser, friendUpdated: results.updateFriend});
            }
        )

    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
);

module.exports = router;