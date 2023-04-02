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
                    setSelectedPost(
                        <div className="individualPost">
                            <p>{checkTokenResponse.selectedPost.author.name}</p>
                            <p>{checkTokenResponse.selectedPost.text}</p>
                            <p>{checkTokenResponse.selectedPost.timestamp}</p>

                            <div className='individualPost-stats'>
                                <p>47 likes</p>
                                <p>9 comments</p>
                            </div>
                 
                            <div className='individualPost-buttons'>
                                <button>Like</button>
                                <button>Comment</button>
                            </div>

                            <p>Map Comments so they all display here</p>
                        </div>
                    );
                    setAuth(checkTokenResponse.auth);
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
        // If the user is authorized render page
        else if (auth === true) {
            setDisplay(
                <div>
                    <Navbar userId={userId.current} serverURL={props.serverURL}/>
                    {errorMessage}
                    {selectedPost}
                </div>
            )
        }
        // Not Logged In redirect to login
        else {
            navigate('/login')
        }
    }, [auth])
    
    return(
        <div className="Page">
            {display}
        </div>
    )
}
export default IndividualPost;