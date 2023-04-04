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
    const navigate = useNavigate();

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/profile/${profileId}`, cookie.token);
                userId.current = checkTokenResponse.userToken.sub;
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
                                : <button>Add Friend</button>
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
                postsTab.classList.toggle('active');
                setTabDisplay(postsTabDisplay);
            }
        }
    }, [currentProfile])

    // Anytime the editing profile inputs change, set tab display so they rerender properly
    // TODO: This is a workaround for the form not working properly
    useEffect(() => {
        setTabDisplay(editingAboutTabDisplay);
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
                <div className="profileConent-friends">
                    {currentProfile.friends.map(friend => {
                        return (
                            <div className="profileContent-individualFriend">
                                <p>{friend.name}</p>
                            </div>
                        )
                    })}
                </div>
                :
                <div className="profileConent-friends">
                    <p>No Friends</p>
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