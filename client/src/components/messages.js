import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";

const Messages = (props) => {

    const [cookie, setCookie] = useCookies(['token']);
    const [auth, setAuth] = useState(null);
    const [display, setDisplay] = useState();
    const userId = useRef();
    const currentUser = useRef();
    const [allUsers, setAllUsers] = useState();
    const navigate = useNavigate();

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/messages`, cookie.token);
                userId.current = checkTokenResponse.userToken.sub;
                currentUser.current = checkTokenResponse.currentUser;
                setAllUsers(checkTokenResponse.allUsers);
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

    // Anytime all users changes set the display
    useEffect(() => {

        // If the user is authorized and all users exist render page
        if (auth === true && allUsers) {
            console.log(allUsers)
            
            setDisplay(
                <div>
                    <Navbar currentUser={currentUser.current} serverURL={props.serverURL} />
                    <h1>Messages</h1>
                </div>
            )
        }

    }, [allUsers])

    return (
        <div className="Page">
            {display}
        </div>
    )
}
export default Messages;