import { useEffect, useRef, useState } from 'react';
import Loading from './components/loading';
import {useCookies} from 'react-cookie';
import './styles/App.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/navbar';
import likeImg from './images/like.png';
import miniLikeImg from './images/mini-like.png';
import commentImg from './images/chat.png';
import editImg from './images/edit.png';
import deleteImg from './images/trash.png';

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
            userId.current = checkTokenResponse.userToken.sub; 
            currentUser.current = checkTokenResponse.currentUser
            setAllPosts(checkTokenResponse.allPosts)
            setAuth(checkTokenResponse.auth)
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
        <div className='homePageContainer'>
          <Navbar currentUser={currentUser.current} serverURL={props.serverURL} />
          <div className='non-navbar-content'>
  
            <div className='create-post'>
                <form onSubmit={createPostFormSubmit}>
                  <textarea type="text" rows="1" placeholder={`Whats on your mind?`} id='newPostTextInput'/>
                  <button>Post</button>
                  {createPostErrorMessage}
                </form>
            </div>
  
            <div className='allPosts'>
              {allPosts.map(post => {
                return(
                  <div className='individualPost' key={post._id}> 
                    {(post.author._id === currentUser.current._id)
                      ?
                      <div className='individualPost-creatorButtons'>
                        <button onClick={() => editPost(post)}>
                          <img src={editImg} alt='Edit'/>
                        </button>
                        <button onClick={() => deletePost(post)}>
                          <img src={deleteImg} alt='Delete'/>
                        </button>
                      </div>
                      :<></>
                    }
                    <div className='individualPost-creationInfo'>
                      <a href={`/profile/${post.author._id}`} className='individaulPost-creator'>{post.author.name}</a>
                      <p className='individualPost-date'>{formatTimestamp(post.timestamp)}</p>
                    </div>
                    <a className='individualPost-clickableArea' href={`/posts/${post._id}`}>
                      <p className='individualPost-text'>{post.text}</p>
                      <div className='individualPost-stats'>
                        <p id={`likes-${post._id}`}> 
                          <img id='likesStatImg' src={miniLikeImg} alt='Likes'/>
                          {post.likes.length}
                        </p>                   
                        <p>{post.comments.length} <img id='commentsStatImg' src={commentImg} alt='Comments'/></p>
                      </div>
                    </a>
                    <div className='individualPost-buttons'>
                    {post.likes.includes(userId.current)
                      ?
                      <button className='liked' onClick={() => likePost(post)}>
                        <img  src={likeImg} alt=''/>
                        Like
                      </button>
                      :
                      <button onClick={() => likePost(post)}>
                        <img  src={likeImg} alt=''/>
                        Like
                      </button>
                    }
                      <a href={`/posts/${post._id}`}>
                        <button>
                          <img src={commentImg} alt=''/>
                            Comment
                        </button>
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

  // Formats timestamp to display recency of each post
  const formatTimestamp = (timestamp) => {

    const currentTime = Date.now();
    const convertedTimestamp = new Date(timestamp);
    const epochTimestamp = convertedTimestamp.getTime();
    const epochTimeElapsed = currentTime - epochTimestamp;

    // Weeks elapsed
    const weeksElapsed = Math.floor(epochTimeElapsed/(1000 * 60 * 60 * 24 * 7));

    // If less than a week has elapsed
    if (weeksElapsed < 1) {

      // Days, hours, minutes, seconds elapsed
      const daysElapsed = Math.floor(epochTimeElapsed/(1000 * 60 * 60 * 24));
      const hoursElapsed = Math.floor(epochTimeElapsed/(1000 * 60 * 60));
      const minutesElapsed = Math.floor(epochTimeElapsed/(1000* 60));
      const secondsElapsed = Math.floor(epochTimeElapsed/1000);

      // If days have elapsed return the days
      if (daysElapsed > 0) {
        return `${daysElapsed}d`;
      }
      // Else if hours have elapsed return the hours
      else if (hoursElapsed > 0) {
        return `${hoursElapsed}h`;
      }
      // Else if minutes have elapsed return the minutes
      else if (minutesElapsed > 0) {
        return `${minutesElapsed}m`;
      }
      // Else return the seconds
      else {
        return `${secondsElapsed}s`;
      }
    }
    // If more than a week has elapsed return MM/DD/YYYY date
    else {

      // Day
      let day = convertedTimestamp.getDate();

      // Month
      let month = convertedTimestamp.getMonth() + 1;
  
      // Year
      let year = convertedTimestamp.getFullYear();
  
      // 2 digit months and days
      if (day < 10) {
          day = '0' + day;
      }
      if (month < 10) {
          month = `0${month}`;
      }
  
      let formattedDate = `${month}/${day}/${year}`;
  
      return formattedDate;
    }
  }

  // Edit post redirection
  const editPost = (postForEditing) => {
    navigate(`/posts/${postForEditing._id}`, {state: {editing: true, originPage: 'home'}})
  }

  return (
    <div className='Page'>
      {display}
    </div>
  );
}

export default App;
