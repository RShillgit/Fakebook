var express = require('express');
var router = express.Router();

/* -------------- /posts -------------- */
// GET POSTS
router.get('/', (req, res, next) => {
    res.json('redirect to home')
})
// CREATE POST
router.post('/', (req, res, next) => {
    res.json("Create A Post")
})

/* -------------- /posts/:id -------------- */
// GET INDIVIDUAL POST
router.get('/:id', (req, res, next) => {
    res.json(`Get Post ${req.params.id}`)
})
// COMMENT ON POST
router.post('/:id', (req, res, next) => {
    res.json(`Comment on post ${req.params.id}`)
})
// UPDATE INDIVIDUAL POST
router.put('/:id', (req, res, next) => {
    res.json(`Update Post ${req.params.id}`)
})
// DELETE INDIVIDUAL POST
router.delete('/:id', (req, res, next) => {
    res.json(`Delete Post ${req.params.id}`)
})

module.exports = router;
