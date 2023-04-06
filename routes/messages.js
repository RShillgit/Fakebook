var express = require('express');
var router = express.Router();
const jwtUtils = require('../utils/jwtUtils');
const User = require('../models/user');

router.get('/', 
    // Successfull Authentication
    (req, res, next) => {

        const token = req.headers.authorization;
        const userToken = jwtUtils.jwtVerify(token);

        // Get all users
        User.find({})
        // Successfully found all users
        .then((allUsers) => {
            return res.status(200).json({success: true, auth: req.isAuthenticated(), userToken: userToken, currentUser: req.user, allUsers: allUsers})
        })
        // Unsuccessfully found all users
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