var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const jwtutils = require('../utils/jwtUtils');

/*
* ------------------ /profile redirects to user's profile page ------------------ 
*/
router.get('/', (req, res, next) => {
    res.redirect(`/profile/${req.user._id}`)
});
router.post('/', (req, res, next) => {
    res.redirect(`/profile/${req.user._id}`)
});
router.put('/', (req, res, next) => {
    res.redirect(`/profile/${req.user._id}`)
});
router.delete('/', (req, res, next) => {
    res.redirect(`/profile/${req.user._id}`)
});

/*
* ------------------ /profile/:id ------------------ 
*/
// Get Profile Page
router.get('/:id', 
    // Successful Authentication
    (req, res, next) => {

        const token = req.headers.authorization;
        const userToken = jwtutils.jwtVerify(token);

        // Get user information
        User.findOne({ _id: req.params.id })
        .populate('friends')
        .populate('posts')
        .populate('friend_requests')

        // Successfully found user information
        .then(userProfile => {
            res.status(200).json({success: true, auth: req.isAuthenticated(), userToken: userToken, userProfile, authedUser: req.user})
        })

        // Unsuccessfully found user information
        .catch(err => {
            return res.status(500).json({err, auth: req.isAuthenticated(), msg: 'User not found'});
        })
        
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
);
// POST
router.post('/:id', (req, res, next) => {
    res.send(`POST request on User ${req.params.id}`);
});
// Update Profile Info
router.put('/:id', 
    // Successful Authentication
    (req, res, next) => {

        // Find and update user data
        User.findByIdAndUpdate(req.user._id, 
            {
                'name': req.body.name,
                'bio': req.body.bio,
                'email': req.body.email,
                'phone': req.body.phone
            },
            {new: true}
        )
        .populate('friends')
        .populate('posts')
        .populate('friend_requests')
        // Successfully updated user
        .then((newUser) => {
            return res.status(200).json({success: true, auth: req.isAuthenticated(), newUser: newUser});
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
// Delte Profile
router.delete('/:id', (req, res, next) => {
    res.send(`Delete User ${req.params.id}`);
});

module.exports = router;