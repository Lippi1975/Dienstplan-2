//export default function Urlaub(){return <main className="container"><div className="card"><h1>Urlaub</h1><p>Urlaubsverwaltung folgt im nächsten Schritt.</p></div></main>}
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Urlaub() {
  const supabase = createClient();

  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const { data } = await supabase
      .from("employees")
      .select("id,name")
      .eq("active", true)
      .order("name");

    if (data) setEmployees(data);
  }

  async function saveVacation() {
    const { error } = await supabase.from("vacations").insert({
      employee_id: employeeId,
      date_from: from,
      date_to: to,
      status: "genehmigt"
    });

    setMsg(error ? error.message : "Urlaub gespeichert");
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Urlaub verwalten</h1>

        <label>Mitarbeiter</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">Bitte wählen</option>

          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        <label>Von</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <label>Bis</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        <div style={{ marginTop: 16 }}>
          <button className="primary" onClick={saveVacation}>
            Urlaub speichern
          </button>
        </div>

        <p>{msg}</p>
      </div>
    </main>
  );
}
