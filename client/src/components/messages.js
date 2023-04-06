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
    const [messageReceiver, setMessageReceiver] = useState();
    const navigate = useNavigate();

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

            // Displaying each user the current user has chats with
            // Dont forget onclick that sets the messageReceiver
            /* 
            currentUser.chats.forEach(chat => {
                chat.members.map(member => {
                    if(member._id !== currentUser._id) {
                        <div className="sidebar-currentChats-individualChat" onClick={userSelect(member)} key={member._id}>
                            <p>{member.name}</p>
                        </div>
                    }
                })
            })
            */

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

    // Anytime all users changes
    useEffect(() => {
        if(auth && allUsers) {
            console.log(allUsers)
        }
    }, [allUsers])

    useEffect(() => {

        if(messageReceiver) {

            // Get the current chat to display messages
            const chats = messageReceiver.chats.filter(chat => {
                if (chat.members.some(member => member === currentUser._id.toString())) {
                    return chat
                }
                return false
            })
            const currentChat = chats[0];

            setMessagesDisplay(
                <div className="chat-container">
                    <div className="chat-allMessages">
                        {currentChat.messages.reverse().map(message => {

                            if(message.sender === currentUser._id.toString()) {
                                return (
                                    <div className="chat-allMessages-individualMessage currentUser" key={message._id} >
                                        <p>{message.content}</p>
                                        <p>{message.timestamp}</p>
                                    </div>
                                )
                            } else {
                                return (
                                    <div className="chat-allMessages-individualMessage recipientUser" key={message._id} >
                                        <p>{message.content}</p>
                                        <p>{message.timestamp}</p>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div className="chat-writeMessage">
                        <form onSubmit={sendMessage} id="sendMessageForm">
                            <input id="messageTextInput" type="text" placeholder="Aa" />
                            <button>Send</button>
                        </form>
                    </div>
                </div>
            )
        }
        
    }, [messageReceiver])

    // Sends message to a user
    const sendMessage = (e) => {
        e.preventDefault();

        const messageTextInput = document.getElementById('messageTextInput');
        const sendMessageForm = document.getElementById('sendMessageForm');

        // Find the chat ID
        const chat = currentUser.chats.filter(chat => {
            if (chat.members.some(member => member === messageReceiver._id.toString())) {
                return chat
            }
            return false
        })

        // Send message info to the backend
        fetch(`${props.serverURL}/messages`, {
            method: 'PUT',
            headers: { 
              "Content-Type": "application/json",
              Authorization: cookie.token,
            },
            body: JSON.stringify({
                sender: currentUser,
                receiver: messageReceiver,
                chat: chat[0],
                content: messageTextInput.value,
                timestamp: Date.now()
            }),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            sendMessageForm.reset();
            setMessageReceiver(data.newMessageReceiver);
        })
        .catch(err => console.log(err)) 
    }

    // Onclick that selects message receiver user
    const userSelect = (selectedUser) => {

        // Check for chats with this user
        const checkForRecipient = currentUser.chats.filter(chat => {
            if (chat.members.some(member => member === selectedUser._id.toString())) {
                return chat
            }
            return false
        })

        // If there are no chats with this user
        if (checkForRecipient.length === 0) {

            fetch(`${props.serverURL}/messages`, {
                method: 'POST',
                headers: { 
                  "Content-Type": "application/json",
                  Authorization: cookie.token,
                },
                body: JSON.stringify({selectedUser: selectedUser}),
                mode: 'cors'
            })
            .then(res => res.json())
            .then(data => {
                setCurrentUser(data.updatedUser);
                setMessageReceiver(selectedUser);
                setSearchQuery(""); // Clear the input
                // Also have data.updatedRecipient which is the updated version of selectedUser
            })
            .catch(err => console.log(err))
        }
        else {
            setMessageReceiver(selectedUser);
            setSearchQuery(""); // Clear the input
        } 
    }

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
                    
                    {(allUsers)
                        ?
                        <div className="messages-searchbar">
                            <label>
                                To:
                                <input type="text" placeholder="Search A Name" onChange={e => setSearchQuery(e.target.value)} value={searchQuery}/>
                            </label>
                            <div className="messages-searchbar-suggestions">
                                {
                                    allUsers.filter(user => {
                                        if (searchQuery === '') {
                                            return null;
                                        } else if (user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                                            return user;
                                        } else {
                                            return null;
                                        }
                                    }).map((user) => (
                                        <div className="messages-searchbar-suggestions-individualSuggestion" onClick={() => userSelect(user)} key={user._id}>
                                            <p>{user.name}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        :<></>
                    }

                    {messagesDisplay}
                </div>
                
            </div>

        </div>
    )
}
export default Messages;