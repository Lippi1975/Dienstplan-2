"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Mitarbeiter() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const { data } = await createClient()
      .from("employees")
      .select("*")
      .order("name");

    if (data) {
      setEmployees(data);
    }
  }

  async function addEmployee() {
    if (!name) return;

    const { error } = await createClient()
      .from("employees")
      .insert({
        name,
        email,
        active: true,
      });

    setMsg(
      error
        ? error.message
        : "Mitarbeiter gespeichert"
    );

    setName("");
    setEmail("");

    loadEmployees();
  }

  async function deleteEmployee(id: number) {
    await createClient()
      .from("employees")
      .delete()
      .eq("id", id);

    loadEmployees();
  }

  async function toggleActive(
    id: number,
    active: boolean
  ) {
    await createClient()
      .from("employees")
      .update({
        active: !active,
      })
      .eq("id", id);

    loadEmployees();
  }
async function saveEmployee() {
  if (!editId) return;

  await createClient()
    .from("employees")
    .update({
      name: editName,
      email: editEmail,
    })
    .eq("id", editId);

  setEditId(null);
  loadEmployees();
}
  return (
    <main className="container">

      <div className="card">
        <h1>Mitarbeiter</h1>

        <div className="toolbar">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            placeholder="E-Mail"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <button
            className="primary"
            onClick={addEmployee}
          >
            Mitarbeiter speichern
          </button>
        </div>

        <p>{msg}</p>
      </div>

      <div className="card">
        <h2>Mitarbeiterliste</h2>

        {employees.map((emp) => (
          <div
            key={emp.id}
            className="shift"
          >
            <strong>
              {emp.name}
            </strong>

            <div>
              {emp.email || "-"}
            </div>

            <div>
              Status:
              {" "}
              {emp.active
                ? "✅ Aktiv"
                : "❌ Inaktiv"}
            </div>

            <div
              style={{
                marginTop: 10,
              }}
            >
              <button
                onClick={() =>
                  toggleActive(
                    emp.id,
                    emp.active
                  )
                }
              >
                {emp.active
                  ? "Deaktivieren"
                  : "Aktivieren"}
              </button>

              <button
                style={{
                  marginLeft: 10,
                }}
                onClick={() =>
                  deleteEmployee(emp.id)
                }
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
