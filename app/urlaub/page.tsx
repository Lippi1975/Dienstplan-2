"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Urlaub() {
  const supabase = createClient();
  const currentEmployee =
    typeof window !== "undefined"
    ? JSON.parse(
        localStorage.getItem("employee") ||
        "null"
      )
    : null;
  const [employees, setEmployees] = useState<any[]>([]);
  const [vacations, setVacations] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadEmployees();
    loadVacations();
  }, []);

  async function loadEmployees() {
    const { data } = await supabase
      .from("employees")
      .select("id,name")
      .eq("active", true)
      .order("name");

    if (data) setEmployees(data);
  }

async function loadVacations() {
  const { data } = await supabase
    .from("vacations")
    .select(`
      id,
      date_from,
      date_to,
      status,
      employee_id,
      employees (
        name
      )
    `)
    .order("date_from");

  if (data) setVacations(data);
}

async function saveVacation() {

  const employeeToSave =
    currentEmployee?.role === "admin"
      ? employeeId
      : currentEmployee.id;

  const { error } = await supabase
    .from("vacations")
    .insert({
      employee_id: employeeToSave,
      date_from: from,
      date_to: to,
      status: "genehmigt",
    });

  setMsg(
    error
      ? error.message
      : "Urlaub gespeichert"
  );

  if (!error) {
    loadVacations();
  }
}

  async function deleteVacation(id: number) {
    await supabase
      .from("vacations")
      .delete()
      .eq("id", id);

    loadVacations();
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
        <h1>Urlaub verwalten</h1>

        <label>Mitarbeiter</label>

{currentEmployee?.role === "admin" ? (

  <select
    value={employeeId}
    onChange={(e) =>
      setEmployeeId(e.target.value)
    }
  >
    <option value="">
      Bitte wählen
    </option>

    {employees.map((emp) => (
      <option
        key={emp.id}
        value={emp.id}
      >
        {emp.name}
      </option>
    ))}
  </select>

) : (

  <div
    style={{
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "6px",
    }}
  >
    {currentEmployee?.name}
  </div>

)}

         
        <div style={{ marginTop: 12 }}>
  <label>Von</label>

  <input
    type="date"
    value={from}
    onChange={(e) => setFrom(e.target.value)}
  />
</div>

<div style={{ marginTop: 12 }}>
  <label>Bis</label>

  <input
    type="date"
    value={to}
    onChange={(e) => setTo(e.target.value)}
  />
</div>

        <div style={{ marginTop: 16 }}>
          <button className="primary" onClick={saveVacation}>
            Urlaub speichern
          </button>
        </div>

        <p>{msg}</p>

        <hr />

        <h2>Urlaubsübersicht</h2>

        {vacations.map((v) => (
          <div key={v.id} className="card">
            <strong>
  {v.employees?.name ?? `Mitarbeiter #${v.employee_id}`}
</strong>

            <div>
  {v.date_from === v.date_to
    ? new Date(v.date_from).toLocaleDateString("de-DE")
    : `${new Date(v.date_from).toLocaleDateString("de-DE")} bis ${new Date(v.date_to).toLocaleDateString("de-DE")}`}
</div>

            {(
  currentEmployee?.role === "admin" ||
  currentEmployee?.id === v.employee_id
) && (
  <button
    onClick={() => deleteVacation(v.id)}
  >
    Löschen
  </button>
)}
          </div>
        ))}
      </div>
    </main>
  );
}
