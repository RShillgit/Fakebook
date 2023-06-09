import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import IndividualPost from "./components/individualPost";
import Login from "./components/login";
import Messages from "./components/messages";
import NotFound from "./components/notFound";
import Profile from "./components/profile";
import Register from "./components/register";
import './styles/all.css';

const RouteSwitch = () => {

    const checkToken = (url, token) => {
        return fetch(url, {
            headers: {
                Authorization: token
            },
        })
        .then(res => {
            const data = res.json()
            return (res.status, data);
        })  
        .catch(err => {return false})
    }

    const serverURL = 'https://fakebook-production-1e52.up.railway.app'; 

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/register" element={<Register serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/login" element={<Login serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/login/:fbToken" element={<Login serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/messages" element={<Messages serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/profile/:profileId" element={<Profile serverURL={serverURL} checkToken={checkToken} />} />
                <Route path="/posts/:postId" element={<IndividualPost serverURL={serverURL} checkToken={checkToken} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default RouteSwitch;