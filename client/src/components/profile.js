import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";
import '../styles/profile.css';

const Profile = (props) => {

    const [cookie, setCookie] = useCookies(['token']);
    const [auth, setAuth] = useState(null);
    const [currentProfile, setCurrentProfile] = useState();
    const [selectedTab, setSelectedTab] = useState();
    const [display, setDisplay] = useState();
    const [tabDisplay, setTabDisplay] = useState();
    const [editing, setEditing] = useState(false);
    const {profileId} = useParams();
    const userId = useRef();
    const navigate = useNavigate();

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/profile/${profileId}`, cookie.token);
                userId.current = checkTokenResponse.userToken.sub;
                console.log(checkTokenResponse)
                setCurrentProfile(checkTokenResponse.userProfile);
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
            setSelectedTab(postsTab)
        }

    }, [currentProfile])

    // Selected tab changes
    useEffect(() => {

        if (selectedTab) {

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
                if (tab === selectedTab) {
                    tab.classList.toggle('active');
                }
            })

            // Posts Tab
            if (selectedTab === postsTab) {
                // Set editing to false
                setEditing(false); 
                setTabDisplay(
                    <div className="profileContent">
                        <h1>Posts Page</h1>
                        {(currentProfile.posts.length > 0)
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
            }

            // About Tab
            else if (selectedTab === aboutTab) {

                // Normal Profile
                if (!editing) {
                    setTabDisplay(
                        <div className="profileContent">
                            <h1>Profile</h1>
                            <div className="profileContent-about">
                                <p>Name: {currentProfile.name}</p>
                                <p>Bio: </p>
                                <p>Email: </p>
                                <p>Phone: </p>
                                <p>Employment: </p>
                                <p>Education: </p>
                            </div>
                        </div> 
                    )
                }

                /*
                setTabDisplay(
                    <div className="profileContent">
                        <h1>Profile</h1>
                        {(editing)
                            ? 
                            <div className="profileContent-about">
                                <form id="editProfileForm">
                                    <label> Name:
                                        <input onChange={editProfileInputChange} type="text" value={currentProfile.name} required={true} id='editProfile-name' />
                                    </label>
                                    <label> Bio:
                                        <input type="text" id='editProfile-bio' />
                                    </label>
                                    <label> Email:
                                        <input type="text" id='editProfile-email' />
                                    </label>
                                    <label> Phone:
                                        <input type="text" id='editProfile-phone' />
                                    </label>
                                </form>
                                <div className="editProfileForm-buttons">
                                    <button onClick={cancelEditProfile}>Cancel</button>
                                    <button form="editProfileForm">Submit</button>
                                </div>
                            </div>
                            : 
                            <div className="profileContent-about">
                                <p>Name: {currentProfile.name}</p>
                                <p>Bio: </p>
                                <p>Email: </p>
                                <p>Phone: </p>
                                <p>Employment: </p>
                                <p>Education: </p>
                            </div>
                        }
                    </div> 
                ) 
                */
            }

            // Friends Tab
            else if (selectedTab === friendsTab) {
                // Set editing to false
                setEditing(false);
                setTabDisplay(
                    <div className="profileContent">
                        <h1>Friends Page</h1>
                        {(currentProfile.friends.length > 0)
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
            }
        }
    }, [selectedTab])

    useEffect(() => {
        if (editing) {
            setTabDisplay(
                <div className="profileContent">
                    <h1>Profile</h1>
                    <div className="profileContent-about">
                        <form id="editProfileForm">
                            <label> Name:
                                <input onChange={editProfileInputChange} type="text" value={currentProfile.name} required={true} id='editProfile-name' />
                            </label>
                            <label> Bio:
                                <input type="text" id='editProfile-bio' />
                            </label>
                            <label> Email:
                                <input type="text" id='editProfile-email' />
                            </label>
                            <label> Phone:
                                <input type="text" id='editProfile-phone' />
                            </label>
                        </form>
                        <div className="editProfileForm-buttons">
                            <button onClick={cancelEditProfile}>Cancel</button>
                            <button form="editProfileForm">Submit</button>
                        </div>
                    </div>
                </div> 
            )
        }
        else if (!editing && currentProfile) {
            setTabDisplay(
                <div className="profileContent">
                    <h1>Profile</h1>
                    <div className="profileContent-about">
                        <p>Name: {currentProfile.name}</p>
                        <p>Bio: </p>
                        <p>Email: </p>
                        <p>Phone: </p>
                        <p>Employment: </p>
                        <p>Education: </p>
                    </div>
                </div> 
            )
        }
    }, [editing])

    // Sets selected tab to the clicked tab
    const navigationTabClick = (e) => {
        setSelectedTab(e.target);
    }

    // Sets about section to properly display edit profile form
    const editProfile = () => {

        // Set editing to true so about tab knows what to render
        setEditing(!editing);

        // About tab
        const aboutTab = document.getElementById("profileHeader-navigation-list-about");

        // Set selected tab to about
        setSelectedTab(aboutTab);
    }

    // Handles edit profile form input changes
    const editProfileInputChange = (e) => {
        console.log(e.target.value)
    }

    // Cancels Editing Profile
    const cancelEditProfile = () => {
        setEditing(false);
    }

    return(
        <div className="Page">
            {display}
            {tabDisplay}
        </div>
    )
}
export default Profile;