var express = require('express');
var router = express.Router();
const jwtUtils = require('../utils/jwtUtils');

router.get('/', 
    // Successfull Authentication
    (req, res, next) => {

        const token = req.headers.authorization;
        const userToken = jwtUtils.jwtVerify(token);

        return res.status(200).json({success: true, auth: req.isAuthenticated(), userToken: userToken, currentUser: req.user})

    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

module.exports = router;