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
  const currentUser = useRef();
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
            currentUser.current = checkTokenResponse.currentUser
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

    // Not Logged In redirect to login
    else if (auth === false) {
      navigate('/login')
    }
  }, [auth])

  // Anytime allPosts changes set the display
  useEffect(() => {
    if(allPosts) {
      setDisplay(
        <div>
          <Navbar currentUser={currentUser.current} serverURL={props.serverURL} />
          <div className='non-navbar-content'>
  
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
                    {(post.author._id === currentUser.current._id)
                      ?<button onClick={() => deletePost(post)}>Delete Post</button>
                      :<></>
                    }
                    <a className='individualPost-clickableArea' href={`/posts/${post._id}`}>
                      <p>{post.author.name}</p>
                      <p>{post.text}</p>
                      <p>{post.timestamp}</p>
                      <div className='individualPost-stats'>
                        {post.likes.includes(userId.current) 
                          ? <p className='liked' id={`likes-${post._id}`}>{post.likes.length}</p> 
                          : <p id={`likes-${post._id}`}>{post.likes.length}</p>
                        }
                        <p>{post.comments.length} comments</p>
                      </div>
                    </a>
                    <div className='individualPost-buttons'>
                      <button onClick={() => likePost(post)}>Like</button>
                      <a href={`/posts/${post._id}`}>
                        <button>Comment</button>
                      </a>
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

      // If it worked, render new post
      if (data.success) {
        
        /*
        // Add new post to the beginning of the allPosts array
        let newAllPostsArray = [...allPosts]
        newAllPostsArray.unshift(data.newPost);

        // Update allPosts state to include this new post
        setAllPosts(newAllPostsArray);
        */
        setAllPosts(data.updatedAllPosts);
        e.target.reset();
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

    // Get the associated likes 
    const selectedPostsLikes = document.getElementById(`likes-${clickedPost._id}`)

    // Toggle the "liked" class
    selectedPostsLikes.classList.toggle("liked");

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
    // TODO: Error Page/Message
    .catch(err => console.log(err))
  }

  // Delete A Post
  const deletePost = (deletionPost) => {

    fetch(`${props.serverURL}/posts/${deletionPost._id}`, {
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
          setAllPosts(data.allPosts)
        }
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
