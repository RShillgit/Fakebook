import { useEffect } from 'react';
import './styles/App.css';

function App(props) {

  useEffect(() => {

    fetch(`${props.serverURL}`)
      .then(res => res.json())
      .then(data => console.log(data))

  }, [])

  return (
    <div className="App">
      <p>Odin Book</p>
    </div>
  );
}

export default App;
