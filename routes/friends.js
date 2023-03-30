var express = require('express');
var router = express.Router();

/*
* ------------------ /friends ------------------ 
*/
// Get Friends List
router.get('/', (req, res, next) => {
    res.json(`User ${req.params.id}'s Friends List`);
});
// Friend Request
router.post('/', (req, res, next) => {
    res.json(`Friend Request Sent`);
});
// Accept Friend Request
router.put('/', (req, res, next) => {
    res.json(`Accepted Friend Request`);
});
// Delte Friend
router.delete('/', (req, res, next) => {
    res.json(`Delete User From Friends List`);
});

module.exports = router;