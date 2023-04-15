import { useCookies } from 'react-cookie';
import '../styles/navbar.css';
import fakebookLogo from '../images/fakebook.png';
import homeImg from '../images/home.png';
import messengerImg from '../images/messenger.png';
import profileImg from '../images/user.png';
import logoutImg from '../images/logout.png';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const Navbar = (props) => {

    const [cookie, setCookie, removeCookie] = useCookies(['token']);
    const location = useLocation();
    const {profileId} = useParams();

    // Srolls to the top of the page
    const scrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    useEffect(() => {

        const homeButtonContainer = document.getElementById('homeButtonContainer'); 
        const messagesButtonContainer = document.getElementById('messagesButtonContainer'); 
        const profileButtonContainer = document.getElementById('profileButtonContainer'); 

        const navigationButtons = [homeButtonContainer, messagesButtonContainer, profileButtonContainer];
        
        // Remove "currentlyActive" class from all tabs
        navigationButtons.forEach(button => {
            if(button.classList.contains('currentlyActive')) {
                button.classList.remove('currentlyActive')
            }
        })

        // Add "currentlyActive" class to the active tab
        if (location.pathname === '/') {
            homeButtonContainer.classList.add('currentlyActive');
        }
        else if (location.pathname === '/messages') {
            messagesButtonContainer.classList.add('currentlyActive');
        }
        else if (location.pathname.includes("profile") && props.currentUser._id === profileId) {
            profileButtonContainer.classList.add('currentlyActive');
        }
    }, [])

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

            <div className='buttonContainer' id='homeButtonContainer'>
                <a href="/">
                    <img src={homeImg} alt='Home' />
                </a>
            </div>

            <div className='buttonContainer' id='messagesButtonContainer'>
                <a href='/messages'>
                    <img src={messengerImg} alt='Messages'/>
                </a>
            </div>

            <div className='buttonContainer' id='profileButtonContainer'>
                <a href={`/profile/${props.currentUser._id}`}>
                    <img src={profileImg} alt='Profile'/>
                </a>
            </div>

            <div className='buttonContainer' id='profileButtonContainer'>
                <button onClick={userLogout}>
                    <img src={logoutImg} alt='Log Out'/>
                    Log Out
                </button>
            </div>
        </div>
    )

}
export default Navbar;