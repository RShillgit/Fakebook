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
// Accept Friend Request
router.put('/', (req, res, next) => {
    res.json(`Accepted Friend Request`);
});
// Delte Friend
router.delete('/', (req, res, next) => {
    res.json(`Delete User From Friends List`);
});

module.exports = router;