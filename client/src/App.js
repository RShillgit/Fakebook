import { useEffect, useRef, useState } from 'react';
import Loading from './components/loading';
import {useCookies} from 'react-cookie';
import './styles/App.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/navbar';

function App(props) {

  const [cookie, setCookie] = useCookies(['token']);
  const [auth, setAuth] = useState(null);
  const [display, setDisplay] = useState();
  const userId = useRef();
  const navigate = useNavigate();

  // Anytime the cookie changes, set auth
  useEffect(() => {

    (async () => {
      // If there is a token present, run checkToken function to see if its valid
      if(cookie.token) {
          const validToken = await props.checkToken(`${props.serverURL}`, cookie.token);
          userId.current = validToken.userToken.sub; // TODO: validToken Also includes iat & exp values
          setAuth(validToken.auth)
      }
      else setAuth(false);
    })()

  }, [cookie])

  // Anytime auth changes, set display
  useEffect(() => {

    // Loading
    if (auth === null) {
        setDisplay(<Loading />)
    }
    // If the user is authorized render page
    else if (auth === true) {
      setDisplay(
        <div>
          <Navbar userId={userId.current} serverURL={props.serverURL} />
          <h1>Logged in... Render home page & display feed</h1>
        </div>
      )
    }
    // Not Logged In redirect to login
    else {
      navigate('/login')
    }
  }, [auth])

  return (
    <div className='Page'>
      {display}
    </div>
  );
}

export default App;
