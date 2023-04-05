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
    const navigate = useNavigate();

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/messages`, cookie.token);
                userId.current = checkTokenResponse.userToken.sub;
                currentUser.current = checkTokenResponse.currentUser;
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
        // If the user is authorized render page
        else if (auth === true) {
            setDisplay(
                <div>
                    <Navbar currentUser={currentUser.current} serverURL={props.serverURL} />
                    <h1>Messages</h1>
                </div>
            )
        }
        // Not Logged In redirect to login
        else {
            navigate('/login')
        }
    }, [auth])

    return (
        <div className="Page">
            {display}
        </div>
    )
}
export default Messages;