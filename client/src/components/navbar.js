import { useCookies } from 'react-cookie';
import '../styles/navbar.css';

const Navbar = (props) => {

    const [cookie, setCookie, removeCookie] = useCookies(['token']);

    // Srolls to the top of the page
    const scrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

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
            <button onClick={scrollToTop}>Scroll To Top</button>

            <a href="/">
                <button>Home</button>
            </a>
            <a href='/friends'>
                <button>Friends</button>
            </a>

            <p>Logged in as user {props.userId}</p>
            <button onClick={userLogout}>Logout</button>
        </div>
    )

}
export default Navbar;