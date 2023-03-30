import { useCookies } from 'react-cookie';
import '../styles/navbar.css';

const Navbar = (props) => {

    const [cookie, setCookie, removeCookie] = useCookies(['token']);
    const friendsUrl = `profile/${props.userId}/friends`

    // Log user out by fetching backend logout function and removing token cookie
    const userLogout = () => {
        fetch(`${props.serverUrl}/logout`)
            .then(() => {
                removeCookie('token');
            })
    } 

    return (
        <div className="navbar">
            <button>Scroll To Top</button>

            <a href="/">
                <button>Home</button>
            </a>
            <a href={friendsUrl}>
                <button>Friends</button>
            </a>

            <p>Logged in as user {props.userId}</p>
            <button onClick={userLogout}>Logout</button>
        </div>
    )

}
export default Navbar;