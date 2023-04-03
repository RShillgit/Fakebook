import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";

const Profile = (props) => {

    const [cookie, setCookie] = useCookies(['token']);
    const [auth, setAuth] = useState(null);
    const [currentProfile, setCurrentProfile] = useState();
    const [display, setDisplay] = useState();
    const {profileId} = useParams();
    const userId = useRef();
    const navigate = useNavigate();

    // Logged in user profile page
    const authedUserProfilePage = (
        <div>
            <Navbar userId={userId.current} serverURL={props.serverURL}/>
            <h1>My Profile {profileId}</h1>
        </div>
    )

    // Other user profile page
    const otherUserProfilePage = (
        <div>
            <Navbar userId={userId.current} serverURL={props.serverURL}/>
            <h1>Other User's Profile {profileId}</h1>
        </div>
    )

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

            // If it is the logged in users profile page
            if (currentProfile._id === userId.current) {
                setDisplay(authedUserProfilePage)
            }
            
            // If it is some other users profile page
            else {
                setDisplay(otherUserProfilePage)
            }
        }

    }, [currentProfile])

    return(
        <div className="Page">
            {display}
        </div>
    )
}
export default Profile;