var express = require('express');
var router = express.Router();

/* -------------- /posts -------------- */
// GET POSTS
router.get('/', (req, res, next) => {
    res.send('posts route page that displays users feed')
})
// CREATE POST
router.post('/', (req, res, next) => {
    res.send("Create A Post")
})

/* -------------- /posts/:id -------------- */
// GET INDIVIDUAL POST
router.get('/:id', (req, res, next) => {
    res.send(`Get Post ${req.params.id}`)
})
// TODO POST REQUEST
router.post('/:id', (req, res, next) => {
    res.send(`POST Request On Post ${req.params.id}`)
})
// UPDATE INDIVIDUAL POST
router.put('/:id', (req, res, next) => {
    res.send(`Update Post ${req.params.id}`)
})
// DELETE INDIVIDUAL POST
router.delete('/:id', (req, res, next) => {
    res.send(`Delete Post ${req.params.id}`)
})

/* -------------- /posts/:id/comments -------------- */
// GET COMMENTS ON AN INDIVIDUAL POST
router.get('/:id/comments', (req, res, next) => {
    res.send(`Get Post ${req.params.id}'s Comments`)
})
// COMMENT ON INDIVIDUAL POST
router.post('/:id/comments', (req, res, next) => {
    res.send(`Comment On Post ${req.params.id}`)
})

module.exports = router;
