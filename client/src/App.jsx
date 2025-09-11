import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/")
      .then(res => res.text())
      .then(data => setMensaje(data));
  }, []);

  return <h1>{mensaje}</h1>;
}

export default App;