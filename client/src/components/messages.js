import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";
import '../styles/messages.css';

const Messages = (props) => {

    const [cookie, setCookie] = useCookies(['token']);
    const [auth, setAuth] = useState(null);
    const [display, setDisplay] = useState();
    const [messagesDisplay, setMessagesDisplay] = useState();
    const [searchQuery, setSearchQuery] = useState("");
    const userId = useRef();
    const [currentUser, setCurrentUser] = useState();
    const [allUsers, setAllUsers] = useState();
    const navigate = useNavigate();

    const Data = [
        {
            id: 1,
            text: "Dog"
        },
        {
            id: 2,
            text: "Cat"
        },
        {
            id: 3,
            text: "Bear"
        },
        {
            id: 4,
            text: "Tiger"
        },
    ]

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const checkTokenResponse = await props.checkToken(`${props.serverURL}/messages`, cookie.token);
                userId.current = checkTokenResponse.userToken.sub;
                setAllUsers(checkTokenResponse.allUsers);
                setCurrentUser(checkTokenResponse.currentUser);
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

    // Anytime current user changes set the display
    useEffect(() => {

        // If the user is authorized and all users exist render page
        if (auth && currentUser) {

            setDisplay(
                <div>
                    <div className="sidebar-currentChats">
                        <h1>Chats</h1>
                        <p>John Doe</p>
                        <p>Bob the Builder</p>
                        <p>etc..</p>
                    </div>
                </div>
            )
        }

    }, [currentUser])

    // Anytime all users changes set messages display
    useEffect(() => {
        if(auth && allUsers) {
            console.log(allUsers)

            setMessagesDisplay(
                <div className="chat-container">

                    <div className="chat-message">
                        <p>Message 1</p>
                    </div>
                    <div className="chat-message">
                        <p>Message 2</p>
                    </div>
                </div>
            )
        }
    }, [allUsers])

    return (
        <div className="Page">
            {(currentUser)
                ? <Navbar currentUser={currentUser} serverURL={props.serverURL} />
                : <></>
            }
            <div className="messages-container">
                <div className="messages-sidebar">
                    {display}
                </div>
                <div className="messages-main">
                    
                    <div className="messages-searchbar">
                        <label>
                            To:
                            <input type="text" placeholder="Search A Name" onChange={e => setSearchQuery(e.target.value)}/>
                        </label>
                        <div className="messages-searchbar-suggestions">
                            {
                                Data.filter(post => {
                                    if (searchQuery === '') {
                                        return post;
                                    } else if (post.text.toLowerCase().includes(searchQuery.toLowerCase())) {
                                        return post;
                                    }
                                }).map((post, index) => (
                                    <div key={index}>
                                        <p>{post.text}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {messagesDisplay}
                </div>
                
            </div>

        </div>
    )
}
export default Messages;