import { useEffect, useRef, useState } from "react";
import {useCookies} from 'react-cookie';
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "./loading";
import '../styles/login.css';
import Footer from "./footer";


const Login = (props) => {

    const fbURL = `${props.serverURL}/auth/facebook`
    const {state} = useLocation();
    const [cookie, setCookie] = useCookies(['token']);
    const u = useRef();
    const p = useRef();
    const [errorMessage, setErrorMessage] = useState('');
    const [registeredSuccessfullyMessage, setRegisteredSuccessfullyMessage] = useState();
    const [display, setDisplay] = useState();
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);

    // Anytime the cookie changes, set auth
    useEffect(() => {

        (async () => {
            // If there is a token present, run checkToken function to see if its valid
            if(cookie.token) {
                const validToken = await props.checkToken(`${props.serverURL}/login`, cookie.token);
                setAuth(validToken.auth)
            }
            else setAuth(false);
        })()

    }, [cookie])

    // Anytime auth changes set display
    useEffect(() => {

        // Loading
        if (auth === null) {
            setDisplay(<Loading />)
        }
        // If the user is authorized navigate them to the home page
        if (auth === true) {
            navigate('/')
        }
        // Not Logged In, set display to login form
        else {
            // If sent from register route with registered successfully message
            if (state) {
                if (state.registeredMessage) {
                    setRegisteredSuccessfullyMessage(state.registeredMessage);
                }
            }
            setDisplay(
                <>
                    <div className="loginPage-title">
                        <h1>fakebook</h1>
                    </div>
                    <div className="loginForm-container">
                        <div className="loginForm-title">Log Into Fakebook</div>
                        {registeredSuccessfullyMessage}
                        <form id="loginForm" onSubmit={loginFormSubmit}>
                            <input type="text" name="username" id="usernameInput" placeholder="Username" required={true}/>
                            <input type="password" name="password" id="passwordInput" placeholder="Password" required={true}/>                       
                            <button id="loginButton">Log In</button>
                        </form>

                        <div className="login-buttons">
                            <div className="login-buttons-topRow">
                                <button id="guestLoginButton" onClick={guestLogin}>Log In As A Guest</button>
                                <p>·</p>
                                <a id="registerLink" href='/register'> Sign up for Fakebook</a>
                            </div>
                            <div className="login-buttons-bottomRow">
                                <a href={fbURL}>
                                    <button id="fbLoginButton">Log In With Facebook</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </>
            )
        }
    }, [auth])

    // Handles login form submition
    const loginFormSubmit = (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('usernameInput');
        const passwordInput = document.getElementById('passwordInput');

        u.current = usernameInput.value;
        p.current = passwordInput.value;
        
        const username = u.current;
        const password = p.current;
        
        const login_information = {username, password};

        // Use this login info to send post request
        loginRequest(login_information);
    }

    // Creates a random account and logs it in
    const guestLogin = (e) => {
        e.preventDefault();

        fetch(`${props.serverURL}/guest`)
            .then(res => res.json())
            .then(data => {

                // If it was successfull, run loginRequest with this information
                if(data.success === true) {
                    const username = data.result.username;
                    const password = data.result.username;
                    const login_info = {username, password}
                    loginRequest(login_info);
                }
                // Otherwise render error message
                else {
                    setErrorMessage(
                        <div className="errorMessage">
                            <p>An Error Occurred Please Try Again</p>
                        </div>
                    )
                }
            })
    }

    // POST request to login route
    const loginRequest = (login_information) => {

        fetch(`${props.serverURL}/login`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(login_information),
            mode: 'cors'
        })
        .then((res) => res.json())
        .then((data) => {

            // If login credentials were INCORRECT render error message
            if (data.success === false) {
                setErrorMessage(
                    <div className="errorMessage">
                        <p>{data.error_message}</p>
                    </div>
                )
            }
            // If login credentials were CORRECT set cookie
            if (data.success === true) {
                // Get the cookie from the backend and set it in the browser
                setCookie('token', data.token, {path: '/'})
            }
        })
    }

    return (
        <div className="Page">
            <div className="loginPageContainer">
                {display}
                {errorMessage}
            </div>
            <Footer />
        </div>
    )
}

export default Login;