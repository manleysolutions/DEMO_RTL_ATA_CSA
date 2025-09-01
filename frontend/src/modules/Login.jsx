import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass })
    });
    if (r.ok) onLogin();
    else setErr("Invalid credentials");
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth: 420, margin: "40px auto"}}>
        <div className="brand" style={{marginBottom: 12}}>
          <div className="logo">RT</div>
          <h1>Red Tag Lines</h1>
        </div>
        <form onSubmit={submit} className="site">
          <input className="field" placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} />
          <input className="field" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          {err && <div className="badge bad">{err}</div>}
          <button className="btn primary" type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}
