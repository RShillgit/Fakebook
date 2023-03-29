import { useEffect, useState } from 'react';
import Loading from './components/loading';
import './styles/App.css';

function App(props) {

  const [auth, setAuth] = useState(null);

  useEffect(() => {

    fetch(`${props.serverURL}`)
      .then(res => res.json())
      .then(data => console.log(data))

  }, [])


  if (auth === null) {
    return <Loading />
  }
  if (auth) {
    return (
      <div>
        <h1>Authorized</h1>
      </div>
    )
  }

  return (
    <div className="App">
      <p>Odin Book</p>
    </div>
  );
}

export default App;
