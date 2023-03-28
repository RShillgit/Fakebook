var express = require('express');
var router = express.Router();

/*
* ------------------ PROFILE HOME ------------------ 
*/
router.get('/', (req,res) => {
    res.json(req.user);
});
router.post('/', (req,res) => {
    res.send('Post Request on Profile');
});
router.put('/', (req,res) => {
    res.send('Update Profile Info');
});
router.delete('/', (req,res) => {
    res.send('Delete Profile');
});

/*
* ------------------ /profile/:id ------------------ 
*/
router.get('/:id', (req,res) => {
    res.send(`User ${req.params.id}'s Profile`);
});
// Friend Request
router.post('/:id', (req,res) => {
    res.send(`Friend Request Sent To ${req.params.id}`);
});
// Delte Friend
router.delete('/:id', (req,res) => {
    res.send(`Delete User ${req.params.id} From Friends List`);
});

module.exports = router;