import { useEffect, useState } from 'react';
import Loading from './components/loading';
import {useCookies} from 'react-cookie';
import './styles/App.css';
import { useNavigate } from 'react-router-dom';

function App(props) {

  const [cookie, setCookie] = useCookies(['token']);
  const [auth, setAuth] = useState(null);
  const [display, setDisplay] = useState();
  const navigate = useNavigate();

  // Anytime the cookie changes, set auth
  useEffect(() => {

    (async () => {
      // If there is a token present, run checkToken function to see if its valid
      if(cookie.token) {
          const validToken = await props.checkToken(`${props.serverURL}/login`, cookie.token);
          setAuth(validToken)
      }
      else setAuth(false);
    })()

  }, [cookie])

  useEffect(() => {
    console.log(auth)

    // Loading
    if (auth === null) {
        setDisplay(<Loading />)
    }
    // If the user is authorized render page
    else if (auth === true) {
      setDisplay(
        <div>
          <h1>Logged in... Render home page</h1>
        </div>
      )
    }
    // Not Logged In redirect to login
    else {
      navigate('/login')
    }
  }, [auth])

  return (
    <div>
      {display}
    </div>
  );
}

export default App;
