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
    const [errorMessage, setErrorMessage] = useState();
    const {postId} = useParams();
    const userId = useRef();
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
                    setAuth(checkTokenResponse.auth);
                    setSelectedPost(checkTokenResponse.selectedPost)
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

    // Anytime the selectedPost changes, set the display
    useEffect(() => {
        if (selectedPost) {
            setDisplay(
                <div>
                    <Navbar userId={userId.current} serverURL={props.serverURL}/>
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
                            <p>9 comments</p>
                        </div>
            
                        <div className='individualPost-buttons'>
                            <button onClick={likePost}>Like</button>
                            <button>Comment</button>
                        </div>

                        <p>Map Comments so they all display here</p>
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
    
    return(
        <div className="Page">
            {display}
        </div>
    )
}
export default IndividualPost;