import { useRef, useState } from "react";

const Login = (props) => {

    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

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
        .then((data) => {console.log(data)})
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
        </div>
    )

}

export default Login;