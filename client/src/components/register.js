import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = (props) => {

    const firstName = useRef();
    const lastName = useRef();
    const username = useRef();
    const password = useRef();
    const [errorMessage, setErrorMessage] = useState();
    const navigate = useNavigate();

    // Handles Register Form Submit
    const registerForm = (e) => {
        e.preventDefault();

        let passwordInput = document.getElementById('register-password').value;
        let confirmPasswordInput = document.getElementById('register-confirmPassword').value;

        // If passwords match register user
        if (passwordInput === confirmPasswordInput) {
            const firstNameInput = document.getElementById('register-firstName').value;
            const lastNameInput = document.getElementById('register-lastName').value;
            const usernameInput = document.getElementById('register-username').value;

            firstName.current = firstNameInput;
            lastName.current = lastNameInput;
            username.current = usernameInput;
            password.current = passwordInput;

            const newUserInfo = {
                firstName: firstName.current,
                lastName: lastName.current,
                username: username.current,
                password: password.current
            }

            // Send user info to the backend
            fetch(`${props.serverURL}/register`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUserInfo),
                mode: 'cors'
            })
            .then(res => res.json())
            .then(data => {

                // Username Already Exists
                if (data.success === false) {
                    setErrorMessage(data.message);
                }

                // If it was successful, redirect to login
                else if (data.success === true) {
                    navigate('/login', {state: {registeredMessage: 'Account Registered Successfully'}});
                }
            })
        }

        // If they dont match render error message
        else {
            setErrorMessage('Passwords Do Not Match')
        }
    }

    return (
        <div className="Page">
            <h1>Register</h1>

            <form onSubmit={registerForm}>

                <label> First Name
                    <input type="text" name="firstName" id="register-firstName"/>
                </label>
                <label> Last Name
                    <input type="text" name="lastName" id="register-lastName"/>
                </label>
                <label> Username
                    <input type="text" name="username" id="register-username"/>
                </label>
                <label> Password
                    <input type="password" name="password" id="register-password"/>
                </label>
                <label> Confirm Password
                    <input type="password" name="confirmPassword" id="register-confirmPassword"/>
                </label>

                <button>Register</button>

                {errorMessage}
            </form>
        </div>
    )
}
export default Register;