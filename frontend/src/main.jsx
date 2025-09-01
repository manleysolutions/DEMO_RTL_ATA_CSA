import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Dashboard from "./components/Dashboard.jsx";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Dashboard />);
