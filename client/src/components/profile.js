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

            console.log(currentProfile)

            setDisplay(
                <div>
                    <Navbar userId={userId.current} serverURL={props.serverURL}/>
                    <div className="profileHeader">
                        <div className="profileHeader-actions">
                            <h1>{currentProfile.name}</h1>
                            {(currentProfile._id === userId.current) 
                                ? <button>Edit Profile</button>
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

        // Render tab specific info

    }, [selectedTab])

    // Sets selected tab to the clicked tab
    const navigationTabClick = (e) => {
        setSelectedTab(e.target);
    }

    return(
        <div className="Page">
            {display}
        </div>
    )
}
export default Profile;