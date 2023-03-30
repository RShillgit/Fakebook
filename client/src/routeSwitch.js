import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./components/login";
import NotFound from "./components/notFound";
import Profile from "./components/profile";

const RouteSwitch = () => {

    const checkToken = (url, token) => {
        return fetch(url, {
            headers: {
                Authorization: token
            }
        })
        .then(res => {
            const data = res.json()
            return (res.status, data);
            //if(res.status === 200) return true
            //else return false
        })  
        .catch(err => {return false})
    }

    const serverURL = 'http://localhost:8000';

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/login" element={<Login serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/profile/:id" element={<Profile serverURL={serverURL} checkToken={checkToken} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default RouteSwitch;