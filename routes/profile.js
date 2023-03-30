var express = require('express');
var router = express.Router();

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
router.get('/:id', (req, res, next) => {
    res.json(`User ${req.params.id}'s Profile`);
});
// TODO POST
router.post('/:id', (req, res, next) => {
    res.send(`POST request on User ${req.params.id}`);
});
// Update Profile Info
router.put('/:id', (req, res, next) => {
    res.send(`Update Profile Info`);
});
// Delte Profile
router.delete('/:id', (req, res, next) => {
    res.send(`Delete User ${req.params.id}`);
});

module.exports = router;