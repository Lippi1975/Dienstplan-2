"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function go(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await createClient()
      .from("employees")
      .select("*")
      .eq("email", email)
      .eq("app_password", password)
      .single();

    if (error || !data) {
      setMsg("E-Mail oder Passwort falsch");
      return;
    }

    localStorage.setItem(
      "employee",
      JSON.stringify(data)
    );

    setMsg(
      `Login erfolgreich. Willkommen ${data.name}`
    );
  }

  return (
    <main className="container">
      
            <a
  href="https://dienstplan-2.vercel.app/"
  style={{
    textDecoration: "none",
  }}
>
  <button>
    ← Hauptmenü
  </button>
</a>
      <div className="card">

        <h1>Login</h1>

        <form onSubmit={go}>

          <p>
            <input
              type="email"
              placeholder="E-Mail"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </p>

          <p>
            <input
              type="password"
              placeholder="Passwort"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </p>

          <button
            className="primary"
            type="submit"
          >
            Anmelden
          </button>

        </form>

        <p>{msg}</p>

      </div>
    </main>
  );
}


//"use client";
//import {useState} from "react";
//import {createClient} from "@/lib/supabase";
//export default function Login(){const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[msg,setMsg]=useState("");
//async function go(e:React.FormEvent){e.preventDefault();
  //                                   const{error}=await createClient().auth.signInWithPassword({email,password});setMsg(error?error.message:"Login erfolgreich.");}
//return <main className="container"><div className="card"><h1>Login</h1>
  //<form onSubmit={go}><p><input type="email" placeholder="E-Mail" required value={email} onChange={e=>setEmail(e.target.value)}/></p>
    //<p><input type="password" placeholder="Passwort" required value={password} onChange={e=>setPassword(e.target.value)}/></p>
    //<button className="primary">Anmelden</button></form><p>{msg}</p>
//</div></main>}
