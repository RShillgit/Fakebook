import { useEffect, useRef, useState } from "react";
import {useCookies} from 'react-cookie';
import { useNavigate } from "react-router-dom";
import Loading from "./loading";

const Login = (props) => {

    const [cookie, setCookie] = useCookies(['token']);
    const u = useRef();
    const p = useRef();
    const [errorMessage, setErrorMessage] = useState('');
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
            setDisplay(
                <div>
                    <form onSubmit={loginFormSubmit}>
                        <label>
                            Username
                            <input type="text" name="username" id="usernameInput"/>
                        </label>
                        <label>
                            Password
                            <input type="password" name="password" id="passwordInput"/>
                        </label>
                        <button>Login</button>
                    </form>

                    <button onClick={loginWithFacebook}>Login With Facebook</button>

                    {errorMessage}
                </div>
            )
        }
    }, [auth])

    const loginFormSubmit = (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('usernameInput');
        const passwordInput = document.getElementById('passwordInput');

        u.current = usernameInput.value;
        p.current = passwordInput.value;
        
        const username = u.current;
        const password = p.current;
        
        const login_information = {username, password};

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

    const loginWithFacebook = (e) => {
        e.preventDefault();

        fetch(`${props.serverURL}/auth/facebook/callback`, {
            headers: { "Content-Type": "application/json" },
            mode: 'cors'
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))

        // TODO: SETUP OAUTH 
        /*
        fetch(`${props.serverURL}/auth/facebook`, {
            headers: { "Content-Type": "application/json" },
            mode: 'no-cors'
        })
            .then( (res) => {
                console.log(res)

            })
        */
    }

    return (
        <div className="Page">
            {display}
        </div>
    )

}

export default Login;