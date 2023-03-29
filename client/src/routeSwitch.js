import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./components/login";
import Profile from "./components/profile";

const RouteSwitch = () => {

    const serverURL = 'http://localhost:8000';

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App serverURL={serverURL} />} />
                <Route path="/login" element={<Login serverURL={serverURL} />} />
                <Route path="/profile/:id" element={<Profile serverURL={serverURL} />} />
            </Routes>
        </BrowserRouter>
    )
}

export default RouteSwitch;