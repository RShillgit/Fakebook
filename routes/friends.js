var express = require('express');
const User = require('../models/user');
var router = express.Router();

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

        // Update user
        User.findByIdAndUpdate(req.user._id, 
            {
                "friend_requests": req.body.newFriendRequestsArray,
                "friends": req.body.newFriendsArray
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
                        friend_requests: req.body.senderFriendRequestsArray,
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
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
);
// Delte Friend
router.delete('/', (req, res, next) => {
    res.json(`Delete User From Friends List`);
});

module.exports = router;