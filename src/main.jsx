import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PD1HubGate } from "./pd1hub.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PD1HubGate app="study">
      <App />
    </PD1HubGate>
  </React.StrictMode>
);
