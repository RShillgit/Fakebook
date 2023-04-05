import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";
import '../styles/profile.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Profile = (props) => {

    const [cookie, setCookie] = useCookies(['token']);
    const [auth, setAuth] = useState(null);
    const [currentProfile, setCurrentProfile] = useState();
    const [display, setDisplay] = useState();
    const [tabDisplay, setTabDisplay] = useState();
    const {profileId} = useParams();
    const userId = useRef();
    const [editedName, setEditedName] = useState('');
    const [editedBio, setEditedBio] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [friendRequestButtonText, setFriendRequestButtonText] = useState('Add Friend');
    const navigate = useNavigate();

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/profile/${profileId}`, cookie.token);
                userId.current = checkTokenResponse.userToken.sub;
                
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
                <div>
                    <Navbar userId={userId.current} serverURL={props.serverURL}/>
                    <div className="profileHeader">
                        <div className="profileHeader-actions">
                            <h1>{currentProfile.name}</h1>
                            {(currentProfile._id === userId.current) 
                                ? <button onClick={editProfile}>Edit Profile</button>
                                : <button onClick={handleFriendRequest}>
                                    {(currentProfile.friend_requests.includes(userId.current))
                                        ? 'Unsend Friend Request'
                                        : 'Send Friend Request'
                                    }
                                </button>
                            }
                        </div>
                        <div className="profileHeader-navigation">
                            <ul className="profileHeader-navigation-list">
                                <li id="profileHeader-navigation-list-posts" onClick={navigationTabClick}>Posts</li>
                                <li id="profileHeader-navigation-list-about" onClick={navigationTabClick}>About</li>
                                <li id="profileHeader-navigation-list-friends" onClick={navigationTabClick}>Friends</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
            // Get posts tab to set initial tab
            const postsTab = document.getElementById("profileHeader-navigation-list-posts");
            if(postsTab) {
                // If the posts tab is NOT active, set it to active
                if (!postsTab.classList.contains('active')) {
                    postsTab.classList.toggle('active');
                }
                setTabDisplay(postsTabDisplay);
            }
        }
    }, [currentProfile])

    // Anytime the editing profile inputs change, set tab display so they rerender properly
    // TODO: This is a workaround for the form not working properly
    useEffect(() => {
        if (auth) {
            setTabDisplay(editingAboutTabDisplay);
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
            if (tab === e.target) {
                tab.classList.toggle('active');
            }
        })
        // Posts Tab
        if (e.target === postsTab) {
            setTabDisplay(postsTabDisplay);
        }
        // About Tab
        else if (e.target === aboutTab) {
            setTabDisplay(aboutTabDisplay);
        }
        // Friends Tab
        else if (e.target === friendsTab) {
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

                // Remove 'active' class from about tab
                const aboutTab = document.getElementById("profileHeader-navigation-list-about");
                if (aboutTab.classList.contains('active')) {
                    aboutTab.classList.remove('active');
                }

                // Set currentProfile to new user
                setCurrentProfile(data.newUser);

                // TODO: Maybe find a way to just rerender about tab
            }
        })
        .catch(err => console.log(err))
    }

    const handleFriendRequest = () => {

        let friendRequestsArray = currentProfile.friend_requests;

        // If the user is in the friend requests array already then remove them
        if (friendRequestsArray.includes(userId.current)) {
            friendRequestsArray = friendRequestsArray.filter(friend => {
                return friend !== userId.current;
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

        // Get the current user and sender's friend_requests and friends arrays
        let currentUserFriendRequestsArray = currentProfile.friend_requests;
        let currentUserFriendsArray = currentProfile.friends;
        let senderFriendRequestsArray = senderProfile.friend_requests;
        let senderFriendsArray = senderProfile.friends;

        console.log("Sender Requests Before", senderFriendRequestsArray);
        console.log("Sender Friends Before", senderFriendsArray);
        console.log("User Requests Before", currentUserFriendRequestsArray);
        console.log("User Friends Before", currentUserFriendsArray);

        // Remove sender from friend_requests array 
        currentUserFriendRequestsArray = currentUserFriendRequestsArray.filter(request => request._id !== senderId);
        // Remove current user from senders friend_requests array
        senderFriendRequestsArray = senderFriendRequestsArray.filter(request => request._id !== currentProfile._id);
        
        // Add sender to current user's friends array
        currentUserFriendsArray.unshift(senderProfile);
        // Add User to senders friends array
        senderFriendsArray.unshift(currentProfile);

        console.log("Sender Requests After", senderFriendRequestsArray);
        console.log("Sender Friends After", senderFriendsArray);
        console.log("User Requests After", currentUserFriendRequestsArray);
        console.log("User Friends After", currentUserFriendsArray);

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
                senderFriendRequestsArray: senderFriendRequestsArray,
                senderFriendsArray: senderFriendsArray,
                senderId: senderId
            }),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))

    }

    // Decline friend request
    const declineFriendRequest = (senderId) => {

        let currentUserFriendRequestsArray = currentProfile.friend_requests;
        let currentUserFriendsArray = currentProfile.friends;

        // Remove sender from friend_requests array
        currentUserFriendRequestsArray = currentUserFriendRequestsArray.filter(request => request._id !== senderId);
        
        // send these arrays to the backend

    }

    // Displays for each tab
    const postsTabDisplay = (
        <div className="profileContent">
            <h1>Posts Page</h1>
            {(currentProfile && currentProfile.posts.length > 0)
                ?
                <div className="profileContent-posts">
                    {currentProfile.posts.map(post => {
                        return (
                            <a href={`/posts/${post._id}`} className="profileContent-individualPost" key={post._id}>
                                <p>{post.text}</p>
                                <div className="profileContent-individualPost-stats">
                                    <p>{post.likes.length} likes</p>
                                    <p>{post.comments.length} comments</p>
                                </div>
                            </a>
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
            <h1>Profile</h1>
            <div className="profileContent-about"> 
                {(currentProfile)
                    ?
                    <div className="aboutInfo">
                        <p>Name: {currentProfile.name}</p>
                        <p>Bio: {currentProfile.bio}</p>
                        <p>Email: {currentProfile.email}</p>
                        <p>Phone: {currentProfile.phone}</p>
                        <p>Employment: </p>
                        <p>Education: </p>
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
            <h1>About</h1>
            <div className="profileContent-about">
                <form onSubmit={editProfileFormSubmit} id="editProfileForm">
                    <label> Name:
                        <input onChange={e => setEditedName(e.target.value)} value={editedName} type="text" required={true} id='editProfile-name' />
                    </label>
                    <label> Bio:
                        <input type="text" onChange={e => setEditedBio(e.target.value)} value={editedBio} id='editProfile-bio' />
                    </label>
                    <label> Email:
                        <input type="email" onChange={e => setEditedEmail(e.target.value)} value={editedEmail} id='editProfile-email' />
                    </label>
                    <label> Phone:
                        
                        <PhoneInput onChange={phone => setEditedPhone(phone)} value={editedPhone} id='editProfile-phone' />
                    </label>
                </form>
                <div className="editProfileForm-buttons">
                    <button onClick={cancelEditProfile}>Cancel</button>
                    <button form="editProfileForm">Submit</button>
                </div>
            </div>
        </div> 
    )
    const friendsTabDisplay = (
        <div className="profileContent">
            <h1>Friends Page</h1>
            {(currentProfile && currentProfile.friends.length > 0)
                ? 
                <div className="profileContent-friends">
                    {currentProfile.friends.map(friend => {
                        return (
                            <div className="profileContent-individualFriend">
                                <p>{friend.name}</p>
                            </div>
                        )
                    })}
                </div>
                :
                <div className="profileContent-friends">
                    <p>No Friends</p>
                </div>
            }
            {(currentProfile && currentProfile.friend_requests.length > 0)
                ?
                <div className="profileContent-friendRequests">
                    {currentProfile.friend_requests.map(friendRequest => {
                        return (
                            <div className="profileContent-individualFriendRequest" key={friendRequest._id}>
                                <a href={`/profile/${friendRequest._id}`}>
                                    {friendRequest.name} sent you a friend request
                                </a>
                                <button onClick={() => acceptFriendRequest(friendRequest._id)}>Accept</button>
                                <button onClick={() => declineFriendRequest(friendRequest._id)}>Decline</button>
                            </div>
                        )
                    })}
                </div>
                :
                <div className="profileContent-friendRequests">
                    <p>No Friend Requests</p>
                </div>
            }
        </div>
    )

    return(
        <div className="Page">
            {display}
            {tabDisplay}
        </div>
    )
}
export default Profile;