import React, { useState, useEffect } from "react";
import Login from "./modules/Login.jsx";
import Dashboard from "./modules/Dashboard.jsx";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check session status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/auth-check");
        if (res.ok) {
          setAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-200">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {!authenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}
