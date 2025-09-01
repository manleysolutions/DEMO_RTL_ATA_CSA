import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import Dashboard from "./components/Dashboard.jsx";

const root = createRoot(document.getElementById("root"));
root.render(<Dashboard />);
