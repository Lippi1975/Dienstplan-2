//export default function Urlaub(){return <main className="container"><div className="card"><h1>Urlaub</h1><p>Urlaubsverwaltung folgt im nächsten Schritt.</p></div></main>}
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Urlaub() {
  const supabase = createClient();

  const [employees, setEmployees] = useState<any[]>([]);
  const [employee, setEmployee] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .order("name");

    if (data) setEmployees(data);
  }

  async function save() {
    const { error } = await supabase.from("vacations").insert({
      employee_id: employee,
      start_date: start,
      end_date: end,
    });

    setMsg(error ? error.message : "Urlaub gespeichert");
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Urlaub</h1>

        <select
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
        >
          <option value="">Mitarbeiter wählen</option>

          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <br /><br />

        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />

        <br /><br />

        <button className="primary" onClick={save}>
          Urlaub speichern
        </button>

        <p>{msg}</p>
      </div>
    </main>
  );
}
