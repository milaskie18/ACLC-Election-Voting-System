import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const backendUrl = "http://localhost:5000/api/message";

  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(backendUrl)
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);
  
  return (
     <div className="App">
       <h1>Message from Backend</h1>
       <h2>React + Node Connection test</h2>
       <p>{message}</p>
     </div>
  );
}

export default App;