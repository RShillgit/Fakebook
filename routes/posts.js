var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const jwtutils = require('../utils/jwtUtils');
const async = require('async');

/* -------------- /posts -------------- */
// GET POSTS
router.get('/', (req, res, next) => {
    res.json('redirect to home');
})
// CREATE POST
router.post('/', 
    // Successful Authentication
    (req, res, next) => {

        // Create new post
        const newPost = new Post({
            author: req.user._id,
            text: req.body.text,
            timestamp: req.body.timestamp
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

                    // Get and repopulate all posts
                    Post.find({})
                    .sort({ timestamp: -1 })
                    .populate('author')
                    // Successfully got all posts
                    .then(updatedAllPosts => {
                        return res.status(200).json({ success: true, newPost: post, updatedAllPosts: updatedAllPosts });
                    })
                    // Unsuccessfully got all posts
                    .catch(err => {
                        return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                    })
                })
                // Unsuccessfully updated user's posts array
                .catch(err => {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
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
router.get('/:id', 
    // Successful Authentication
    (req, res, next) => {

        async.parallel(
            {
                currentUser(callback) {
                    User.findById(req.user._id)
                    .then(currentUser => {
                        callback(null, currentUser);
                    })
                },
                selectedPost(callback) {
                    Post.findOne({ _id: req.params.id })
                    .populate('author')
                    .populate({
                        path: 'comments', 
                        populate: {
                            path: 'author',
                            model: 'User'
                        }
                    })
                    // Successfully found post
                    .then(selectedPost => {

                        // Get and verify token
                        const token = req.headers.authorization;
                        const userToken = jwtutils.jwtVerify(token);

                        const results = {
                            selectedPost: selectedPost,
                            userToken: userToken
                        }
                        callback(null, results);
                    })
                }
            }, (err, results) => {
                if (err) {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                }
                return res.status(200).json({success: true, auth: req.isAuthenticated(), userToken: results.selectedPost.userToken, selectedPost: results.selectedPost.selectedPost, currentUser: results.currentUser});
            }
        )
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)
// TODO: Individual post POST request
router.post('/:id', 
    (req, res, next) => {

    }
)
// LIKE/UNLIKE/UPDATE INDIVIDUAL POST
router.put('/:id', 
    // Successful Authentication
    (req, res, next) => {

        // If it is a like request
        if (req.body.requestType === 'like') {

            let likesArray = req.body.selectedPost.likes

            // If the user is already in the array, remomve them
            if (likesArray.includes(req.user._id.toString())) {
                
                likesArray = likesArray.filter(like => {
                    return like !== req.user._id.toString();
                })
            }
            // If the user is not in the array, add them
            else {
                likesArray.push(req.user._id)
            }

            // Update the posts likes array
            Post.findOneAndUpdate ({_id: req.body.selectedPost._id}, {
                likes: likesArray
            })
            // Successfully added the user to the likes array
            .then(() => {
                return res.status(200).json({success: true, newLikesArray: likesArray });
            })
            // Unsuccessfully added the user to the likes array
            .catch(err => {
                return res.status(401).json({success: false, err: err});
            })
        }
        // Else If it is an update request
        else if (req.body.requestType === 'update') {

            // Update the post
            Post.findByIdAndUpdate(req.params.id,
                {
                    "text": req.body.editedText
                },
                {new: true}
            )
            .populate('author')
            .populate({
                path: 'comments', 
                populate: {
                    path: 'author',
                    model: 'User'
                }
            })
            // Successfully updated post
            .then(updatedPost => {
                return res.status(200).json({success: true, auth: req.isAuthenticated(), updatedPost: updatedPost})
            })
            // Unsuccessfully updated post
            .catch(err => {
                return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
            })
        }
        // Else send error
        else {
            return res.status(401).json({success: false, err: 'No requestType specified'});
        }
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)
// DELETE INDIVIDUAL POST
router.delete('/:id', 
    // Successful Authentication
    (req, res) => {

        async.parallel(
            {
                // Delete the post
                deletePost(callback) {
                    Post.findByIdAndDelete(req.params.id)
                    .then(deletedPost => {
                        callback(null, deletedPost);
                    })
                },
                // Remove the post from the user's posts array
                removePostFromArray(callback) {

                    let postsArray = req.user.posts;
                    postsArray = postsArray.filter(post => {
                        return post.toString() !== req.params.id;
                    })
                    
                    // Update User
                    User.findByIdAndUpdate(req.user._id,
                        {
                            "posts": postsArray
                        },
                        {new: true}    
                    )
                    .populate('friends')
                    .populate('posts')
                    .populate('friend_requests')

                    // Successfully updated user
                    .then(updatedUser => {
                        callback(null, updatedUser);
                    })
                }
            }, (err, results) => {
                if (err) {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                }
                // Get all posts
                Post.find({})
                .sort({ timestamp: -1 })
                .populate('author')
                // Successfully got all users
                .then(allPosts => {
                    return res.status(200).json({success: true, allPosts: allPosts, auth: req.isAuthenticated(), updatedUser: results.removePostFromArray})
                })
                // Unsuccessfully got all users
                .catch(err => {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                }) 
            }
        )
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

/* -------------- /posts/:id/comments -------------- */
// COMMENT ON POST
router.post('/:id/comments', 

    // Successful Authentication
    (req, res, next) => {

        // Create new comment with the request info
        const newComment = new Comment({
            parentPost: req.body.parentPost._id,
            author: req.user._id,
            text: req.body.commentText,
            timestamp: req.body.commentTime
        })
        newComment.save()

        // Successfully Saved Comment
        .then((comment) => {

            // Update post's comments array
            let updatedCommentsArray = [...req.body.parentPost.comments];
            updatedCommentsArray.push(comment)

            Post.findByIdAndUpdate(req.body.parentPost._id, 
                {'comments': updatedCommentsArray},
                {new: true}
            )
            .populate({
                path: 'comments',
                    populate: {
                        path: 'author',
                        model: 'User'
                    }
            })
            // Successfully updated post's comments array
            .then((updatedPost) => {
                return res.status(200).json({ success: true, msg: 'Comment Created Successfully', updatedPost: updatedPost});
            })
            // Unsuccessfully updated post's comments array
            .catch(err => {
                return res.status(401).json({success: false, err});
            }) 
        })

        // Unsuccessfully Saved Comment
        .catch(err => {
            return res.status(401).json({success: false, err: err});
        })
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

/* -------------- /posts/:id/comments/:commentId -------------- */
// LIKE/UNLIKE COMMENT
router.put('/:id/comments/:commentId', 

    // Successful Authentication
    (req, res, next) => {

        // Get the comment
        Comment.findById(req.params.commentId)
            // Successfully found comment
            .then(selectedComment => {
                
                let likesArray = selectedComment.likes;
        
                // If the user is already in the array, remomve them
                if (likesArray.includes(req.user._id.toString())) {
                    
                    likesArray = likesArray.filter(like => {
                        return like.toString() !== req.user._id.toString();
                    })
                }
                // If the user is not in the array, add them
                else {
                    likesArray.push(req.user._id)
                }

                // Update comment
                Comment.findByIdAndUpdate(req.params.commentId, 
                    {'likes': likesArray},
                    {new: true}
                )
                .populate('author')
                // Successfully updated comment
                .then((newComment) => {
                    return res.status(200).json({ success: true, newComment: newComment });
                })
                // Unsuccessfully updated comment
                .catch(err => {
                    return res.status(401).json({err, auth: req.isAuthenticated()});
                })
        
            })
            // Unsuccessfully found comment
            .catch(err => {
                return res.status(401).json({err, auth: req.isAuthenticated()});
            })
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

router.delete('/:id/comments/:commentId',

    // Successful Authenticated
    (req, res) => {

        async.parallel(
            {   
                // Delete the comment
                deleteComment(callback){
                    Comment.findByIdAndDelete(req.body.comment._id)
                    .then(deletedComment => {
                        callback(null, deletedComment);
                    })
                },
                // Remove the comment from the post's comments array
                updateComments(callback) {

                    // Get the parent post
                    Post.findById(req.body.comment.parentPost)
                    .then(parentPost => {

                        // Remove the comment
                        let commentsArray = parentPost.comments;
                        commentsArray = commentsArray.filter(comment => {
                            return comment._id.toString() !== req.body.comment._id
                        })
                        // Update the parent Post
                        Post.findByIdAndUpdate(req.body.comment.parentPost,
                            {
                                "comments": commentsArray
                            },
                            {new: true}    
                        )
                        .populate('comments')
                        .populate({
                            path: 'comments', 
                            populate: {
                                path: 'author',
                                model: 'User',
                            }
                        })
                        // Successfully updated parent post
                        .then(updatedParentPost => {
                            callback(null, updatedParentPost);
                        })
                    })
                }
            }, (err, results) => {
                if (err) {
                    return res.status(500).json({success: false, err, auth: req.isAuthenticated()});
                }
                return res.status(200).json({success: true, auth: req.isAuthenticated(), updatedParentPost: results.updateComments})
            }
        )
    },
    // Unsuccessful Authentication
    (err, req, res) => {
        return res.status(401).json({err, auth: req.isAuthenticated()});
    }
)

module.exports = router;
