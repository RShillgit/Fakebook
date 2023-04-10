import { useCookies } from 'react-cookie';
import '../styles/navbar.css';
import fakebookLogo from '../images/fakebook.png';
import homeImg from '../images/home.png';
import messengerImg from '../images/messenger.png';
import profileImg from '../images/user.png';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Navbar = (props) => {

    const [cookie, setCookie, removeCookie] = useCookies(['token']);
    const location = useLocation();

    // Srolls to the top of the page
    const scrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    useEffect(() => {
        console.log(location.pathname);
    })

    // Log user out by fetching backend logout function and removing token cookie
    const userLogout = (e) => {
        e.preventDefault();
        fetch(`${props.serverURL}/logout`)
            .then(() => {
                removeCookie('token', {path: '/'});
            })
    } 

    return (
        <div className="navbar">
            <img id='scrollToTopButton' onClick={scrollToTop} src={fakebookLogo} alt="Scroll To Top"/>

            <a href="/">
                <img src={homeImg} alt='Home' />
            </a>
            <a href='/messages'>
                <img src={messengerImg} alt='Messages'/>
            </a>

            <a href={`/profile/${props.currentUser._id}`}>
                <img src={profileImg} alt='Profile'/>
            </a>
            <button onClick={userLogout}>Logout</button>
        </div>
    )

}
export default Navbar;