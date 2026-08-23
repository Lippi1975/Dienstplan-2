"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Branch = {
  id: number;
  name: string;
};

type Employee = {
  id: number;
  name: string;
};

export default function Schichten() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [filterBranch, setFilterBranch] = useState("alle");
  const [branch, setBranch] = useState(0);
  const [employee, setEmployee] = useState(0);
  const [shiftType, setShiftType] = useState("Früh");
  const [filterEmployee, setFilterEmployee] = useState("alle");
  const [filterDate, setFilterDate] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();

    const { data: branchData } = await supabase
      .from("branches")
      .select("id,name")
      .order("id");

    const { data: employeeData } = await supabase
      .from("employees")
      .select("id,name")
      .eq("active", true)
      .order("name");

    if (branchData) {
      setBranches(branchData);

      if (branchData.length > 0) {
        setBranch(branchData[0].id);
      }
    }

    if (employeeData) {
      setEmployees(employeeData);

      if (employeeData.length > 0) {
        setEmployee(employeeData[0].id);
      }
    }

    await loadShifts();
  }

  async function loadShifts() {
    const { data } = await createClient()
      .from("shifts")
      .select(`
        id,
        shift_date,
        shift_type,
        employee_id,
        branch_id,
        employees(name),
        branches(name)
      `)
      .order("shift_date", {
        ascending: false,
      });

    if (data) {
      setShifts(data);
    }
  }

  async function add() {
    const startTime =
      shiftType === "Früh"
        ? "08:00"
        : "14:30";

    const endTime =
      shiftType === "Früh"
        ? "12:30"
        : "18:00";

    const { error } = await createClient()
      .from("shifts")
      .upsert(
        {
          shift_date: date,
          branch_id: branch,
          employee_id: employee,
          shift_type: shiftType,
          start_time: startTime,
          end_time: endTime,
        },
        {
          onConflict:
            "shift_date,branch_id,shift_type",
        }
      );

    setMsg(
      error
        ? error.message
        : "Schicht gespeichert"
    );

    await loadShifts();
  }

  async function deleteShift(id: number) {
    await createClient()
      .from("shifts")
      .delete()
      .eq("id", id);

    await loadShifts();
  }

  async function updateEmployee(
    shiftId: number,
    employeeId: number
  ) {
    await createClient()
      .from("shifts")
      .update({
        employee_id: employeeId,
      })
      .eq("id", shiftId);

    await loadShifts();
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
        <h1>Schichten verwalten</h1>

        <div className="toolbar">

          <select
            value={branch}
            onChange={(e) =>
              setBranch(Number(e.target.value))
            }
          >
            {branches.map((b) => (
              <option
                key={b.id}
                value={b.id}
              >
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={employee}
            onChange={(e) =>
              setEmployee(Number(e.target.value))
            }
          >
            {employees.map((emp) => (
              <option
                key={emp.id}
                value={emp.id}
              >
                {emp.name}
              </option>
            ))}
          </select>

          <select
            value={shiftType}
            onChange={(e) =>
              setShiftType(e.target.value)
            }
          >
            <option value="Früh">
              Vormittag
            </option>
            <option value="Spät">
              Nachmittag
            </option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

          <button
            className="primary"
            onClick={add}
          >
            Schicht speichern
          </button>
        </div>

        <p>{msg}</p>
      </div>

      <div className="card">
        <h2>Gespeicherte Schichten</h2>
<div className="toolbar">

  <select
    value={filterBranch}
    onChange={(e) =>
      setFilterBranch(e.target.value)
    }
  >
    <option value="alle">
      Alle Filialen
    </option>

    {branches.map((b) => (
      <option
        key={b.id}
        value={b.name}
      >
        {b.name}
      </option>
    ))}
  </select>

  <select
    value={filterEmployee}
    onChange={(e) =>
      setFilterEmployee(e.target.value)
    }
  >
    <option value="alle">
      Alle Mitarbeiter
    </option>

    {employees.map((emp) => (
      <option
        key={emp.id}
        value={emp.name}
      >
        {emp.name}
      </option>
    ))}
  </select>

  <input
    type="date"
    value={filterDate}
    onChange={(e) =>
      setFilterDate(e.target.value)
    }
  />

</div>
{shifts
  .filter((s) => {
    const branchMatch =
      filterBranch === "alle" ||
      s.branches?.name === filterBranch;

    const employeeMatch =
      filterEmployee === "alle" ||
      s.employees?.name === filterEmployee;

    const dateMatch =
      !filterDate ||
      s.shift_date === filterDate;

    return (
      branchMatch &&
      employeeMatch &&
      dateMatch
    );
  })
  .map((s) => (
          <div
            key={s.id}
            className="shift"
          >
<strong>
  {new Date(s.shift_date).toLocaleDateString(
    "de-DE",
    {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  )}
</strong>

            <div>
              Filiale: {s.branches?.name}
            </div>

         <div>
  Schicht: {
    s.shift_type === "Früh"
      ? "Vormittag (08:00–12:30)"
      : "Nachmittag (14:30–18:00)"
  }
</div>

            <select
              value={s.employee_id}
              onChange={(e) =>
                updateEmployee(
                  s.id,
                  Number(e.target.value)
                )
              }
            >
              {employees.map((emp) => (
                <option
                  key={emp.id}
                  value={emp.id}
                >
                  {emp.name}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 10 }}>
              <button
                onClick={() =>
                  deleteShift(s.id)
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
