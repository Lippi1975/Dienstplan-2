"use client";
import Link from "next/link";

const currentEmployee =
  typeof window !== "undefined"
    ? JSON.parse(
        localStorage.getItem("employee") ||
        "null"
      )
    : null;
export default function Home(){
  return <>
    <header className="top">
      <h1>Mein Dienstplan</h1>
      <p>2 Filialen · 6 Mitarbeiter</p>
    
    </header><main className="container">
      <div className="card">
        <h2>Start</h2>
        <p>Online-Prototyp für die Dienstplanung.</p>
        
        <div className="links">
          <Link href="/dienstplan">Dienstplan
          </Link>

           <Link href="/schichten">Schichten
          </Link>
          
          <Link href="/urlaub">Urlaub
          </Link>

          {currentEmployee?.role === "admin" && (
          <Link href="/mitarbeiter">Mitarbeiter
          </Link>
          )}

          {currentEmployee?.role === "admin" && (
          <Link href="/feiertage">Feiertage
          </Link>
          )}
          
          <Link href="/login">Login
          </Link>
        </div>
      </div>
    </main>
  </>}
