import { useRef, useState } from "react";

const Login = (props) => {

    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        if (e.target.name === 'username') setUsername(e.target.value)
        if (e.target.name === 'password') setPassword(e.target.value)
    }

    const loginFormSubmit = (e) => {
        e.preventDefault();
        
        console.log(username, password)
        const login_information = {username, password};

        fetch(`${props.serverURL}/login`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(login_information),
            mode: 'cors'
        })
        .then((res) => res.json())
        .then((data) => {

            // If login credentials were incorrect render error message
            if (data.success === false) {
                setErrorMessage(
                    <div className="errorMessage">
                        <p>{data.error_message}</p>
                    </div>
                )
            }
            //If they were correct make token persistant somehow
            //TODO
            if (data.success === true) {
                console.log(data.token)
            }


        })
    }

    return (
        <div>
            <form onSubmit={loginFormSubmit}>
                <label>
                    Username
                    <input onChange={handleChange} type="text" name="username"/>
                </label>
                <label>
                    Password
                    <input onChange={handleChange} type="password" name="password"/>
                </label>
                <button>Login</button>
            </form>

            {errorMessage}
        </div>
    )

}

export default Login;