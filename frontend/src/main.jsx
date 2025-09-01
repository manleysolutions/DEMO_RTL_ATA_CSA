import React from "react";
import ReactDOM from "react-dom/client";
import Dashboard from "./components/Dashboard.jsx";  // ✅ our new component
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
