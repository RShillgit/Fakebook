import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";
import '../styles/individualPost.css';

const IndividualPost = (props) => {
    
    const [cookie, setCookie] = useCookies(['token']);
    const [auth, setAuth] = useState(null);
    const [selectedPost, setSelectedPost] = useState();
    const [display, setDisplay] = useState();
    const commentText = useRef();
    const [errorMessage, setErrorMessage] = useState();
    const {postId} = useParams();
    const userId = useRef();
    const currentUser = useRef();
    const navigate = useNavigate();

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/posts/${postId}`, cookie.token);
               
                console.log(checkTokenResponse)
                // Successful response
                if(checkTokenResponse.success === true) {
                    userId.current = checkTokenResponse.userToken.sub;
                    currentUser.current = checkTokenResponse.currentUser;
                    setAuth(checkTokenResponse.auth);
                    setSelectedPost(checkTokenResponse.selectedPost);
                }

                // Unsuccessful response
                else {
                    // Set error message or render error page
                    console.log(checkTokenResponse);
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
            console.log(selectedPost)
            setDisplay(
                <div>
                    <Navbar currentUser={currentUser.current} serverURL={props.serverURL}/>
                    {errorMessage}
                    <div className="individualPost">
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
                    <div className="commentSection">
                        {selectedPost.comments.map(comment => {
                            return (
                                <div className="individualComment" key={comment._id} id={comment._id}>
                                    <p>{comment.author.name}</p>
                                    <p>{comment.text}</p>

                                    <div className="individualComment-bottomRow">
                                        <div className="individualComment-bottomRow-left">
                                            {comment.likes.includes(userId.current) 
                                                ? <p className='commentLike liked' onClick={likeComment}>Like</p> 
                                                : <p className="commentLike" onClick={likeComment}>Like</p>
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
                    </div>
                    <div className="postCommentSection">
                        <form onSubmit={postComment}>
                            <input id="commentTextInput" placeholder="Write a comment..." type="text" required={true} />
                            <button>Post</button>
                        </form>
                    </div>
                </div>
            )
        }
    }, [selectedPost])

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

    // Like a comment
    const likeComment = (e) => {

        // Get the selected comment
        const selectedCommentId = e.target.parentElement.parentElement.parentElement.id;

        // PUT request to comment route
        fetch(`${props.serverURL}/posts/${selectedPost._id}/comments/${selectedCommentId}`, {
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
                if(com._id.toString() === selectedCommentId) {
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
    
    return(
        <div className="Page">
            {display}
        </div>
    )
}
export default IndividualPost;