import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Loading from "./loading";
import Navbar from "./navbar";
import '../styles/messages.css';
import closeImg from '../images/close.png';
import sendImg from '../images/send.png';

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
                <div className="sidebar-currentChats">
                    <h2>Chats</h2>
                    {currentUser.chats.map(chat => {
                        return (  
                            <div className="sidebar-currentChats-individualChat" id={`sidebarChat-${chat._id}`} key={chat._id}>
                                {chat.members.map(member => {
                                    if(member._id !== currentUser._id) {
                                        return (
                                            <div className="sidebar-currentChats-individualChat-info" key={member._id}>
                                                <div className="sidebar-currentChats-individualChat-clickable"
                                                    onClick={() => {
                                                        // FIND USER FROM ALL USERS THAT MATCHES MEMBER._ID
                                                        const selectedUser = allUsers.filter(user => {
                                                            return user._id === member._id
                                                        })
                                                        userSelect(selectedUser[0])
                                                    }
                                                }>
                                                    <div className="individualChat-chatRecipient">
                                                        <p>{member.name}</p>
                                                    </div>
                                                    <div className="individualChat-chatPreview">
                                                        {(chat.messages[0])
                                                            ?<p>{chat.messages[0].content} · {formatTimestamp(chat.messages[0].timestamp)}</p>
                                                            :<></>
                                                        }
                                                    </div>
                                                </div>
                                                <button onClick={() => deleteChat(chat)}>
                                                    <img src={closeImg} alt="Delete"/>
                                                </button>
                                            </div>
                                            )
                                        }
                                        return null
                                })}
                            </div>                               
                        )
                    })}
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
                    <div className="chat-title">
                        <h4>{messageReceiver.name}</h4>
                    </div>
                    <div className="chat-allMessages">
                        {messagesArrayReversed.map(message => {

                            if(message.sender === currentUser._id.toString()) {
                                return (
                                    <div className="chat-allMessages-individualMessage currentUser" key={message._id} >
                                        <p className="individualMessage-timestamp">{formatMessageTimestamp(message, messagesArrayReversed)}</p>
                                        <div className="individualMessage-bubble">
                                            <button onClick={() => deleteMessage(message)}>
                                                <img src={closeImg} alt="Delete"/>
                                            </button>
                                            <p>{message.content}</p>
                                        </div>
                                        
                                    </div>
                                )
                            } else {
                                return (
                                    <div className="chat-allMessages-individualMessage recipientUser" key={message._id} > 
                                        <p className="individualMessage-timestamp">{formatMessageTimestamp(message, messagesArrayReversed)}</p>
                                        <div className="individualMessage-bubble">
                                            <p>{message.content}</p>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                    <div className="chat-writeMessage">
                        <form onSubmit={sendMessage} id="sendMessageForm">
                            <input id="messageTextInput" type="text" placeholder="Aa" required={true}
                            onChange={(e) => {
                                const sendMessageButton = document.getElementById('sendMessageButton');
                                if(e.target.value.length > 0) {   
                                    sendMessageButton.classList.add('readyToSend');
                                }
                                else {
                                    sendMessageButton.classList.remove('readyToSend');
                                }
                            }}
                            />
                            <button id="sendMessageButton">
                                <img src={sendImg} alt="Send"/>
                            </button>
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
            // Remove "readyToSend" class from send button
            const readyToSendButton = document.getElementById('sendMessageButton');
            readyToSendButton.classList.remove('readyToSend');

            // Reset form
            sendMessageForm.reset();

            // Set updated sates
            setMessageReceiver(data.newMessageReceiver);
            setAllUsers(data.newAllUsers);
        })
        .catch(err => console.log(err)) 
    }

    // Onclick that selects message receiver user
    const userSelect = (selectedUser) => {

        // Remove the "selectedSidebarChat" class from sidebar chats
        const selectedSidebarChats = document.querySelectorAll('.selectedSidebarChat');
        selectedSidebarChats.forEach(element => element.classList.remove('selectedSidebarChat'));

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
            // Add the "selectedSidebarChat" to the selectedUser
            const sidebarSelectedChat = document.getElementById(`sidebarChat-${checkForRecipient[0]._id}`)
            sidebarSelectedChat.classList.add('selectedSidebarChat')
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

    // Formats timestamp to display recency of each post
    const formatTimestamp = (timestamp) => {

        const currentTime = Date.now();
        const convertedTimestamp = new Date(timestamp);
        const epochTimestamp = convertedTimestamp.getTime();
        const epochTimeElapsed = currentTime - epochTimestamp;

        // Weeks elapsed
        const weeksElapsed = Math.floor(epochTimeElapsed/(1000 * 60 * 60 * 24 * 7));

        // If less than a week has elapsed
        if (weeksElapsed < 1) {

        // Days, hours, minutes, seconds elapsed
        const daysElapsed = Math.floor(epochTimeElapsed/(1000 * 60 * 60 * 24));
        const hoursElapsed = Math.floor(epochTimeElapsed/(1000 * 60 * 60));
        const minutesElapsed = Math.floor(epochTimeElapsed/(1000* 60));
        const secondsElapsed = Math.floor(epochTimeElapsed/1000);

        // If days have elapsed return the days
        if (daysElapsed > 0) {
            return `${daysElapsed}d`;
        }
        // Else if hours have elapsed return the hours
        else if (hoursElapsed > 0) {
            return `${hoursElapsed}h`;
        }
        // Else if minutes have elapsed return the minutes
        else if (minutesElapsed > 0) {
            return `${minutesElapsed}m`;
        }
        // Else return the seconds
        else {
            return `${secondsElapsed}s`;
        }
        }
        // If more than a week has elapsed return MM/DD/YYYY date
        else {

        // Day
        let day = convertedTimestamp.getDate();

        // Month
        let month = convertedTimestamp.getMonth() + 1;

        // Year
        let year = convertedTimestamp.getFullYear();

        // 2 digit months and days
        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = `0${month}`;
        }

        let formattedDate = `${month}/${day}/${year}`;

        return formattedDate;
        }
    }

    // Format messsage timestamp based on when previous message was sent
    const formatMessageTimestamp = (message, messagesArray) => {

        let formattedTimestamp;

        // Get year, month, and day from current day and message
        const todaysDate = new Date();
        const todaysYear = todaysDate.getFullYear();
        const todaysMonth = todaysDate.getMonth() + 1;
        const todaysDay = todaysDate.getDate();

        const messageDate = new Date(message.timestamp);
        const messageYear = messageDate.getFullYear();
        const messageMonth = messageDate.getMonth() + 1;
        const messageDay = messageDate.getDate();

        // If the message was sent today, render today-specific timestamp
        if (todaysYear === messageYear && todaysMonth === messageMonth && todaysDay === messageDay) {

            let hour = messageDate.getHours();
        
            let min  = messageDate.getMinutes();
            min = (min < 10 ? "0" : "") + min;

            // PM
            if (hour > 12) {
                hour = hour - 12;
                formattedTimestamp = `${hour}:${min} PM`;
            }
            // AM
            else {
                formattedTimestamp = `${hour}:${min} AM`;
            } 
        }
        // Else render MM/DD/YYYY timestamp
        else {
            formattedTimestamp = `${messageMonth}/${messageDay}/${messageYear}`;
        }
        // Get the index of the message
        const messageIndex = messagesArray.findIndex(msg => msg._id === message._id);

        // If the message is NOT the first message
        if (messageIndex > 0) {

            // Get the previous message
            let previousMessage = messagesArray[messageIndex - 1];

            // Year, month, day
            const previousMessageDate = new Date(previousMessage.timestamp);
            const previousMessageYear = previousMessageDate.getFullYear();
            const previousMessageMonth = previousMessageDate.getMonth() + 1;
            const previousMessageDay = previousMessageDate.getDate();

            // If the previous message was sent on the same day as the current message
            if (previousMessageYear === messageYear && previousMessageMonth === messageMonth && previousMessageDay === messageDay) {

                // Both sent today, compare times
                if (todaysYear === messageYear && todaysMonth === messageMonth && todaysDay === messageDay) {
                    
                    let previousMessageHours = previousMessageDate.getHours();
                    let previousMessageMinutes = previousMessageDate.getMinutes();

                    let currentMessageHours = messageDate.getHours();
                    let currentMessageMinutes  = messageDate.getMinutes();

                    // Same hour and less than 5 minutes apart
                    if(previousMessageHours === currentMessageHours && Math.abs(previousMessageMinutes - currentMessageMinutes) <= 5) {
                        formattedTimestamp = "";
                        return formattedTimestamp;
                    }
                    // More than 5 minutes apart
                    else return formattedTimestamp;
                }
                // Sent on the same day, but not today
                else {
                    formattedTimestamp = "";
                    return formattedTimestamp;
                } 
            }
            else return formattedTimestamp;
        }
        // Render formatted timestamp
        else return formattedTimestamp;
    }

    return (
        <div className="Page">
            {(currentUser)
                ? <Navbar currentUser={currentUser} serverURL={props.serverURL} />
                : <></>
            }
            <div className="non-navbar-content messenger">
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
        </div>
    )
}
export default Messages;