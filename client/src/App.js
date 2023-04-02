import { useEffect, useRef, useState } from 'react';
import Loading from './components/loading';
import {useCookies} from 'react-cookie';
import './styles/App.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/navbar';

function App(props) {

  const [cookie, setCookie] = useCookies(['token']);
  const [auth, setAuth] = useState(null);
  const [display, setDisplay] = useState();
  const [createPostErrorMessage, setCreatePostErrorMessage] = useState();
  const [allPosts, setAllPosts] = useState();
  const userId = useRef();
  const newPostText = useRef();
  const navigate = useNavigate();

  // Anytime the cookie changes, set auth
  useEffect(() => {

    (async () => {
      // If there is a token present, run checkToken function to see if its valid
      if(cookie.token) {
          const checkTokenResponse = await props.checkToken(`${props.serverURL}`, cookie.token);

          // If the resposne is successful
          if (checkTokenResponse.success === true) {
            userId.current = checkTokenResponse.userToken.sub; // TODO: checkTokenResponse Also includes iat & exp values
            setAllPosts(checkTokenResponse.allPosts)
            setAuth(checkTokenResponse.auth)
          }

          // If the response is unsuccessful
          else {
            // TODO: set error message or render error page
            // To view this error reload page when server isnt running
            console.log(checkTokenResponse);
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

    }
    // Not Logged In redirect to login
    else {
      navigate('/login')
    }
  }, [auth])

  // Anytime allPosts changes set the display
  useEffect(() => {
    if(allPosts) {
      setDisplay(
        <div>
          <Navbar userId={userId.current} serverURL={props.serverURL} />
          <div className='non-navbar-content'>
            <h1>Logged in... Render home page & display feed</h1>
  
            <div className='create-post'>
              <form onSubmit={createPostFormSubmit}>
                <input type="text" placeholder='Whats on your mind?' id='newPostTextInput'/>
                <button>Post</button>
                {createPostErrorMessage}
              </form>
            </div>
  
            <div className='allPosts'>
              {allPosts.map(post => {
                return(
                  <div className='individualPost' key={post._id}> 
                    <a className='individualPost-clickableArea' href={`/posts/${post._id}`}>
                      <p>{post.author.name}</p>
                      <p>{post.text}</p>
                      <p>{post.timestamp}</p>
                      <div className='individualPost-stats'>
                          <p id={`likes-${post._id}`}>{post.likes.length}</p>
                          <p>10 comments</p>
                      </div>
                    </a>
                    <div className='individualPost-buttons'>
                      <button onClick={() => likePost(post)}>Like</button>
                      <button>Comment</button>
                    </div>
                  </div>
                )
              })}
            </div>
  
          </div>
        </div>
      )
    }

  }, [allPosts])

  // Create Post
  const createPostFormSubmit = (e) => {
    e.preventDefault();

    const newPostTextInput = document.getElementById('newPostTextInput');
    newPostText.current = newPostTextInput.value;

    const newPostInfo = {
      text: newPostText.current,
      timestamp: Date.now()
    }

    // Post request with new post info
    fetch(`${props.serverURL}/posts`, {
      method: 'POST',
      headers: { 
        "Content-Type": "application/json",
        Authorization: cookie.token,
      },
      body: JSON.stringify(newPostInfo),
      mode: 'cors'
    })
    .then(res => res.json())
    .then(data => {

      // If it worked, refresh page
      if (data.success === true) {
        navigate(0)
      }
      // If it didnt, render error message
      else {
        console.log(data.err)
        setCreatePostErrorMessage(
          <div className='error-message'>
            <p>An Error Occurred</p>
          </div> 
        )
      }
    })
  }

  // Like A Post
  const likePost = (clickedPost) => {
    console.log(clickedPost)

    // Get the associated likes 
    const selectedPostsLikes = document.getElementById(`likes-${clickedPost._id}`)

    // Find out whether the user has liked the post or not
    // If they have, add "liked" to the class
    // If they haven't remove "liked" from the class
    //selectedPostsLikes.classList.toggle("liked");

    // Send a requestType which will let the middleware know to like or update post
    const requestInfo = {
      requestType: 'like',
      selectedPost: clickedPost
    }

    fetch(`${props.serverURL}/posts/${clickedPost._id}`, {
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
      console.log("Data", data)

      // Update allPosts state to include new likes array
      setAllPosts([...allPosts].map(post => {
        if(post._id === clickedPost._id) {
          return {
            ...post,
            likes: data.newLikesArray
          }
        }
        else return post;
      }))
    })
    .catch(err => console.log(err))
  }

  return (
    <div className='Page'>
      {display}
    </div>
  );
}

export default App;
