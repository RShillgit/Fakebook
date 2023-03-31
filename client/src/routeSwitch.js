import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Friends from "./components/friends";
import IndividualPost from "./components/individualPost";
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
        })  
        .catch(err => {return false})
    }

    const serverURL = 'http://localhost:8000';

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/login" element={<Login serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/friends" element={<Friends serverURL={serverURL} checkToken={checkToken}/>} />
                <Route path="/profile/:profileId" element={<Profile serverURL={serverURL} checkToken={checkToken} />} />
                <Route path="/posts/:postId" element={<IndividualPost serverURL={serverURL} checkToken={checkToken} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default RouteSwitch;