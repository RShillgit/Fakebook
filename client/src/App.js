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
                          <p>40k likes</p>
                          <p>10 comments</p>
                      </div>
                    </a>
                    <div className='individualPost-buttons'>
                      <button>Like</button>
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
    // Not Logged In redirect to login
    else {
      navigate('/login')
    }
  }, [auth])

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

  return (
    <div className='Page'>
      {display}
    </div>
  );
}

export default App;
