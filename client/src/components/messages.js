import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
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

    // Anytime all users changes change the sidebar
    useEffect(() => {
        if(auth && allUsers) {
            setDisplay(
                <div>
                    <div className="sidebar-currentChats">
                        <h1>Chats</h1>
                        {currentUser.chats.map(chat => {
                            return (  
                                <div key={chat._id}>
                                    {chat.members.map(member => {
                                        if(member._id !== currentUser._id) {
                                            return (
                                                <div className="sidebar-currentChats-individualChat"  key={member._id}>
                                                    <div className="sidebar-currentChats-individualChat-clickable"
                                                     onClick={() => {
                                                        // FIND USER FROM ALL USERS THAT MATCHES MEMBER._ID
                                                        const selectedUser = allUsers.filter(user => {
                                                            return user._id === member._id
                                                        })
                                                        userSelect(selectedUser[0])}
                                                    }>
                                                        <p>{member.name}</p>
                                                    </div>
                                                    <button onClick={() => deleteChat(chat)}>Delete</button>
                                                </div>
                                                )
                                            }
                                            return null
                                    })}
                                </div>                               
                            )
                        })}
                    </div>
                </div>
            )
        }
    }, [allUsers])

    useEffect(() => {

        if(messageReceiver) {

            // Get the current chat to display messages
            const chats = messageReceiver.chats.filter(chat => {
                if (chat.members.some(member => member._id === currentUser._id.toString())) {
                    return chat
                }
                return false
            })
            const currentChat = chats[0];

            // Reverse the messages array to get messages in chronological order
            const messagesArrayReversed = [...currentChat.messages].reverse();

            setMessagesDisplay(
                <div className="chat-container">
                    <div className="chat-allMessages">
                        {messagesArrayReversed.map(message => {

                            if(message.sender === currentUser._id.toString()) {
                                return (
                                    <div className="chat-allMessages-individualMessage currentUser" key={message._id} >
                                        <button onClick={() => deleteMessage(message)}>Delete</button>
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
        else {
            setMessagesDisplay()
        }
        
    }, [messageReceiver])

    // Sends message to a user
    const sendMessage = (e) => {
        e.preventDefault();

        const messageTextInput = document.getElementById('messageTextInput');
        const sendMessageForm = document.getElementById('sendMessageForm');

        // Find the chat ID
        const chat = currentUser.chats.filter(chat => {
            if (chat.members.some(member => member._id === messageReceiver._id)) {
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
            sendMessageForm.reset();
            setMessageReceiver(data.newMessageReceiver);
            setAllUsers(data.newAllUsers);
        })
        .catch(err => console.log(err)) 
    }

    // Onclick that selects message receiver user
    const userSelect = (selectedUser) => {

        // Check for chats with this user
        const checkForRecipient = currentUser.chats.filter(chat => {
            if (chat.members) {
                if (chat.members.some(member => member._id === selectedUser._id)) {
                    return chat
                } 
                return false
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
                body: JSON.stringify({selectedUser: selectedUser, currentUser: currentUser, selectedUserChats: selectedUser.chats}),
                mode: 'cors'
            })
            .then(res => res.json())
            .then(data => {
                setCurrentUser(data.updatedUser);
                setAllUsers(data.updatedAllUsers);
                setMessageReceiver(data.updatedRecipient);
                setSearchQuery(""); // Clear the input
            })
            .catch(err => console.log(err))
        }
        else {
            setMessageReceiver(selectedUser);
            setSearchQuery(""); // Clear the input
        } 
    }

    // Deletes one of the current user's messages
    const deleteMessage = (deletionMessage) => {

        // Send message info to the backend
        fetch(`${props.serverURL}/messages/${deletionMessage._id}`, {
            method: 'DELETE',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify({deletionMessage}),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            setMessageReceiver(data.newMessageReceiver);
            setAllUsers(data.newAllUsers);
        })
        .catch(err => console.log(err))
    }

    // Deletes chat 
    const deleteChat = (deletionChat) => {

        // Send message info to the backend
        fetch(`${props.serverURL}/messages`, {
            method: 'DELETE',
            headers: { 
                "Content-Type": "application/json",
                Authorization: cookie.token,
            },
            body: JSON.stringify({deletionChat}),
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setCurrentUser(data.updatedUser);
                setAllUsers(data.updatedAllUsers);
                setMessageReceiver();
            }
        })
        .catch(err => console.log(err))
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
                                        } else if (user.name.toLowerCase().includes(searchQuery.toLowerCase()) && user._id !== currentUser._id ) {
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