import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";
import '../styles/profile.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import editImg from '../images/edit.png';
import deleteImg from '../images/trash.png';
import likeImg from '../images/like.png';
import miniLikeImg from '../images/mini-like.png';
import commentImg from '../images/chat.png';
import closeImg from '../images/close.png';

const Profile = (props) => {

    const [cookie, setCookie] = useCookies(['token']);
    const [auth, setAuth] = useState(null);
    const [currentProfile, setCurrentProfile] = useState();
    const [display, setDisplay] = useState();
    const [tabDisplay, setTabDisplay] = useState();
    const {profileId} = useParams();
    const userId = useRef();
    const authedUser = useRef();
    const [editedName, setEditedName] = useState('');
    const [editedBio, setEditedBio] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const navigate = useNavigate();

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/profile/${profileId}`, cookie.token);
                userId.current = checkTokenResponse.userToken.sub;
                authedUser.current = checkTokenResponse.authedUser;
                
                // Set State Variables
                setCurrentProfile(checkTokenResponse.userProfile);
                setEditedName(checkTokenResponse.userProfile.name);
                setEditedBio(checkTokenResponse.userProfile.bio);
                setEditedEmail(checkTokenResponse.userProfile.email);
                setEditedPhone(checkTokenResponse.userProfile.phone);
                setAuth(checkTokenResponse.auth)
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

    // Anytime the current profile changes, set the display
    useEffect(() => {

        // If there is a profile
        if(currentProfile) {
            setDisplay(
                <>
                    <Navbar currentUser={authedUser.current} serverURL={props.serverURL}/>
                    <div className="profileHeader">
                        <div className="profileHeader-actions">
                            <h1>{currentProfile.name}</h1>
                            {(currentProfile._id === userId.current) 
                                ? <button onClick={editProfile}><img src={editImg} alt=""/>Edit Profile</button>
                                : 
                                <>
                                    {(currentProfile.friend_requests.some(req => req._id === userId.current))
                                        ? <button onClick={handleFriendRequest}>Unsend Friend Request</button>
                                        : 
                                        <>
                                            {(currentProfile.friends.some(friend => friend._id === userId.current))
                                                ?<button onClick={() => removeFriend(currentProfile._id)}>Remove Friend</button>
                                                :<button onClick={handleFriendRequest}>Send Friend Request</button>
                                            }
                                        </>
                                    }
                                </>
                            }
                        </div>
                        <div className="profileHeader-navigation">
                            <ul className="profileHeader-navigation-list">
                                <li id="profileHeader-navigation-list-posts" >
                                    <p onClick={navigationTabClick}>Posts</p>
                                </li>
                                <li id="profileHeader-navigation-list-about" >
                                    <p onClick={navigationTabClick}>About</p>
                                </li>
                                <li id="profileHeader-navigation-list-friends" >
                                    <p onClick={navigationTabClick}>Friends</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </>
            )

            // Get the tabs
            const postsTab = document.getElementById("profileHeader-navigation-list-posts");
            const aboutTab = document.getElementById("profileHeader-navigation-list-about");
            const friendsTab = document.getElementById("profileHeader-navigation-list-friends");

            // If a tab is already active then set the appropriate display
            if(postsTab && aboutTab && friendsTab) {
                if (postsTab.classList.contains('active')) {
                    setTabDisplay(postsTabDisplay);
                }
                else if (aboutTab.classList.contains('active')) {
                    setTabDisplay(aboutTabDisplay);
                }
                else if (friendsTab.classList.contains('active')) {
                    setTabDisplay(friendsTabDisplay);
                }
                // No tab is currently active, so set it to posts
                else {
                    postsTab.classList.toggle('active');
                    setTabDisplay(postsTabDisplay);
                }
            }
        }
    }, [currentProfile])

    // Anytime the editing profile inputs change, set tab display so they rerender properly
    useEffect(() => {
        if (auth) {
            if (tabDisplay) {
                setTabDisplay(editingAboutTabDisplay);
            }
        } 
    }, [editedName, editedBio, editedEmail, editedPhone])

    const navigationTabClick = (e) => {

        // Get all the tabs
        const postsTab = document.getElementById("profileHeader-navigation-list-posts");
        const aboutTab = document.getElementById("profileHeader-navigation-list-about");
        const friendsTab = document.getElementById("profileHeader-navigation-list-friends");

        // Remove "active" class from all tabs and add it to the selected tab
        const navigationTabs = [postsTab, aboutTab, friendsTab];
        navigationTabs.forEach(tab => {
            if(tab.classList.contains('active')) {
                tab.classList.remove('active');
            }
            if (tab === e.target.parentElement) {
                tab.classList.toggle('active');
            }
        })
        // Posts Tab
        if (e.target.innerHTML === 'Posts') { //e.target === postsTab
            setTabDisplay(postsTabDisplay);
        }
        // About Tab
        else if (e.target.innerHTML === 'About') {
            setTabDisplay(aboutTabDisplay);
        }
        // Friends Tab
        else if (e.target.innerHTML === 'Friends') {
            setTabDisplay(friendsTabDisplay);
        }
    }

    // Sets about section to edit profile form
    const editProfile = () => {

        // Get all the tabs
        const postsTab = document.getElementById("profileHeader-navigation-list-posts");
        const aboutTab = document.getElementById("profileHeader-navigation-list-about");
        const friendsTab = document.getElementById("profileHeader-navigation-list-friends");

        // Remove "active" class from all tabs and add it to the about tab
        const navigationTabs = [postsTab, aboutTab, friendsTab];
        navigationTabs.forEach(tab => {
            if(tab.classList.contains('active')) {
                tab.classList.remove('active');
            }
            if (tab === aboutTab) {
                tab.classList.toggle('active');
            }
        })
        
        setTabDisplay(editingAboutTabDisplay);
    }

    // Cancels Editing Profile
    const cancelEditProfile = () => {
        setTabDisplay (aboutTabDisplay);
    }

    // Edit profile information form submit
    const editProfileFormSubmit = (e) => {
        e.preventDefault();

        const formData = {
            name: editedName,
            bio: editedBio,
            email: editedEmail,
            phone: editedPhone
        }

        fetch(`${props.serverURL}/profile`, {
            method: 'PUT',
            headers: { 
              "Content-Type": "application/json",
              Authorization: cookie.token,
            },
            body: JSON.stringify(formData),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success === true && data.newUser) {
                // Set currentProfile to new user
                setCurrentProfile(data.newUser);
            }
        })
        .catch(err => console.log(err))
    }

    const handleFriendRequest = () => {

        let friendRequestsArray = currentProfile.friend_requests;

        // If the user is in the friend requests array already then remove them
        if (friendRequestsArray.some(req => req._id === userId.current)) {
            friendRequestsArray = friendRequestsArray.filter(friend => {
                return friend._id !== userId.current;
            })
        }
        // Else, add them to the array
        else {
            friendRequestsArray.unshift(userId.current);
        }

        fetch(`${props.serverURL}/friends`, {
            method: 'POST',
            headers: { 
              "Content-Type": "application/json",
              Authorization: cookie.token,
            },
            body: JSON.stringify({profileId: profileId, friendRequestsArray: friendRequestsArray}),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            // Update currentProfile state
            if(data.auth && data.success) {
                setCurrentProfile(data.updatedUser);
            }
        })
        .catch(err => console.log(err))
    }

    // Accept friend request
    const acceptFriendRequest = (senderId) => {

        const senderProfile = currentProfile.friend_requests.find(profile => profile._id === senderId);

        // Map the arrays so they only include the object Id's
        // This prevents infinite nesting inside the arrays
        let currentUserFriendRequestsArray = currentProfile.friend_requests.map(obj => {
                return obj._id
            }
        )
        let currentUserFriendsArray = currentProfile.friends.map(obj => {
                return obj._id
            }
        )
        let senderFriendsArray = senderProfile.friends.map(obj => {
                return obj._id
            }
        )

        // Remove sender from friend_requests array 
        currentUserFriendRequestsArray = currentUserFriendRequestsArray.filter(request => request !== senderId);
        // Add sender to current user's friends array
        currentUserFriendsArray.unshift(senderProfile._id);
        // Add User to senders friends array
        senderFriendsArray.unshift(currentProfile._id);

        // Send these arrays to the backend
        fetch(`${props.serverURL}/friends`, {
            method: 'PUT',
            headers: { 
              "Content-Type": "application/json",
              Authorization: cookie.token,
            },
            body: JSON.stringify({
                currentUserFriendRequestsArray: currentUserFriendRequestsArray, 
                currentUserFriendsArray: currentUserFriendsArray, 
                senderFriendsArray: senderFriendsArray,
                senderId: senderId
            }),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            // If it was successful set currentProfile to the updated profile
            if (data.success) {
                setCurrentProfile(data.updatedUser);
            }
        })
        .catch(err => console.log(err))
    }

    // Decline friend request
    const declineFriendRequest = (senderId) => {

        // Map the arrays so they only include the object Id's
        // This prevents infinite nesting inside the arrays
        let currentUserFriendRequestsArray = currentProfile.friend_requests.map(obj => {
                return obj._id
            }
        )   
        // Remove sender from friend_requests array
        currentUserFriendRequestsArray = currentUserFriendRequestsArray.filter(request => request !== senderId);
        
        // send the array to the backend
        // Send these arrays to the backend
        fetch(`${props.serverURL}/friends`, {
            method: 'PUT',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify({
                currentUserFriendRequestsArray: currentUserFriendRequestsArray, 
            }),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            // If it was successful set currentProfile to the updated profile
            if(data.success) {
                setCurrentProfile(data.updatedUser);
            }
        })
        .catch(err => console.log(err))
    }

    // Remove friend from friends list
    const removeFriend = (friendId) => {
        fetch(`${props.serverURL}/friends`, {
            method: 'DELETE',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify({friendId: friendId}),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            // Set current profile to the proper user
            if(currentProfile._id === userId.current) {
                setCurrentProfile(data.currentUserUpdated);
            }
            else {
                setCurrentProfile(data.friendUpdated);
            }
        })
        .catch(err => console.log(err))
    }

    // Delet a post
    const deletePost = (deletionPost) => {
        console.log(deletionPost)

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
                setCurrentProfile(data.updatedUser)
              }
          })
          .catch(err => console.log(err))
    }

    // Edit post redirection
    const editPost = (postForEditing) => {
        navigate(`/posts/${postForEditing._id}`, {state: {editing: true, originPage: 'profile'}})
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

            // Update currentProfile posts array to include new likes array
            const updatedPostsArray = [...currentProfile.posts].map(post => {
                if(post._id === clickedPost._id) {
                    return {
                        ...post,
                        likes: data.newLikesArray
                    }
                }
                else return post;
            })

            // Update currentProfile state
            let updatedCurrentProfile = {...currentProfile};
            updatedCurrentProfile.posts = updatedPostsArray;
            setCurrentProfile(updatedCurrentProfile);
        })
        // TODO: Error Page/Message
        .catch(err => console.log(err))
    }

    // Selects list or grid posts display
    const postsViewSelect = (e) => {

        // Remove "grid" class from posts section
        const postsContent = document.querySelector('.profileContent-posts');
        if(postsContent.classList.contains('grid')) {
            postsContent.classList.remove('grid');
        }

        // Remove "selected" class from both list items
        const listItem1 = document.getElementById("postsViewSelect-listItem1");
        const listItem2 = document.getElementById("postsViewSelect-listItem2");
        listItem1.classList.remove('selected');
        listItem2.classList.remove('selected');

        // List View
        if (e.target.id === 'postsViewSelect-list') {
            listItem1.classList.add('selected');
        }
        // Grid view
        else if (e.target.id === 'postsViewSelect-grid') {
            listItem2.classList.add('selected');
            postsContent.classList.add('grid');
        }
    }

    // Displays for each tab
    const postsTabDisplay = (
        <div className="profileContent">
            <div className="profileContent-header-posts">
                <div className="headerContainer">
                    <header>
                        <h2>Posts Page</h2>
                    </header>
                    <div className="profileContent">
                        <ul>
                            <li id="postsViewSelect-listItem1" className="selected">
                                <button id="postsViewSelect-list" onClick={postsViewSelect}>List View</button>
                            </li>
                            <li id="postsViewSelect-listItem2">
                                <button id="postsViewSelect-grid" onClick={postsViewSelect}>Grid View</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {(currentProfile && currentProfile.posts.length > 0)
                ?
                <div className="profileContent-posts">
                    {currentProfile.posts.map(post => {
                        return (
                            <div className="profileContent-individualPost" key={post._id}>
                                <div className="profileContent-individualPost-header">
                                    <div className="headerCredentials">
                                        <p className="profile-individualPost-author">{currentProfile.name}</p>
                                        <p className="profile-individualPost-timestamp">{post.timestamp}</p>
                                    </div>
                                    {(currentProfile._id === userId.current)
                                        ?
                                        <div className="profile-posts-buttons">
                                            <button onClick={() => deletePost(post)}>
                                                <img src={deleteImg} alt="Delete"/>
                                            </button>
                                            <button onClick={() => editPost(post)}>
                                                <img src={editImg} alt="Edit"/>
                                            </button>
                                        </div>
                                        :<></>
                                    }
                                </div>
                                <a href={`/posts/${post._id}`}>
                                    <p>{post.text}</p>
                                    <div className="profileContent-individualPost-stats">
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
                                            <img src={likeImg} alt=''/>
                                            Like
                                        </button>
                                        :
                                        <button onClick={() => likePost(post)}>
                                            <img src={likeImg} alt=''/>
                                            Like
                                        </button>
                                    } 
                                    <a href={`/posts/${post._id}`}>
                                        <img src={commentImg} alt=''/>
                                        Comment
                                    </a>
                                </div>
                            </div>    
                        )
                    })}
                </div>
                :
                <div className="profileContent-posts">
                    <p>No Posts</p>
                </div>
            }
        </div>
    )
    const aboutTabDisplay = (
        <div className="profileContent">
            <div className="profileContent-about"> 
                <div className="about-header">
                    <h3>About</h3>
                </div>
                {(currentProfile)
                    ?
                    <div className="aboutInfo">
                        <label>Name:<p>{currentProfile.name}</p></label>
                        <label>Bio:<p>{currentProfile.bio}</p></label>
                        <label>Email:<p>{currentProfile.email}</p></label>
                        <label>Phone:<p>{currentProfile.phone}</p></label> 
                    </div>
                    :
                    <div className="aboutInfo">
                    </div>
                }
            </div>
        </div> 
    )
    const editingAboutTabDisplay = (
        <div className="profileContent">
            <div className="profileContent-about">
                <div className="about-header">
                    <h3>About</h3>
                </div>
                <form onSubmit={editProfileFormSubmit} id="editProfileForm">
                    <label> Name:
                        <input onChange={e => setEditedName(e.target.value)} value={editedName} type="text" required={true} id='editProfile-name' />
                    </label>
                    <label> Bio:
                        <textarea type="text" onChange={e => setEditedBio(e.target.value)} value={editedBio} id='editProfile-bio' />
                    </label>
                    <label> Email:
                        <input type="email" onChange={e => setEditedEmail(e.target.value)} value={editedEmail} id='editProfile-email' />
                    </label>
                    <label> Phone:
                        <PhoneInput onChange={phone => setEditedPhone(phone)} value={editedPhone} id='editProfile-phone' />
                    </label>
                </form>
                <div className="editProfileForm-buttons">
                    <button id="editProfileCancel" onClick={cancelEditProfile}><img src={closeImg} alt="Cancel"/></button>
                    <button id="editProfileSubmit" form="editProfileForm">Edit your About info</button>
                </div>
            </div>
        </div> 
    )
    const friendsTabDisplay = (
        <div className="profileContent">
            <div className="profileContent-friends">
                <div className="about-header">
                    <h3>Friends</h3>
                </div>
                {(currentProfile && currentProfile.friends.length > 0)
                    ?                 
                    <div className="profileContent-currentFriends">
                        {currentProfile.friends.map(friend => {
                            return (
                                <div key={friend._id} className="profileContent-individualFriend">
                                    <a href={`/profile/${friend._id}`}>
                                        {friend.name}
                                    </a>
                                    {(currentProfile && currentProfile._id === userId.current)
                                        ?<button id="removeFriendButton" onClick={() => removeFriend(friend._id)}><img src={closeImg} alt="Remove Friend"/></button>
                                        :<></>
                                    }
                                </div>
                            )
                        })}
                    </div>   
                    :
                    <div className="profileContent-currentFriends">
                        <p>No Friends</p>
                    </div>
                }
                {(currentProfile && currentProfile._id === userId.current && currentProfile.friend_requests.length > 0)
                    ?
                    <div className="profileContent-friendRequests">
                        <div className="friendRequests-header">
                            <h4>Friend Requests</h4>
                        </div>
                        {currentProfile.friend_requests.map(friendRequest => {
                            return (
                                <div className="profileContent-individualFriendRequest" key={friendRequest._id}>
                                    <a href={`/profile/${friendRequest._id}`}>
                                        {friendRequest.name}
                                    </a>
                                    <div className="individualFriendRequest-buttons">
                                        <button id="confirmFriendRequest" onClick={() => acceptFriendRequest(friendRequest._id)}>Confirm</button>
                                        <button id="deleteFriendRequest" onClick={() => declineFriendRequest(friendRequest._id)}>Delete</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    :
                    <>
                        <div className="friendRequests-header">
                            <h4>Friend Requests</h4>
                        </div>
                        {(currentProfile && currentProfile._id === userId.current)
                            ? <p>No Friend Requests</p>
                            : <></>
                        }
                    </>
                }
            </div>
        </div>
    )

    return(
        <div className="Page ProfilePage">
            {display}
            {tabDisplay}
        </div>
    )
}
export default Profile;