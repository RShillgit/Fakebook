import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";
import '../styles/individualPost.css';

const IndividualPost = (props) => {
    
    const [cookie, setCookie] = useCookies(['token']);
    const [auth, setAuth] = useState(null);
    const [selectedPost, setSelectedPost] = useState();
    const [display, setDisplay] = useState();
    const [commentsDisplay, setCommentsDisplay] = useState();
    const [editingDisplay, setEditingDisplay] = useState();
    const [editPostText, setEditPostText] = useState("");
    const commentText = useRef();
    const [errorMessage, setErrorMessage] = useState();
    const [editingStatus, setEditingStatus] = useState(false);

    const [editingComment, setEditingComment] = useState();
    const [editCommentText, setEditCommentText] = useState("");

    const {postId} = useParams();
    const userId = useRef();
    const currentUser = useRef();
    const location = useLocation();
    const navigate = useNavigate();

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/posts/${postId}`, cookie.token);

                // Successful response
                if(checkTokenResponse.success === true) {
                    userId.current = checkTokenResponse.userToken.sub;
                    currentUser.current = checkTokenResponse.currentUser;

                    // Editing Related States
                    if (location.state && location.state.editing) {
                        setEditPostText(checkTokenResponse.selectedPost.text);
                        setEditingStatus(true);
                    }

                    setAuth(checkTokenResponse.auth);
                    setSelectedPost(checkTokenResponse.selectedPost);
                }
                // Unsuccessful response
                else {
                    // Set error message or render error page
                    setErrorMessage(
                        <div className="error-message">
                            <p>An Error Occurred</p>
                        </div>
                    )
                }
            }
            else setAuth(false);
        })()

    }, [cookie])

    // Anytime auth changes, set display
    useEffect(() => {
        // Loading
        if (auth === null) {
            setDisplay(<Loading />)
        }
        // Not Logged In redirect to login
        else if (auth === false) {
            navigate('/login')
        }
    }, [auth])

    // Anytime the selectedPost or its Comments change, set the display
    useEffect(() => {
        if (selectedPost) {
            setDisplay(
                <div>
                    <Navbar currentUser={currentUser.current} serverURL={props.serverURL}/>
                    {errorMessage}
                    <div className="individualPost">
                        {(selectedPost.author._id.toString() === currentUser.current._id)
                            ?
                            <div>
                                <button onClick={() => renderEditPost()}>Edit Post</button>
                                <button onClick={() => deletePost()}>Delete Post</button>
                            </div>
                            :<></>
                        }
                        <p>{selectedPost.author.name}</p>
                        <p>{selectedPost.text}</p>
                        <p>{selectedPost.timestamp}</p>

                        <div className='individualPost-stats'>
                            {selectedPost.likes.includes(userId.current) 
                                ? <p className='liked' id={`likes-${selectedPost._id}`}>{selectedPost.likes.length}</p> 
                                : <p id={`likes-${selectedPost._id}`}>{selectedPost.likes.length}</p>
                            }
                            <p>{selectedPost.comments.length} comments</p>
                        </div>
            
                        <div className='individualPost-buttons'>
                            <button onClick={likePost}>Like</button>
                            <button>Comment</button>
                        </div>
                    </div>
                </div>
            )
            setCommentsDisplay(commentsSection);
        }
    }, [selectedPost])

    // Used to see if editing status is true which will change display
    useEffect(() => {
        if(editingStatus && selectedPost.author._id.toString() === userId.current) {
            setEditingDisplay(editPostDisplay)
        }
    }, [editingStatus, editPostText])

    // Anytime editingComment changes set the comment section
    useEffect(() => {
        if(editingComment) {
            setCommentsDisplay(commentsSectionWithEditing);
        }
        else {
            setCommentsDisplay(commentsSection);
        }
    }, [editingComment])

    // Anytime the exit comment text input changes set the comment section display
    useEffect(() => {
        if(editingComment) {
            setCommentsDisplay(commentsSectionWithEditing);
        }
    }, [editCommentText])

    // Like A Post
    const likePost = () => {

        // Get the associated likes 
        const selectedPostsLikes = document.getElementById(`likes-${selectedPost._id}`)

        // Toggle the "liked" class
        selectedPostsLikes.classList.toggle("liked");

        // Send a requestType which will let the middleware know to like or update post
        const requestInfo = {
            requestType: 'like',
            selectedPost: selectedPost
        }

        fetch(`${props.serverURL}/posts/${selectedPost._id}`, {
            method: 'PUT',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify(requestInfo),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            
            // Update post state with new post likes array
            let newSelectedPost = {
                ...selectedPost
            };
            newSelectedPost.likes = data.newLikesArray;

            setSelectedPost(newSelectedPost)
        })
        // TODO: Error Page/Message
        .catch(err => console.log(err))
    }

    // Comment on a post
    const postComment = (e) => {
        e.preventDefault();
        
        const commentTextInput = document.getElementById('commentTextInput');
        commentText.current = commentTextInput.value;
        

        const commentInfo = {
            parentPost: selectedPost,
            commentText: commentText.current,
            commentTime: Date.now()
        }

        // POST request with comment information
        fetch(`${props.serverURL}/posts/${selectedPost._id}/comments`, {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify(commentInfo),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            setSelectedPost(data.updatedPost);
            e.target.reset();
        })

        // TODO: Rendering Erros
        .catch(err => console.log(err))
      
    }

    // Renders the edit post form
    const renderEditPost = () => {
        setEditPostText(selectedPost.text);
        setEditingStatus(true);
    }

    // Cancels the edit post form
    const cancelEditPost = () => {

        // If the user was sent to this page, send them back
        if (location.state && location.state.originPage) {

            // If the edit came from the home page
            if (location.state.originPage === 'home') {
                navigate('/');
            }

            // If the edit came from the profile page
            else if (location.state.originPage === 'profile') {
                navigate(`/profile/${userId.current}`);
            }
        }
        // Else render normal page
        else {
            setEditingStatus(false)
        }
    }

    // Edit a post
    const editPostFormSubmit = (e) => {
        e.preventDefault();

        // Send a requestType which will let the middleware know to like or update post
        const requestInfo = {
            requestType: 'update',
            selectedPost: selectedPost,
            editedText: editPostText
        }

        fetch(`${props.serverURL}/posts/${selectedPost._id}`, {
            method: 'PUT',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify(requestInfo),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {

                // If location state exists
                if (location.state && location.state.originPage) {

                    // If the edit came from the home page
                    if (location.state.originPage === 'home') {
                        navigate('/');
                    }

                    // If the edit came from the profile page
                    else if (location.state.originPage === 'profile') {
                        navigate(`/profile/${userId.current}`);
                    }
                }
                // Else rerender selected post with updated data
                else {
                    setSelectedPost(data.updatedPost);
                    setEditingStatus(false);
                }
            }
        })
        .catch(err => console.log(err))
    }

    // Edit comment form submit
    const editCommentFormSubmit = (e) => {
        e.preventDefault();

        const editCommentInfo = {
            requestType: 'edit',
            text: editCommentText
        }
        fetch(`${props.serverURL}/posts/${selectedPost._id}/comments/${editingComment._id}`, {
            method: 'PUT',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify({editCommentInfo}),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            setSelectedPost(data.updatedParentPost);
            setEditingComment(null);
        })
        .catch(err => console.log(err))
    }

    // Edit a comment
    const editComment = (editingComment) => {
        setEditCommentText(editingComment.text);
        setEditingComment(editingComment);
    }

    // Cancels editing a comment
    const cancelEditComment = () => {
        setEditingComment(null);
    }

    // Delete a post
    const deletePost = () => {

        fetch(`${props.serverURL}/posts/${selectedPost._id}`, {
            method: 'DELETE',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                navigate('/');
            }
        })
        .catch(err => console.log(err))
        
    }

    // Like a comment
    const likeComment = (comment) => {

        // PUT request to comment route
        fetch(`${props.serverURL}/posts/${selectedPost._id}/comments/${comment._id}`, {
            method: 'PUT',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {

            // Update selected post's comments array with comment that has updated likes array
            const newCommentsArray = selectedPost.comments.map(com => {
                if(com._id.toString() === comment._id) {
                    return com = data.newComment;
                }
                else return com;
            })

            // Update Selected Post
            const newSelectedPost = {
                ...selectedPost
            }
            newSelectedPost.comments = newCommentsArray

            // Set state to updated post
            setSelectedPost(newSelectedPost);
        })
        .catch(err => console.log(err))
    }

    // Delete a comment
    const deleteComment = (comment) => {

        fetch(`${props.serverURL}/posts/${selectedPost._id}/comments/${comment._id}`, {
            method: 'DELETE',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify({comment: comment}),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            setSelectedPost(data.updatedParentPost);
        })
        .catch(err => console.log(err))
    }

    const editPostDisplay = (
        <div>
            {(selectedPost)
                ?
                <div>
                    <Navbar currentUser={currentUser.current} serverURL={props.serverURL}/>
                    <div className="individualPost">

                        <h1>Edit Post</h1>

                        <div className="individualPost-editPost">

                            <form onSubmit={editPostFormSubmit} id="individualPost-editForm">
                                <p>{selectedPost.author.name}</p>
                                <textarea type="text" value={editPostText} onChange={(e) => setEditPostText(e.target.value)} />
                                <p>{selectedPost.timestamp}</p>
                            </form>
                            <div className="individualPost-editPost-formButtons">
                                <button onClick={cancelEditPost}>Cancel</button>
                                <button form="individualPost-editForm">Submit</button>
                            </div>

                        </div>
                    </div>
                </div>
                :<></>
            }
        </div>
    )

    const commentsSection = (  
        <>
            {(selectedPost)
                ? 
                <div className="commentSection">
                    {selectedPost.comments.map(comment => {
                        return (
                            <div className="individualComment" key={comment._id} id={comment._id}>

                                {(comment.author._id === currentUser.current._id)
                                    ? 
                                    <div>
                                        <button onClick={() => editComment(comment)} >Edit</button>
                                        <button onClick={() => deleteComment(comment)} >Delete</button>
                                    </div>
                                    : <></>
                                }
                                <p>{comment.author.name}</p>
                                <p>{comment.text}</p>

                                <div className="individualComment-bottomRow">
                                    <div className="individualComment-bottomRow-left">
                                        {comment.likes.includes(userId.current) 
                                            ? <p className='commentLike liked' onClick={() => likeComment(comment)}>Like</p> 
                                            : <p className="commentLike" onClick={() => likeComment(comment)}>Like</p>
                                        }
                                        <p>{comment.timestamp}</p>
                                    </div>
                                    <div className="individualComment-bottomRow-right">
                                        <p>{comment.likes.length}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div className="postCommentSection">
                        <form onSubmit={postComment}>
                            <input id="commentTextInput" placeholder="Write a comment..." type="text" required={true} />
                            <button>Post</button>
                        </form>
                    </div>
                </div>
                :
                <></>
            }
    </>
    )

    const commentsSectionWithEditing = (
        <>
            {(selectedPost)
                ?
                <div className="commentSection">
                    {selectedPost.comments.map(comment => {
                        return (
                            <div className="individualComment" key={comment._id} id={comment._id}>
                                {(editingComment && editingComment._id === comment._id)
                                    ?
                                    <>
                                        {(comment.author._id === currentUser.current._id)
                                            ? 
                                            <div>
                                                <p>{comment.author.name}</p>
                                                <form onSubmit={editCommentFormSubmit} id="editCommentForm">
                                                    <input type="text" value={editCommentText} placeholder="Aa" required={true}
                                                        onChange={e => setEditCommentText(e.target.value)}
                                                    />
                                                </form>
                                                <div>
                                                    <button onClick={() => cancelEditComment()} >Cancel</button>
                                                    <button form="editCommentForm">Submit</button>
                                                </div>


                                                <div className="individualComment-bottomRow">
                                                    <div className="individualComment-bottomRow-left">
                                                        {comment.likes.includes(userId.current) 
                                                            ? <p className='commentLike liked'>Like</p> 
                                                            : <p className="commentLike">Like</p>
                                                        }
                                                        <p>{comment.timestamp}</p>
                                                    </div>
                                                    <div className="individualComment-bottomRow-right">
                                                        <p>{comment.likes.length}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            : <></>
                                        }
                                    </>
                                    :
                                    <>
                                        {(comment.author._id === currentUser.current._id)
                                            ? 
                                            <div>
                                                <button onClick={() => editComment(comment)} >Edit</button>
                                                <button onClick={() => deleteComment(comment)} >Delete</button>
                                            </div>
                                            : <></>
                                        }
                                        <p>{comment.author.name}</p>
                                        <p>{comment.text}</p>

                                        <div className="individualComment-bottomRow">
                                            <div className="individualComment-bottomRow-left">
                                                {comment.likes.includes(userId.current) 
                                                    ? <p className='commentLike liked' onClick={() => likeComment(comment)}>Like</p> 
                                                    : <p className="commentLike" onClick={() => likeComment(comment)}>Like</p>
                                                }
                                                <p>{comment.timestamp}</p>
                                            </div>
                                            <div className="individualComment-bottomRow-right">
                                                <p>{comment.likes.length}</p>
                                            </div>
                                        </div>
                                    </>
                                }
                            </div>
                        )
                    })}
                    <div className="postCommentSection">
                        <form onSubmit={postComment}>
                            <input id="commentTextInput" placeholder="Write a comment..." type="text" required={true} />
                            <button>Post</button>
                        </form>
                    </div>
                </div>
                :
                <>
                </>
            }
        </>
    )
    
    return(
        <div className="Page">
            {(editingStatus)
                ? 
                <>
                    {editingDisplay}
                </>
                : 
                <>
                    {display}
                    {commentsDisplay}
                </>
            }
        </div>
    )
}
export default IndividualPost;