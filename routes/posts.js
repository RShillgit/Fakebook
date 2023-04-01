var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Post = require('../models/post');

/* -------------- /posts -------------- */
// GET POSTS
router.get('/', (req, res, next) => {
    res.json('redirect to home')
})
// CREATE POST
router.post('/', passport.authenticate('jwt', {session: false}),

    // Successful Authentication
    (req, res, next) => {

        // Create new post
        const newPost = new Post({
            author: req.user._id,
            text: req.body.text
        })
        newPost.save()
            // Successfully created post
            .then(post => {

                // Update users posts array
                let updatedPostsArray = [...req.user.posts];
                updatedPostsArray.push(post)

                User.findByIdAndUpdate(req.user._id, {
                    'posts': updatedPostsArray
                })
                // Successfully updated user's posts array
                .then(() => {
                    return res.status(200).json({ success: true, msg: 'Post Created Successfully' });
                })
                // Unsuccessfully updated user's posts array
                .catch(err => {
                    return res.status(401).json({success: false, err});
                })  
            })
            // Unsuccessfully created post
            .catch(err => {
                return res.status(401).json({success: false, err});
            })
    },
    // Unsuccessful Authentication
    (err, req, res) => {
      return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

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


const getAuth = [
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
      const token = req.headers.authorization;
      const userToken = jwtUtils.jwtVerify(token);
      res.status(200).json({auth: req.isAuthenticated(), userToken: userToken});
    },
    (err, req, res) => {
      return res.status(401).json({err, auth: req.isAuthenticated()});
    }
]

const postAuth = [
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
      const token = req.headers.authorization;
      const userToken = jwtUtils.jwtVerify(token);
      res.status(200).json({auth: req.isAuthenticated(), userToken: userToken});
    },
    (err, req, res) => {
      return res.status(401).json({err, auth: req.isAuthenticated()});
    }
]

module.exports = router;
